import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BusinessVenture } from '../../../core/models';
import { UiEyebrow } from '../../../shared/ui';

/**
 * Business (02 §8.2).
 *
 * "Ateeqi Tech" — never the Arabic form. That is a logged correction (02, 04,
 * 10 §6) and 09 §2.1 puts logged corrections above everything else, so the name
 * comes from the record and is never re-typed in a template.
 *
 * Framed as evidence of ownership and operational thinking that ties back to
 * the professional philosophy, not as a separate persona (02 §8.2) — which is
 * why this page ends by linking back to the work rather than standing alone.
 *
 * The metrics keep their stored qualifiers verbatim ("80+", "~80,000 EGP").
 * They are rendered as-is with no formatting applied, because the qualifier is
 * the honest part: 03 §8 marks both figures usable exactly as stated, and
 * dropping a "~" in a template would quietly turn an approximation into a
 * precise claim.
 */
@Component({
  selector: 'app-beyond-business',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiEyebrow],
  template: `
    <section class="container-content py-20">
      <ui-eyebrow>Beyond Code</ui-eyebrow>
      <h1 class="mt-4 text-display-1 font-display text-fg">Business</h1>

      @for (venture of ventures(); track venture.id) {
        <h2 class="mt-10 text-display-3 font-display text-fg">{{ venture.name }}</h2>

        @if (venture.metrics.length) {
          <ul class="mt-8 flex flex-wrap gap-x-12 gap-y-6">
            @for (metric of venture.metrics; track metric.label) {
              <li>
                <p class="font-display text-display-3 text-fg">{{ metric.value }}</p>
                <p class="mt-1 font-mono text-label text-fg-muted uppercase">{{ metric.label }}</p>
              </li>
            }
          </ul>
        }

        <div class="mt-10 space-y-6">
          @for (paragraph of paragraphs(venture.summary); track $index) {
            <p class="text-body-lg text-fg">{{ paragraph }}</p>
          }
        </div>
      }

      <nav class="mt-16 border-t border-fg/12 pt-8">
        <a routerLink="/work" class="text-body text-action no-underline hover:underline"
          >The same thinking, applied to software →</a
        >
      </nav>
    </section>
  `,
})
export class BeyondBusiness {
  readonly ventures = input<BusinessVenture[]>([]);

  protected paragraphs(summary: string): string[] {
    return summary.split('\n\n');
  }
}
