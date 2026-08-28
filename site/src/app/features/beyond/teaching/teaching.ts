import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TEACHING } from '../../../core/content/site-copy';
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
  imports: [RouterLink, UiEyebrow, UiTag],
  template: `
    <section class="container-content py-20">
      <ui-eyebrow>Beyond Code</ui-eyebrow>
      <h1 class="mt-4 text-display-1 font-display text-fg">Teaching</h1>

      <p class="mt-6 text-body-lg text-fg-muted">{{ teaching.framing }}</p>

      <!-- brief §21: what this experience is evidence of. Presented as what it
           is — a short list of qualities — rather than inflated into a
           section per item. -->
      <ul class="mt-10 flex flex-wrap gap-2">
        @for (item of teaching.evidences; track item) {
          <li><ui-tag>{{ item }}</ui-tag></li>
        }
      </ul>

      <nav class="mt-16 border-t border-fg/12 pt-8">
        <a routerLink="/beyond" class="text-body text-action no-underline hover:underline"
          >← Back to Beyond Code</a
        >
      </nav>
    </section>
  `,
})
export class BeyondTeaching {
  protected readonly teaching = TEACHING;
}
