import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { SiteState } from './core/services/site-state';
import { SiteTitleStrategy } from './core/services/title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    /**
     * `withComponentInputBinding` maps resolved route data straight onto
     * component inputs by key, so a page declares what it needs as an
     * `input()` instead of injecting ActivatedRoute and unwrapping snapshots.
     */
    /**
     * View transitions for navigation clarity (07 §5's first justification,
     * brief §25's "carefully controlled page transitions").
     *
     * The browser's native View Transition API rather than a GSAP page
     * transition: it respects prefers-reduced-motion at the platform level,
     * costs no bundle weight, and degrades to an instant navigation in browsers
     * that do not support it. A hand-built page transition would have to
     * reimplement all three, and would sit between the visitor and the content
     * while it ran — which 07 §5 rules out.
     */
    /**
     * Scroll behaviour on navigation (2026-09-22).
     *
     * Without this the router left scroll position alone entirely — its
     * default is `'disabled'` — so a Navbar or Footer link opened the next
     * page at whatever height the last one was left at, clamped to the new
     * page's length. Measured: /about → /work from y=3740 landed at y=2482;
     * /beyond → /contact from y=842 landed at y=842.
     *
     * `'enabled'` rather than `'top'`, because the two differ on history:
     * both send a new navigation to the top, but only `'enabled'` returns
     * Back and Forward to where the visitor actually was. `'top'` would fix
     * the links and break the back button. It also sets
     * `history.scrollRestoration` to `'manual'`, handing scroll entirely to
     * the router so the browser's own restoration cannot fight it.
     *
     * The scroll to the top is only instant because `html` no longer sets
     * `scroll-behavior: smooth` — see the note in styles.css. With it, this
     * same config animated every navigation for ~900ms.
     */
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
    provideClientHydration(withEventReplay()),

    /**
     * Per-project case-study titles. A `title` ResolveFn cannot see resolved
     * data (it runs in the same step), so the title is derived after
     * resolution instead — see SiteTitleStrategy.
     */
    { provide: TitleStrategy, useClass: SiteTitleStrategy },

    /**
     * The Profile singleton is loaded once, before the first route renders,
     * because the header and footer need it on every page (06 §7).
     */
    provideAppInitializer(() => inject(SiteState).load()),
  ],
};
