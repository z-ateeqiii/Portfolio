import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Auth,
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { firebaseApp } from '../firebase/firebase';

/**
 * Single-admin authentication (05 §1, 06 §3.3).
 *
 * ─── Scope discipline ────────────────────────────────────────────────────────
 * There is exactly one account and no public sign-up anywhere on the site.
 * So there is no role model here, no claims check, no permissions map, and no
 * user record in Firestore — "authenticated or not" is the entire model, which
 * is what 05 §1 asks for and what 09 §3 forbids expanding "just in case".
 *
 * The matching firestore.rules say the same thing (`request.auth != null`), so
 * the client and the server agree on what an admin is.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Both providers enabled on the project are supported: email/password and
 * Google. 06 §3.3 says either is sufficient, so both are offered rather than
 * one being picked arbitrarily — recovering access to a personal project years
 * later is easier with two doors.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _user = signal<User | null>(null);
  /**
   * Null until the first auth state callback fires. Distinguishing "not yet
   * known" from "definitely signed out" is what stops the guard bouncing an
   * already-signed-in admin to the login screen on a page refresh.
   */
  private readonly _resolved = signal(false);

  readonly user = this._user.asReadonly();
  readonly resolved = this._resolved.asReadonly();
  readonly isSignedIn = computed(() => this._user() !== null);

  constructor() {
    /**
     * Auth never initialises during SSR. /admin is client-rendered only
     * (06 §2, §4), so there is no server-side session to restore and no reason
     * to pull the Auth SDK into a server render.
     */
    if (this.isBrowser) {
      const auth = this.auth();
      if (auth) {
        onAuthStateChanged(auth, (user) => {
          this._user.set(user);
          this._resolved.set(true);
        });
      } else {
        this._resolved.set(true);
      }
    }
  }

  private auth(): Auth | null {
    const app = firebaseApp();
    return app ? getAuth(app) : null;
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    const auth = this.auth();
    if (!auth) throw new Error('Firebase is not configured.');
    await signInWithEmailAndPassword(auth, email, password);
  }

  async signInWithGoogle(): Promise<void> {
    const auth = this.auth();
    if (!auth) throw new Error('Firebase is not configured.');
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async signOut(): Promise<void> {
    const auth = this.auth();
    if (auth) await signOut(auth);
  }

  /** Resolves once the initial auth state is known — used by the guard. */
  whenResolved(): Promise<void> {
    if (this._resolved()) return Promise.resolve();
    return new Promise((resolve) => {
      const auth = this.auth();
      if (!auth) return resolve();
      const stop = onAuthStateChanged(auth, () => {
        stop();
        resolve();
      });
    });
  }
}
