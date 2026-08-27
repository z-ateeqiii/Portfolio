import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';

import { firebaseConfig, isFirebaseConfigured } from './firebase.config';

/**
 * Firebase runtime access (06 §3).
 *
 * Initialisation is LAZY and GUARDED, for two reasons that both matter here:
 *
 * 1. The project does not exist yet (10 §4a). Until its config is filled in,
 *    every accessor below returns `null` and the services in core/services
 *    degrade to empty results — so the site renders as "no content yet"
 *    instead of crashing on boot (04 §1.2).
 * 2. This app is server-rendered (06 §2). Initialising at module load would
 *    run during SSR whether or not a request needs data.
 *
 * @angular/fire is deliberately not used — its current release is peer-capped
 * at Angular 20 (10 §4a, resolved). The modular Web SDK behind typed services
 * is what 09 §5 asks for anyway.
 */

const APP_NAME = 'ateeqi-portfolio';

function app(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  return getApps().some((a) => a.name === APP_NAME)
    ? getApp(APP_NAME)
    : initializeApp(firebaseConfig, APP_NAME);
}

/**
 * The Firestore instance, or `null` while the project is unconfigured.
 *
 * Callers must handle `null` rather than assert it away. That is the single
 * branch that keeps an unconfigured (or misconfigured) project from taking a
 * page down with it.
 */
export function db(): Firestore | null {
  const instance = app();
  return instance ? getFirestore(instance) : null;
}
