import { Injectable } from '@angular/core';
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';

import { db } from '../firebase/firebase';

/**
 * The Draft → Preview → Publish state machine (05 §2), and every admin write.
 *
 * ─── How drafts are stored, and why not on the live document ─────────────────
 * A pending edit lives in its own top-level `drafts/` collection, keyed
 * `{entity}__{id}`. The live document is never touched until Publish.
 *
 * 04 §12 originally gave each document a single `status` field, which cannot
 * represent "live AND has unpublished edits waiting" — editing a live project
 * would have flipped it to `draft` and pulled it off the site until
 * republished, the opposite of 05 §2's "the live site is unaffected".
 *
 * The draft could not live as a field on the live document either: Firestore
 * rules grant or deny whole documents and cannot hide a field, so an unfinished
 * sentence sitting in a `draft` map would be readable by anyone who opened a
 * browser console. 05 §6 requires unpublished to actually mean unpublished, so
 * drafts are a separate collection with admin-only rules. Approved 2026-08-28;
 * recorded in 04 §12 and 10 §4e.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every method returns rather than throws on a missing Firestore, matching the
 * read layer — an unconfigured project degrades instead of crashing (04 §1.2).
 */

/** Collections that carry the Draft → Publish workflow (04 §12). */
export type DraftableEntity = 'profile' | 'projects' | 'experience';

/** Collections edited directly — reference data, no workflow (04 §12). */
export type DirectEntity =
  | 'skills'
  | 'socialPlatforms'
  | 'businessVentures'
  | 'education'
  | 'proofPoints';

export interface DraftRecord<T = DocumentData> {
  readonly entity: DraftableEntity;
  readonly docId: string;
  readonly data: T;
  readonly updatedAt: Date;
  /** False when the live document does not exist yet — a first publish. */
  readonly hasLive: boolean;
}

const DRAFTS = 'drafts';

function draftId(entity: DraftableEntity, docId: string): string {
  return `${entity}__${docId}`;
}

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : value instanceof Date ? value : new Date(0);
}

function hydrate<T>(snap: QueryDocumentSnapshot<DocumentData>): T {
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    updatedAt: toDate(data['updatedAt']),
    publishedAt: data['publishedAt'] ? toDate(data['publishedAt']) : undefined,
  } as T;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  // ── Admin reads ───────────────────────────────────────────────────────────
  // These deliberately do NOT filter on status. The dashboard must see
  // unpublished records; the public read layer must never. Keeping the two in
  // separate services is what stops a published-only filter being dropped from
  // a public query by accident (05 §6).

  async list<T>(path: string, sortBy?: string): Promise<T[]> {
    const store = db();
    if (!store) return [];
    try {
      const ref = collection(store, path);
      const snap = await getDocs(sortBy ? query(ref, orderBy(sortBy)) : query(ref));
      return snap.docs.map((d) => hydrate<T>(d));
    } catch (error) {
      console.error(`[admin] list failed for "${path}"`, error);
      return [];
    }
  }

  async get<T>(path: string, id: string): Promise<T | null> {
    const store = db();
    if (!store) return null;
    try {
      const snap = await getDoc(doc(store, path, id));
      return snap.exists() ? hydrate<T>(snap as QueryDocumentSnapshot<DocumentData>) : null;
    } catch (error) {
      console.error(`[admin] get failed for "${path}/${id}"`, error);
      return null;
    }
  }

  // ── Draft workflow (05 §2) ────────────────────────────────────────────────

  /**
   * Saves a pending edit. The live document is not touched.
   *
   * `id` for a not-yet-created record is chosen by the caller (a slug for a
   * project, the singleton id for the profile) so that a draft and the eventual
   * live document share an identity from the start.
   */
  async saveDraft<T extends DocumentData>(
    entity: DraftableEntity,
    docId: string,
    data: T,
  ): Promise<void> {
    const store = db();
    if (!store) throw new Error('Firebase is not configured.');

    await setDoc(doc(store, DRAFTS, draftId(entity, docId)), {
      entity,
      docId,
      data,
      updatedAt: Timestamp.now(),
    });
  }

  async getDraft<T>(entity: DraftableEntity, docId: string): Promise<DraftRecord<T> | null> {
    const store = db();
    if (!store) return null;
    try {
      const snap = await getDoc(doc(store, DRAFTS, draftId(entity, docId)));
      if (!snap.exists()) return null;
      const raw = snap.data();
      const live = await getDoc(doc(store, entity, docId));
      return {
        entity,
        docId,
        data: raw['data'] as T,
        updatedAt: toDate(raw['updatedAt']),
        hasLive: live.exists(),
      };
    } catch (error) {
      console.error(`[admin] getDraft failed for "${entity}/${docId}"`, error);
      return null;
    }
  }

  /** Every pending draft, for the Overview's "what's in draft" (05 §3.1). */
  async listDrafts(): Promise<DraftRecord[]> {
    const store = db();
    if (!store) return [];
    try {
      const snap = await getDocs(collection(store, DRAFTS));
      return snap.docs.map((d) => {
        const raw = d.data();
        return {
          entity: raw['entity'] as DraftableEntity,
          docId: raw['docId'] as string,
          data: raw['data'] as DocumentData,
          updatedAt: toDate(raw['updatedAt']),
          hasLive: true,
        };
      });
    } catch (error) {
      console.error('[admin] listDrafts failed', error);
      return [];
    }
  }

  /**
   * Publish: copy the draft over the live document, then delete the draft.
   *
   * `publishedAt` is set only on a FIRST publish. Overwriting it on every
   * subsequent edit would erase when the content actually went public and turn
   * the field into a duplicate of `updatedAt`.
   *
   * Not a transaction: this is a single-admin tool with exactly one writer
   * (05 §1), so there is no concurrent publish to race against. Adding
   * transaction machinery here would be the "just in case" infrastructure
   * 09 §3 rules out.
   */
  async publish(entity: DraftableEntity, docId: string): Promise<void> {
    const store = db();
    if (!store) throw new Error('Firebase is not configured.');

    const draft = await this.getDraft<DocumentData>(entity, docId);
    if (!draft) throw new Error('There is no draft to publish.');

    const liveRef = doc(store, entity, docId);
    const live = await getDoc(liveRef);
    const now = Timestamp.now();
    const existingPublishedAt = live.exists() ? live.data()['publishedAt'] : undefined;

    await setDoc(liveRef, {
      ...draft.data,
      status: 'published',
      updatedAt: now,
      publishedAt: existingPublishedAt ?? now,
    });

    await deleteDoc(doc(store, DRAFTS, draftId(entity, docId)));
  }

  /** Throw the pending edit away. The live document was never touched. */
  async discardDraft(entity: DraftableEntity, docId: string): Promise<void> {
    const store = db();
    if (!store) throw new Error('Firebase is not configured.');
    await deleteDoc(doc(store, DRAFTS, draftId(entity, docId)));
  }

  // ── Direct writes (04 §12: reference data has no workflow) ────────────────

  /**
   * Skills, social platforms, ventures, education and proof points save
   * straight to the live document.
   *
   * That is not an inconsistency: 04 §12 scopes the Draft/Publish workflow to
   * Project, Experience and Profile. A skill name or a follower count is either
   * correct or absent — there is no half-written state worth protecting a
   * visitor from, and 05 §3.6 asks for the skills form specifically to be the
   * lowest-friction one in the dashboard.
   */
  async saveDirect<T extends DocumentData>(
    entity: DirectEntity,
    docId: string,
    data: T,
  ): Promise<void> {
    const store = db();
    if (!store) throw new Error('Firebase is not configured.');
    await setDoc(doc(store, entity, docId), data);
  }

  /**
   * Writes to an arbitrary path.
   *
   * Media lives in a subcollection (`projects/{slug}/media`), so it cannot be
   * addressed by the flat entity name `saveDirect` takes. Kept separate rather
   * than loosening `saveDirect`'s type, so the entity-name path stays typed and
   * only the genuinely nested case takes a string.
   */
  async saveAtPath<T extends DocumentData>(
    path: string,
    docId: string,
    data: T,
  ): Promise<void> {
    const store = db();
    if (!store) throw new Error('Firebase is not configured.');
    await setDoc(doc(store, path, docId), data);
  }

  async remove(path: string, docId: string): Promise<void> {
    const store = db();
    if (!store) throw new Error('Firebase is not configured.');
    await deleteDoc(doc(store, path, docId));
  }
}
