import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

/**
 * Dashboard shell (05 §3).
 *
 * A tool, not a brand surface (05 §7, 07 §9): a persistent sidebar of entities
 * and a content pane, with no storytelling layout, no motion, and no hero.
 * It reuses the design tokens because maintaining a second colour system for a
 * one-person admin panel would be cost without benefit — but it deliberately
 * does not reuse the public site's header, footer or type scale.
 *
 * Sections mirror 04's entities one-for-one (05 §3), so "where do I edit X"
 * has the same answer as "what is X in the content model".
 */
@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="flex min-h-screen">
      <aside class="w-56 shrink-0 border-r border-fg/12 bg-surface">
        <div class="flex h-full flex-col gap-6 p-4">
          <div>
            <p class="font-mono text-label text-fg-muted uppercase">Dashboard</p>
            <p class="mt-1 text-caption text-fg">{{ email() }}</p>
          </div>

          <nav class="flex flex-1 flex-col gap-1" aria-label="Dashboard sections">
            @for (item of sections; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-fg/8 text-fg"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="rounded-sm px-3 py-2 text-caption text-fg-muted no-underline hover:text-fg"
                >{{ item.label }}</a
              >
            }
          </nav>

          <div class="flex flex-col gap-2 border-t border-fg/12 pt-4">
            <a
              routerLink="/"
              class="rounded-sm px-3 py-2 text-caption text-fg-muted no-underline hover:text-fg"
              >View site ↗</a
            >
            <button
              type="button"
              (click)="signOut()"
              class="rounded-sm px-3 py-2 text-left text-caption text-fg-muted hover:text-fg"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div class="min-w-0 flex-1">
        <router-outlet />
      </div>
    </div>
  `,
})
export class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email(): string {
    return this.auth.user()?.email ?? '';
  }

  /** One entry per 04 entity, in 05 §3's order. */
  protected readonly sections = [
    { path: '/admin', label: 'Overview', exact: true },
    { path: '/admin/profile', label: 'Profile', exact: false },
    { path: '/admin/projects', label: 'Projects', exact: false },
    { path: '/admin/experience', label: 'Experience', exact: false },
    { path: '/admin/skills', label: 'Skills', exact: false },
    { path: '/admin/social', label: 'Social platforms', exact: false },
    { path: '/admin/business', label: 'Business ventures', exact: false },
    { path: '/admin/education', label: 'Education', exact: false },
    { path: '/admin/proof-points', label: 'Proof points', exact: false },
  ];

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/admin/login');
  }
}
