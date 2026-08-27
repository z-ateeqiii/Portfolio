import { FirebaseOptions } from 'firebase/app';

/**
 * Firebase project configuration (06 §3).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NOT YET CONNECTED. These values are intentionally empty.
 *
 * Per 09 §3 ("never invent a fact") and 08 §5, no placeholder project id, API
 * key or bucket name has been guessed here — a plausible-looking wrong value
 * fails at runtime in a far more confusing way than an obviously empty one.
 *
 * To connect: create the Firebase project (Firestore, Storage, Auth, Hosting),
 * then paste the web app config below. Nothing else in the codebase needs to
 * change — `isFirebaseConfigured()` flips to true and the data layer built in
 * Phase 2 starts against a real project.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

/**
 * Guard used by the data layer so that an unconfigured project degrades to
 * "no content" rather than an unhandled initialisation error. Missing content
 * must never break a page (04 §1.2).
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
}
