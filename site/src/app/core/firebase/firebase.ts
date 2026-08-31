import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

import { firebaseConfig, isFirebaseConfigured } from './firebase.config';

/**
 * Firebase runtime access (06 §3).
 *
 * ─── Everything here is dynamically imported (Phase 8, 06 §7) ────────────────
 * The type imports above are erased at compile time, so this module pulls no
 * Firebase code into whatever imports it. The SDK is fetched only when someone
 * actually asks for the app or the database.
 *
 * That matters because the auth guard is referenced from app.routes.ts, which
 * is in the initial bundle — a static import here would have put the entire
 * Firebase SDK in front of the first paint, on a site that is server-rendered
 * specifically so the first paint needs no client data.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Initialisation stays lazy and guarded for the original reasons too: an
 * unconfigured project must degrade to "no content" rather than crash on boot
 * (04 §1.2), and SSR should not initialise Firebase for a request that never
 * needs it.
 *
 * @angular/fire is deliberately unused — its current release is peer-capped at
 * Angular 20 (10 §4a). The modular Web SDK behind typed services is what 09 §5
 * asks for anyway.
 */

const APP_NAME = 'ateeqi-portfolio';

let appPromise: Promise<FirebaseApp | null> | null = null;

/**
 * The shared Firebase app, or null while unconfigured.
 *
 * Shared deliberately: Auth and Firestore must use the SAME app instance, or
 * they get separate sessions and an admin signed in for Auth would still be
 * anonymous to Firestore's security rules.
 */
export function firebaseApp(): Promise<FirebaseApp | null> {
  if (!isFirebaseConfigured()) return Promise.resolve(null);

  appPromise ??= (async () => {
    const { getApp, getApps, initializeApp } = await import('firebase/app');
    return getApps().some((a) => a.name === APP_NAME)
      ? getApp(APP_NAME)
      : initializeApp(firebaseConfig, APP_NAME);
  })();

  return appPromise;
}

/**
 * The Firestore instance, or `null` while the project is unconfigured.
 *
 * Callers must handle `null` rather than assert it away — that single branch is
 * what keeps an unconfigured or unreachable project from taking a page down.
 */
export async function db(): Promise<Firestore | null> {
  const app = await firebaseApp();
  if (!app) return null;
  const { getFirestore } = await import('firebase/firestore');
  return getFirestore(app);
}
