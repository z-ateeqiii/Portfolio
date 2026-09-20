import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';

import { SiteState } from './core/services/site-state';
import { ProgressService } from './core/ui/progress.service';
import { AppFooter } from './layout/footer/footer';
import { AppHeader } from './layout/header/header';
import { UiProgressBar } from './shared/ui/progress-bar/progress-bar';

/**
 * Root shell: header, routed page, footer (02 §3).
 *
 * The Profile is read from SiteState rather than resolved per route, so the
 * header and footer stay populated across navigation without re-fetching.
 *
 * OnPush is the project-wide default, not an exception (06 §7, 09 §5).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader, AppFooter, UiProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly site = inject(SiteState);
  protected readonly profile = this.site.profile;

  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /**
   * True on any /admin route — and the public chrome is not rendered when it is
   * (05 §7, 07 §9).
   *
   * The dashboard is a functional tool that deliberately does not share the
   * public site's art direction, but the shell was applying that art direction
   * to it anyway: the marketing header, the footer with its social links, and
   * the ambient glow all rendered on every route including the sign-in screen.
   * The glow washed the login form's own borders out, and the public nav
   * offered an admin four ways back to the marketing site instead of into the
   * dashboard.
   *
   * ─── Why the initial value comes from Location, not from `false` ────────────
   * `NavigationEnd` has not fired when this component is constructed, so
   * seeding the signal `false` would render the public header for one frame on
   * a direct load of /admin/login and then tear it out. Reading the path the
   * browser already has is correct from the first render. Admin routes are
   * client-rendered behind the auth guard, so this never runs on the server
   * for them.
   */
  private readonly progress = inject(ProgressService);

  /**
   * Route navigation drives the top progress bar (07 §5c).
   *
   * A navigation is the one async wait a visitor has no other feedback for:
   * resolvers run before the new page renders, so the old page just sits
   * there looking unresponsive. Subscribed in the constructor rather than
   * through an effect because these are events, not state — an effect would
   * need somewhere to store the last one just to react to it.
   *
   * Every terminal event releases, not only NavigationEnd: a cancelled
   * navigation (a guard redirecting to /admin/login) and a failed one both
   * end the wait, and handling only the success case would leave the bar
   * stuck at 90% for exactly the cases where something went wrong.
   */
  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) this.progress.start();
      else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
        this.progress.stop();
    });
  }

  protected readonly isAdmin = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/admin')),
    ),
    { initialValue: this.location.path().startsWith('/admin') },
  );
}
