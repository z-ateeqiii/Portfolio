import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { SiteState } from './core/services/site-state';
import { AppFooter } from './layout/footer/footer';
import { AppHeader } from './layout/header/header';

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
  imports: [RouterOutlet, AppHeader, AppFooter],
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
  protected readonly isAdmin = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/admin')),
    ),
    { initialValue: this.location.path().startsWith('/admin') },
  );
}
