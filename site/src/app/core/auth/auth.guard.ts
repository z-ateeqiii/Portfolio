import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Guards every /admin route (05 §6, 06 §4).
 *
 * Waits for the initial auth state before deciding. Without that wait, a page
 * refresh inside the dashboard would evaluate the guard before Firebase had
 * restored the session, bounce the admin to the login screen, and then sign
 * them straight back in — a logout that never happened.
 *
 * This guard is a convenience, not the security boundary. The real boundary is
 * firestore.rules: a signed-out visitor who reaches an /admin URL sees an empty
 * form, because every read and write behind it is refused server-side. Guards
 * run in the browser and can always be stepped around; rules cannot.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.whenResolved();
  if (auth.isSignedIn()) return true;

  return router.createUrlTree(['/admin/login'], {
    queryParams: { next: state.url },
  });
};

/** Keeps a signed-in admin from landing back on the login screen. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.whenResolved();
  return auth.isSignedIn() ? router.createUrlTree(['/admin']) : true;
};
