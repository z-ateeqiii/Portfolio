import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { SocialPlatform } from '../../../core/models';
import { SeoService } from '../../../core/seo/seo.service';
import { UiStripBackdrop } from '../../../shared/blocks/strip-backdrop/strip-backdrop';
import { RevealDirective } from '../../../shared/motion/reveal.directive';
import { UiEyebrow, UiStatusDot } from '../../../shared/ui';

/**
 * Social Media World (02 §8.1).
 *
 * ─── The numbers rule, enforced here rather than trusted ─────────────────────
 * Instagram ~100K and Facebook ~886K total 986,000 — close to a million but
 * NOT over it. brief §20 forbids claiming "+1M" outright, and 03 §8 says to use
 * the real combined figure or "nearing 1M".
 *
 * `combined()` below therefore formats the actual stored sum and never rounds
 * upward across the million boundary. The counts are stored as raw numbers
 * precisely so that this stays a presentation decision (04 §7) — and the
 * presentation decision made here is the honest one.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * `lastVerifiedDate` is shown, not hidden. A follower count with no date is a
 * claim that quietly ages into a false one; with a date it stays a fact about a
 * moment (04 §7).
 *
 * The status dot marks each platform as a live, verified profile — that is the
 * functional accent doing its actual job (07 §6), not decoration.
 */
@Component({
  selector: 'app-beyond-social',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RevealDirective, UiEyebrow, UiStatusDot, UiStripBackdrop],
  template: `
    <article>
      <header class="relative overflow-hidden pt-20 pb-10">
        <ui-strip-backdrop anchor="top-right" scale="sm" />

        <div class="container-content stagger-in-lead relative">
          <ui-eyebrow>Beyond Code</ui-eyebrow>
          <!-- "Social Media World" verbatim — the page's name in 02 §8.1, not
               shortened to fit the larger type. -->
          <h1 class="display-condensed mt-5 text-display-1 font-display text-fg">
            Social Media World
          </h1>

          <p class="mt-6 text-body-lg text-fg">
            Before software, this is where Muhammed built things for other people — editing video
            at 14, then making his own. The audience came from doing that for years.
          </p>
        </div>
      </header>

      <div class="container-content pb-20">
        @if (platforms().length) {
          <!-- The combined figure is short and it is the point of the page, so
               it gets the oversized condensed treatment the reference reserves
               for a single word. See the combined() computed below for why it
               is never rounded up across the million boundary. -->
          <div class="rule-strip"></div>
          <p class="display-condensed mt-8 font-display text-display-hero text-fg">
            {{ combined() }}
          </p>
          <p class="mono-label mt-3 text-fg-muted">Combined reach</p>

          <ul appReveal mode="children" class="mt-12 space-y-0">
            @for (platform of platforms(); track platform.platform) {
              <li
                class="group flex flex-wrap items-center justify-between gap-x-6 gap-y-2
                       border-t border-fg/12 py-5 transition-colors duration-[--duration-base]
                       ease-[--ease-out-strong] hover:border-fg/30"
              >
                <a
                  [href]="platform.url"
                  target="_blank"
                  rel="noopener"
                  class="sweep-underline flex min-h-11 items-center text-body-lg text-fg
                         capitalize no-underline transition-colors duration-[--duration-base]
                         ease-[--ease-out-strong] hover:text-action"
                  >{{ platform.platform }}</a
                >

                <span class="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <span class="font-mono text-body-lg text-fg">{{
                    format(platform.followerCount)
                  }}</span>
                  <span class="mono-label text-fg-muted"
                    >verified {{ platform.lastVerifiedDate | date: 'MMM yyyy' }}</span
                  >
                  <ui-status-dot label="Live" />
                </span>
              </li>
            }
          </ul>
        }

        <!--
          A curated video archive is still open (02 §14, 10 §3) and no
          SocialVideo records are seeded. Nothing is rendered for it: an empty
          "coming soon" shelf is worse than the section simply not existing
          (brief §32).
        -->
      </div>
    </article>
  `,
})
export class BeyondSocial {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      path: '/beyond/social',
      title: 'Social Media World — Muhammed Al-Ateeqi',
      description:
        'Years of making things for an audience — the creator side, and the reach it built.',
    });
  }

  readonly platforms = input<SocialPlatform[]>([]);

  /**
   * The combined figure, formatted honestly.
   *
   * Deliberately NOT rounded to "1M": 986,000 is under a million and brief §20
   * rules out the claim. Below a million this renders as "~986K"; the "nearing
   * 1M" phrasing 03 §8 also permits is left for editorial copy rather than
   * generated, since it stops being true the moment the number crosses over.
   */
  protected readonly combined = computed(() => {
    const total = this.platforms().reduce((sum, p) => sum + p.followerCount, 0);
    return total ? `~${this.format(total)}` : '';
  });

  protected format(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
    return String(count);
  }
}
