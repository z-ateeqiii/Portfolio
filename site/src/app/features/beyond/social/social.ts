import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SocialPlatform } from '../../../core/models';
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
  imports: [DatePipe, UiEyebrow, UiStatusDot],
  template: `
    <section class="container-content py-20">
      <ui-eyebrow>Beyond Code</ui-eyebrow>
      <h1 class="mt-4 text-display-1 font-display text-fg">Social Media World</h1>

      <p class="mt-6 text-body-lg text-fg-muted">
        Before software, this is where Muhammed built things for other people — editing video at
        14, then making his own. The audience came from doing that for years.
      </p>

      @if (platforms().length) {
        <p class="mt-12 font-display text-display-2 text-fg">{{ combined() }}</p>
        <p class="mt-2 font-mono text-label text-fg-muted uppercase">Combined reach</p>

        <ul class="mt-10 space-y-4">
          @for (platform of platforms(); track platform.platform) {
            <li class="flex flex-wrap items-baseline justify-between gap-4 border-t border-fg/12 pt-4">
              <a
                [href]="platform.url"
                target="_blank"
                rel="noopener"
                class="text-body-lg text-fg no-underline capitalize hover:text-action"
                >{{ platform.platform }}</a
              >
              <span class="font-mono text-body text-fg">{{ format(platform.followerCount) }}</span>
              <span class="font-mono text-label text-fg-muted"
                >verified {{ platform.lastVerifiedDate | date: 'MMM yyyy' }}</span
              >
              <ui-status-dot label="Live" />
            </li>
          }
        </ul>
      }

      <!--
        A curated video archive is still open (02 §14, 10 §3) and no SocialVideo
        records are seeded. Nothing is rendered for it: an empty "coming soon"
        shelf is worse than the section simply not existing (brief §32).
      -->
    </section>
  `,
})
export class BeyondSocial {
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
