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
      return cached;
    }

    return fetch().then((value) => {
      transferState.set(stateKey, value);
      return value;
    });
  };
}
