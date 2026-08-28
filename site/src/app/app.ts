import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
}
