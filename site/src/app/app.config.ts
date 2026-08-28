import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { SiteState } from './core/services/site-state';

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
     * The Profile singleton is loaded once, before the first route renders,
     * because the header and footer need it on every page (06 §7).
     */
    provideAppInitializer(() => inject(SiteState).load()),
  ],
};
