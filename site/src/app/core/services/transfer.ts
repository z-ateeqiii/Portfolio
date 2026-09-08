import { TransferState, inject, makeStateKey } from '@angular/core';
import { ResolveFn } from '@angular/router';

/**
 * Wraps a resolver so its result crosses from server render to client hydration
 * instead of being fetched twice.
 *
 * Angular's built-in hydration transfer cache only covers `HttpClient`. The
 * Firestore SDK does not use HttpClient, so nothing about these reads is
 * transferred automatically — without this wrapper, the browser re-runs every
 * resolver against Firestore immediately after hydrating HTML that already
 * contains the answer. 06 §7 asks for Firestore reads on public routes to be
 * minimal per page load; paying for each one twice is the opposite.
 *
 * Keys must be unique per resolver. They are namespaced below at the call site.
 */
export function transferred<T>(key: string, fetch: () => Promise<T>): ResolveFn<T> {
  const stateKey = makeStateKey<T>(`resolve:${key}`);

  return () => {
    const transferState = inject(TransferState);

    if (transferState.hasKey(stateKey)) {
      const cached = transferState.get(stateKey, null as T);
      /**
       * Consumed once. A later client-side navigation back to this route should
       * fetch fresh data rather than replay a snapshot taken when the page was
       * first served — otherwise content published in the meantime would stay
       * invisible for the life of the tab.
       */
      transferState.remove(stateKey);
      return reviveDates(cached);
    }

    return fetch().then((value) => {
      transferState.set(stateKey, value);
      return value;
    });
  };
}

/**
 * Strict ISO-8601 instant: `2026-08-28T15:05:27.925Z` or a `+03:00` offset.
 *
 * Deliberately anchored and complete. A date-only string, a slug, a URL or a
 * sentence of prose cannot match it, which is what makes it safe to apply to
 * every string in a payload rather than to a list of known field names.
 */
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * Restores Dates that JSON destroyed on the way across (10 §4o).
 *
 * ─── The bug this exists for ─────────────────────────────────────────────────
 * TransferState serialises to JSON, and JSON has no date type. A `Date` that
 * `hydrate()` built on the server arrives in the browser as a STRING. Every
 * model still declares the field as `Date`, so TypeScript keeps agreeing that
 * it is one and the compiler can never catch the difference — the type is
 * accurate on the server and a lie after hydration.
 *
 * It surfaced as `project.publishedAt.toISOString is not a function`, thrown
 * from `SeoService.caseStudySchema` inside `CaseStudy.ngOnInit`. Because it
 * threw during hydration, Angular abandoned the component and the case study
 * rendered blank in the browser even though the server-rendered HTML for the
 * same URL was complete — which is exactly why curl-ing the SSR output kept
 * reporting these pages as fine.
 *
 * ─── Why here, and why by shape ──────────────────────────────────────────────
 * Fixing `caseStudySchema` to accept a string would have fixed one call site
 * and left the same trap set for every other consumer of transferred data. The
 * boundary is the only place where the corruption is introduced, so it is the
 * only place worth repairing: past this function the declared types are true
 * again and nothing downstream has to know that a transfer happened.
 *
 * Matching on the VALUE's shape rather than on a list of field names is the
 * other half of that. A name list (`updatedAt`, `publishedAt`,
 * `lastVerifiedDate`) has to be found and extended by whoever adds the next
 * date field, and they will not know to — the compiler will not tell them, and
 * SSR will not either. Shape-matching covers fields that do not exist yet.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function reviveDates<T>(value: T): T {
  if (typeof value === 'string') {
    return (ISO_INSTANT.test(value) ? new Date(value) : value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as T;
  }

  /**
   * `Date` is excluded explicitly: on the server the payload was never
   * serialised, so it still holds real Dates, and spreading one into a plain
   * object would quietly turn it into `{}`.
   */
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const revived: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      revived[key] = reviveDates(item);
    }
    return revived as T;
  }

  return value;
}
