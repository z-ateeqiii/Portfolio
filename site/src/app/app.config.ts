import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';
import { TitleStrategy, provideRouter, withComponentInputBinding } from '@angular/router';
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
    provideRouter(routes, withComponentInputBinding()),
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
