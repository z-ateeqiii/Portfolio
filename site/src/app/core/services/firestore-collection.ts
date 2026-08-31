import { firebaseConfig, isFirebaseConfigured } from '../firebase/firebase.config';

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
 * itself, after the caller's own. A caller cannot forget it and cannot replace
 * it, because callers do not pass constraints at all — they pass a plain
 * description of the query and this file builds it.
 *
 * Defence in depth: firestore.rules refuses draft reads server-side too. A
 * query with no rule is a suggestion; a rule with no query is a permission
 * error on every page load. Both, together, are the guarantee.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── Why the SDK is imported dynamically (Phase 8, 06 §7) ────────────────────
 * The Firestore SDK is ~468 kB raw / ~121 kB transferred. Importing it at
 * module scope put all of it in the INITIAL browser bundle, because the route
 * resolvers reference ContentService, which referenced this file, which
 * referenced `firebase/firestore`.
 *
 * The browser does not need any of it for the first paint: pages are
 * server-rendered and their data arrives through TransferState. It is only
 * needed for a client-side navigation that misses the transfer cache. So every
 * entry point below loads the SDK on demand, and the whole thing moves out of
 * the initial bundle.
 *
 * That is also why callers pass `QuerySpec` objects rather than the SDK's own
 * `QueryConstraint` values — a caller that had to build a `where(...)` would
 * have to import the SDK itself, putting it straight back where it was.
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
 * A query, described without referencing the Firebase SDK.
 *
 * Equality filters only — that is everything the public site needs (06 §3.1),
 * and keeping the surface small means the translation below stays obvious
 * enough to audit.
 */
export interface QuerySpec {
  /** Equality filters, e.g. `[['featuredOnHome', true]]`. */
  readonly equals?: readonly (readonly [field: string, value: unknown])[];
  /** Ascending sort field. */
  readonly orderBy?: string;
  /** Constrain to one document id — used for single-record reads. */
  readonly byId?: string;
}

/** Cached so the SDK is fetched once per session, not once per query. */
let sdkPromise: Promise<typeof import('firebase/firestore')> | null = null;
let appPromise: Promise<typeof import('firebase/app')> | null = null;

const APP_NAME = 'ateeqi-portfolio';

/**
 * The Firestore instance, or `null` while the project is unconfigured.
 *
 * Callers must handle `null` rather than assert it away — that branch is what
 * keeps an unconfigured or unreachable project from taking a page down (04 §1.2).
 */
async function store() {
  if (!isFirebaseConfigured()) return null;

  appPromise ??= import('firebase/app');
  sdkPromise ??= import('firebase/firestore');
  const [{ getApp, getApps, initializeApp }, fs] = await Promise.all([appPromise, sdkPromise]);

  const app = getApps().some((a) => a.name === APP_NAME)
    ? getApp(APP_NAME)
    : initializeApp(firebaseConfig, APP_NAME);

  return { fs, db: fs.getFirestore(app) };
}

/**
 * Firestore stores timestamps as `Timestamp`; domain models use `Date`.
 * Tolerates a missing or already-converted value, so a document written by the
 * seed script and one written by the dashboard need no different reader code.
 */
function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  const candidate = value as { toDate?: () => Date } | null;
  if (candidate && typeof candidate.toDate === 'function') return candidate.toDate();
  return undefined;
}

/**
 * Strips Firestore bookkeeping into a domain object.
 *
 * `status` is intentionally NOT carried through. Anything returned here has
 * already passed the published filter, so re-exposing the field would only
 * invite a redundant `@if (project.status === 'published')` in a template —
 * the UI-level check 05 §6 exists to make unnecessary.
 */
function hydrate<T>(id: string, data: Record<string, unknown>): T {
  const { status: _status, updatedAt, publishedAt, ...rest } = data;
  return {
    ...rest,
    id,
    updatedAt: toDate(updatedAt) ?? new Date(0),
    publishedAt: toDate(publishedAt),
  } as T;
}

/**
 * Retries a read once after a short pause (Phase 8, 10 §4d).
 *
 * A transient `permission-denied` was observed once during SSR on the first
 * request after a restart — not reproducible, and the same queries ran clean
 * immediately afterwards. The read layer caught it and returned `[]`, which is
 * the designed degradation, but the visible result is a page silently missing a
 * section with only a log line to say so.
 *
 * One retry, not a loop: if the second attempt fails too, the cause is not
 * transient and the page should render around the gap rather than hold the
 * response open.
 */
async function withRetry<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
  retry = true,
): Promise<T> {
  try {
    return await run();
  } catch (first) {
    if (!retry) return fallback;
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const value = await run();
      console.warn(`[firestore] "${label}" succeeded on retry after: ${String(first)}`);
      return value;
    } catch (second) {
      console.error(`[firestore] read failed for "${label}" (after one retry)`, second);
      return fallback;
    }
  }
}

/** Translates a QuerySpec into SDK constraints. */
function constraintsFor(fs: typeof import('firebase/firestore'), spec: QuerySpec) {
  const constraints = [];
  for (const [field, value] of spec.equals ?? []) constraints.push(fs.where(field, '==', value));
  if (spec.byId) constraints.push(fs.where(fs.documentId(), '==', spec.byId));
  if (spec.orderBy) constraints.push(fs.orderBy(spec.orderBy));
  return constraints;
}

/**
 * Reads a collection of editable entities, PUBLISHED ONLY.
 *
 * The status filter is appended here, after the caller's constraints, and there
 * is no parameter that can suppress it.
 */
export async function publishedQuery<T>(
  path: string,
  spec: QuerySpec = {},
  /**
   * Single-document lookups pass `false`.
   *
   * For a `byId` query, `permission-denied` is not a transient failure — it is
   * the answer: the document does not exist, or is not published. Retrying it
   * would add 250ms to every 404 on the site for no chance of a different
   * result. Collection reads keep the retry, because that is where the one
   * observed transient failure actually happened.
   */
  retry = true,
): Promise<T[]> {
  const context = await store();
  if (!context) return [];
  const { fs, db } = context;

  return withRetry<T[]>(
    path,
    async () => {
      const snap = await fs.getDocs(
        fs.query(
          fs.collection(db, path),
          ...constraintsFor(fs, spec),
          fs.where('status', '==', 'published'),
        ),
      );
      return snap.docs.map((doc) => hydrate<T>(doc.id, doc.data()));
    },
    [],
    retry,
  );
}

/**
 * Reads ONE published document by id.
 *
 * Deliberately a query constrained on `documentId()` rather than a `getDoc`:
 * `getDoc` would fetch the document and force a status check afterwards in
 * application code, which means a draft briefly exists in the client. As a
 * query, the draft is never returned at all — and the same rule that guards the
 * list view guards this path. Verified live: a documentId query for an
 * unpublished or absent document returns `permission-denied`, so the rule is
 * evaluated against the document, not merely the query shape.
 */
export async function publishedDoc<T>(path: string, id: string): Promise<T | null> {
  const [found] = await publishedQuery<T>(path, { byId: id }, false);
  return found ?? null;
}

/**
 * Reads a collection with no publish workflow of its own — Skill,
 * SocialPlatform, BusinessVenture, ProofPoint, Media (04 §5–§7, §9, §11).
 *
 * 04 §12 scopes the draft/publish state to Project, Experience and Profile.
 * Media is the deliberate case: it inherits its parent project's state, so a
 * draft project hides its screenshots by never being fetched in the first place.
 */
export async function referenceQuery<T>(path: string, spec: QuerySpec = {}): Promise<T[]> {
  const context = await store();
  if (!context) return [];
  const { fs, db } = context;

  return withRetry<T[]>(
    path,
    async () => {
      const snap = await fs.getDocs(fs.query(fs.collection(db, path), ...constraintsFor(fs, spec)));
      return snap.docs.map((doc) => hydrate<T>(doc.id, doc.data()));
    },
    [],
  );
}
