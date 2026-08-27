import {
  DocumentData,
  QueryConstraint,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  documentId,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../firebase/firebase';

/**
 * Shared Firestore read layer for the PUBLIC site.
 *
 * ─── The one rule this file exists to enforce ────────────────────────────────
 * Public reads always filter `status == 'published'` (06 §3.1, 05 §6, 09 §3).
 * Draft content is structurally excluded from what the public site can fetch —
 * it is never shipped to the browser and then hidden.
 *
 * That rule is enforced by construction: `publishedQuery` is the only exported
 * way to read an editable collection, and it appends the status constraint
 * itself. A caller cannot forget it, and a caller cannot pass a different one,
 * because the constraint is added after the caller's own.
 *
 * Defence in depth: firestore.rules refuses draft reads server-side too. This
 * layer keeps the client honest; the rules make it enforceable. Neither alone
 * is sufficient — a query with no rule is a suggestion, and a rule with no
 * query is a permission error on every page load.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Collection paths, exactly as laid out in 06 §3.1. */
export const COLLECTIONS = {
  profile: 'profile',
  projects: 'projects',
  experience: 'experience',
  skills: 'skills',
  socialPlatforms: 'socialPlatforms',
  socialVideos: 'socialVideos',
  businessVentures: 'businessVentures',
  education: 'education',
  proofPoints: 'proofPoints',
} as const;

/** The single Profile document id (04 §2 — singleton, edited not created). */
export const PROFILE_DOC_ID = 'singleton';

/** Media is a subcollection under its project (06 §3.1). */
export function mediaPath(slug: string): string {
  return `${COLLECTIONS.projects}/${slug}/media`;
}

/**
 * Firestore stores timestamps as `Timestamp`; domain models use `Date`
 * (see core/models/content-status.ts). Convert once, here.
 *
 * Tolerates a missing or already-converted value: a document written by the
 * seed script through the Admin SDK and one written by the dashboard through
 * the Web SDK should not need different reader code.
 */
function toDate(value: unknown): Date | undefined {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return undefined;
}

/**
 * Strips Firestore bookkeeping into a domain object.
 *
 * `status` is intentionally NOT carried through. Anything this function returns
 * has already passed the published filter, so re-exposing the field would only
 * invite a redundant `@if (project.status === 'published')` in a template —
 * the UI-level check that 05 §6 is specifically trying to make unnecessary.
 */
function hydrate<T>(snap: QueryDocumentSnapshot<DocumentData>): T {
  const { status: _status, updatedAt, publishedAt, ...rest } = snap.data();
  return {
    ...rest,
    id: snap.id,
    updatedAt: toDate(updatedAt) ?? new Date(0),
    publishedAt: toDate(publishedAt),
  } as T;
}

/**
 * Reads a collection of editable entities, published only.
 *
 * Returns `[]` — never throws — when Firebase is unconfigured (10 §4a) or a
 * read fails. Missing content must never break a page (04 §1.2); a portfolio
 * that renders a section empty is recoverable, one that white-screens is not.
 */
export async function publishedQuery<T>(
  path: string,
  ...constraints: readonly QueryConstraint[]
): Promise<T[]> {
  const store = db();
  if (!store) return [];

  try {
    const snap = await getDocs(
      query(collection(store, path), ...constraints, where('status', '==', 'published')),
    );
    return snap.docs.map((doc) => hydrate<T>(doc));
  } catch (error) {
    console.error(`[firestore] read failed for "${path}"`, error);
    return [];
  }
}

/**
 * Reads ONE published document by id.
 *
 * Deliberately a query constrained on `documentId()` rather than a `getDoc`:
 * `getDoc` would fetch the document first and force a status check afterwards
 * in application code, which means a draft document briefly exists in the
 * client. Expressed as a query, the draft is never returned at all — and the
 * same security rule that guards the list view guards this path too.
 *
 * Returns `null` when absent, unpublished, or unreachable.
 */
export async function publishedDoc<T>(path: string, id: string): Promise<T | null> {
  const [found] = await publishedQuery<T>(path, where(documentId(), '==', id));
  return found ?? null;
}

/**
 * Reads a collection that has no publish workflow of its own — Skill,
 * SocialPlatform, BusinessVenture, ProofPoint, Media (04 §5–§7, §9, §11).
 *
 * These are reference data, not narrative content: 04 §12 scopes the
 * draft/publish state to Project, Experience and Profile. Media is the
 * deliberate case — it inherits its parent project's state, so a draft project
 * hides its screenshots by never being fetched in the first place.
 */
export async function referenceQuery<T>(
  path: string,
  ...constraints: readonly QueryConstraint[]
): Promise<T[]> {
  const store = db();
  if (!store) return [];

  try {
    const snap = await getDocs(query(collection(store, path), ...constraints));
    return snap.docs.map((doc) => hydrate<T>(doc));
  } catch (error) {
    console.error(`[firestore] read failed for "${path}"`, error);
    return [];
  }
}
