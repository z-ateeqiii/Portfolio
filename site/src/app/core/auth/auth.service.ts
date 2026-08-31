import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import type { Auth, User } from 'firebase/auth';

import { firebaseApp } from '../firebase/firebase';

/**
 * Single-admin authentication (05 §1, 06 §3.3).
 *
 * ─── Scope discipline ────────────────────────────────────────────────────────
 * There is exactly one account and no public sign-up anywhere on the site. So
 * there is no role model here, no claims check, no permissions map, and no user
 * record in Firestore — "authenticated or not" is the entire model, which is
 * what 05 §1 asks for and what 09 §3 forbids expanding "just in case".
 *
 * firestore.rules says the same thing (`request.auth != null`), so the client
 * and the server agree on what an admin is.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── The SDK is dynamically imported (Phase 8, 06 §7) ────────────────────────
 * `authGuard` is referenced from app.routes.ts, which is in the initial bundle.
 * A static `firebase/auth` import here therefore shipped the Auth SDK — and,
 * through the shared app module, Firestore — to every visitor before the first
 * paint, including the overwhelming majority who will never see /admin.
 *
 * The type imports above are erased at compile time; the runtime import happens
 * only when something actually asks about auth state.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Both enabled providers are supported: email/password and Google. 06 §3.3 says
 * either is sufficient, so both are offered rather than one picked arbitrarily
 * — recovering access to a personal project years later is easier with two doors.
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

  private authPromise: Promise<Auth | null> | null = null;

  /**
   * Loads the Auth SDK once and starts listening. Never runs during SSR:
   * /admin is client-rendered only (06 §2, §4), so there is no server-side
   * session to restore.
   */
  private auth(): Promise<Auth | null> {
    if (!this.isBrowser) return Promise.resolve(null);

    this.authPromise ??= (async () => {
      const [{ getAuth, onAuthStateChanged }, app] = await Promise.all([
        import('firebase/auth'),
        firebaseApp(),
      ]);
      if (!app) {
        this._resolved.set(true);
        return null;
      }
      const auth = getAuth(app);
      onAuthStateChanged(auth, (user) => {
        this._user.set(user);
        this._resolved.set(true);
      });
      return auth;
    })();

    return this.authPromise;
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    const [auth, { signInWithEmailAndPassword }] = await Promise.all([
      this.auth(),
      import('firebase/auth'),
    ]);
    if (!auth) throw new Error('Firebase is not configured.');
    await signInWithEmailAndPassword(auth, email, password);
  }

  async signInWithGoogle(): Promise<void> {
    const [auth, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([
      this.auth(),
      import('firebase/auth'),
    ]);
    if (!auth) throw new Error('Firebase is not configured.');
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async signOut(): Promise<void> {
    const [auth, { signOut }] = await Promise.all([this.auth(), import('firebase/auth')]);
    if (auth) await signOut(auth);
  }

  /**
   * Resolves once the initial auth state is known — awaited by the guard, so a
   * refresh inside the dashboard never bounces a signed-in admin to login.
   */
  async whenResolved(): Promise<void> {
    const auth = await this.auth();
    if (!auth || this._resolved()) return;

    const { onAuthStateChanged } = await import('firebase/auth');
    await new Promise<void>((resolve) => {
      const stop = onAuthStateChanged(auth, () => {
        stop();
        resolve();
      });
    });
  }
}
