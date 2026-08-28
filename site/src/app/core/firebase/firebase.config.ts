import { FirebaseOptions } from 'firebase/app';

/**
 * Firebase project configuration (06 §3). Connected 2026-08-27.
 *
 * Project: ateeqi-portfolio — Firestore (production mode, europe-west3),
 * Auth (Email/Password + Google), Hosting.
 *
 * Firestore + Auth only. Firebase Storage was dropped from the architecture on
 * 2026-08-28 (06 §3.2); images and the resume live in Cloudinary instead. The
 * `storageBucket` value below stays because it is part of the web config the
 * console hands out, but nothing in this codebase initialises the Storage SDK.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS NOT A SECRET, and is tracked in git deliberately.
 *
 * A Firebase *web* config is a public client identifier, not a credential — it
 * ships inside the JS bundle of every Firebase web app and is readable by any
 * visitor. What actually protects the data is firestore.rules plus Auth, which
 * is why those are written and deployed rather than treated as an afterthought.
 * Ignoring this file would imply the opposite and break the build for anyone
 * cloning the repo.
 *
 * Service-account keys ARE secrets and are gitignored; none is used here.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyDDB0thn5htoqjF1CIqHpdBOOvZmjmR-n4',
  authDomain: 'ateeqi-portfolio.firebaseapp.com',
  projectId: 'ateeqi-portfolio',
  storageBucket: 'ateeqi-portfolio.firebasestorage.app',
  messagingSenderId: '72600597000',
  appId: '1:72600597000:web:c77455207e4a6a8322d7bd',

  // Present because it is part of the project's web config, but inert: nothing
  // in this codebase imports getAnalytics, so no Analytics SDK is initialised.
  // Analytics tooling is deliberately deferred and kept independent of this
  // architecture (06 §9, 10 §4) — the choice of a lightweight, privacy-
  // respecting tool has not been made yet. Wiring it up is a decision to take,
  // not a snippet to paste in from the Firebase setup screen.
  measurementId: 'G-0HETKQY51X',
};

/**
 * Guard used by the data layer so that an unconfigured project degrades to
 * "no content" rather than an unhandled initialisation error. Missing content
 * must never break a page (04 §1.2).
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
}
