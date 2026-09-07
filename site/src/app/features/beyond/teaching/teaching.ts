import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TEACHING } from '../../../core/content/site-copy';
import { SeoService } from '../../../core/seo/seo.service';
import { UiStripBackdrop } from '../../../shared/blocks/strip-backdrop/strip-backdrop';
import { UiEyebrow, UiTag } from '../../../shared/ui';

/**
 * Teaching (02 §8.3).
 *
 * ─── This page is deliberately the thinnest on the site ──────────────────────
 * It is the only Beyond Code page with no seeded record behind it: 04 has no
 * Teaching entity, and docs 00–10 carry no specifics — no course names, no
 * institutions, no dates, no student numbers that have been verified.
 *
 * brief §22 lists "300+ students taught" as a POTENTIAL proof point and then
 * says plainly that numbers must be verified before publication. It never was
 * (03 §8 verifies only the social and laptop figures), so it does not appear
 * here. A specific-sounding number is exactly the kind of detail that makes a
 * credibility site less credible when it turns out to be an estimate.
 *
 * So the page says what brief §21 actually states and stops. 02 §8.3 asks for
 * this to be "kept proportionate — supporting evidence, not a competing career
 * narrative", which makes thin the correct outcome here rather than a gap to
 * paper over. Tracked in 10 §4b for when real material exists.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'app-beyond-teaching',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiEyebrow, UiStripBackdrop, UiTag],
  template: `
    <article>
      <header class="relative overflow-hidden pt-20 pb-10">
        <ui-strip-backdrop anchor="top-right" scale="sm" />

        <div class="container-content stagger-in-lead relative">
          <ui-eyebrow>Beyond Code</ui-eyebrow>
          <h1 class="display-condensed mt-5 text-display-hero font-display text-fg">Teaching</h1>

          <p class="mt-6 text-body-lg text-fg">{{ teaching.framing }}</p>
        </div>
      </header>

      <div class="container-content pb-20">
        <div class="rule-strip"></div>

        <!-- brief §21: what this experience is evidence of. Presented as what
             it is — a short list of qualities — rather than inflated into a
             section per item. -->
        <p class="mono-label mt-8 text-fg-muted">Evidence of</p>
        <ul class="mt-5 flex flex-wrap gap-2">
          @for (item of teaching.evidences; track item; let i = $index) {
            <li><ui-tag [icon]="tagIcon(i)">{{ item }}</ui-tag></li>
          }
        </ul>

        <nav class="mt-16 border-t border-fg/12 pt-6">
          <a
            routerLink="/beyond"
            class="sweep-underline inline-flex min-h-11 items-center text-body text-action
                   no-underline"
            >← Back to Beyond Code</a
          >
        </nav>
      </div>
    </article>
  `,
})
export class BeyondTeaching {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      path: '/beyond/teaching',
      title: 'Teaching — Muhammed Al-Ateeqi',
      description:
        'Teaching and mentoring — explaining technical things to people still learning them.',
    });
  }

  protected readonly teaching = TEACHING;

  /**
   * The three shapes cycle by position, the same purely-rhythmic alternation
   * used for stack tags — these are qualities, not technologies, and there is
   * no meaning to map a particular shape onto either.
   */
  protected tagIcon(index: number): 'diamond' | 'square' | 'circle' {
    return (['diamond', 'square', 'circle'] as const)[index % 3];
  }
}
