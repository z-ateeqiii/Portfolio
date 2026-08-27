import { Routes } from '@angular/router';

/**
 * The real public routes from 02 §2 (/, /work, /work/:slug, /about, /beyond/*,
 * /contact, /resume) are built in Phase 3, and /admin/** in Phase 5.
 *
 * Until then the only reachable page is the styleguide, which exists to make
 * the Phase 1 checkpoint reviewable (09 §6). It is scaffolding: delete
 * src/app/dev/ and this route before launch.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'styleguide' },
  {
    path: 'styleguide',
    loadComponent: () => import('./dev/styleguide/styleguide').then((m) => m.Styleguide),
    title: 'Design system — Phase 1',
  },
  { path: '**', redirectTo: 'styleguide' },
];
