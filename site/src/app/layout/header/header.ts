import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { UiButton } from '../../shared/ui';

/**
 * Site header (02 §3).
 *
 * Nav is deliberately short — "this is a story-driven site, not a documentation
 * site". Resume is a button rather than a text link because 02 §3 and brief §28
 * make it a top-priority recruiter exit path that "should never require
 * scrolling or exploring to find".
 *
 * Beyond Code is present but visually quieter than Work/About: 02 §3 asks that
 * it "not visually compete" — it is an invitation, not a headline item. That is
 * done with weight, not colour, since orange means "act on this" and nothing
 * else (07 §2, Option A).
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, UiButton],
  host: { class: 'sticky top-0 z-40 border-b border-fg/12 bg-bg/85 backdrop-blur-sm' },
  template: `
    <div class="container-wide flex items-center justify-between gap-6 py-4">
      <!-- Logo/name always returns Home (02 §3). -->
      <a
        routerLink="/"
        class="font-display text-body-lg font-semibold text-fg no-underline hover:text-action"
        >{{ name() || 'Muhammed Al-Ateeqi' }}</a
      >

      <nav class="flex items-center gap-1 sm:gap-2" aria-label="Primary">
        @for (item of links; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="text-fg"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="rounded-sm px-2 py-2 text-caption text-fg-muted no-underline transition-colors
                   duration-[--duration-fast] hover:text-fg sm:px-3 sm:text-body"
            >{{ item.label }}</a
          >
        }

        @if (resumeUrl(); as url) {
          <a uiButton variant="secondary" [href]="url" target="_blank" rel="noopener" class="ml-2">
            Resume
          </a>
        }
      </nav>
    </div>
  `,
})
export class AppHeader {
  /** From the Profile singleton, so the site name is content, not a constant. */
  readonly name = input<string>('');

  /**
   * Absent until a resume is uploaded (04 §2, 10 §4b). The button is not
   * rendered at all rather than rendered dead: 02 §3 promises this link works,
   * and a Resume button that goes nowhere is worse for a recruiter than no
   * button, because it costs them a click to discover the gap.
   */
  readonly resumeUrl = input<string | undefined>(undefined);

  protected readonly links = [
    { path: '/work', label: 'Work', exact: false },
    { path: '/about', label: 'About', exact: true },
    { path: '/beyond', label: 'Beyond Code', exact: false },
    { path: '/contact', label: 'Contact', exact: true },
  ];

  protected readonly open = signal(false);
}
