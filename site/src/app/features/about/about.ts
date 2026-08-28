import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { JOURNEY } from '../../core/content/site-copy';
import { SiteState } from '../../core/services/site-state';
import { UiEyebrow } from '../../shared/ui';

/**
 * About / Story (02 §7).
 *
 * The narrative is `Profile.bioLong` from Firestore — the one place someone can
 * get the complete picture in one sitting. It is rendered as paragraphs of
 * prose, not restructured into a bullet timeline, because 02 §7.2 asks for "a
 * narrative arc, not a bullet timeline".
 *
 * ON THE SETBACK (02 §7.3, brief §9, brand §17): this page references it only
 * as far as the seeded `bioLong` does — "a personal setback interrupted that
 * momentum". No detail is added here, and none should be: personal and romantic
 * detail is a hard boundary, not a matter of taste. The single sentence in the
 * content is the whole treatment, which is why this component adds no
 * setback-specific section of its own to tempt anyone into filling it.
 *
 * Uses the narrow reading column (07 §4) — this is the longest prose on the
 * site and the one page most likely to be read start to finish.
 */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiEyebrow],
  template: `
    @let p = profile();

    <article class="container-content py-20">
      <ui-eyebrow>About</ui-eyebrow>
      <h1 class="mt-4 text-display-1 font-display text-fg">The long version</h1>

      @if (p) {
        <p class="mt-6 text-body-lg text-fg-muted">{{ p.bioShort }}</p>

        <!-- The journey arc (brief §8) as a visual spine beside the prose.
             07 §7 allows sequence markers here because this genuinely is an
             ordered timeline rather than decorative numbering. -->
        <ol class="mt-12 flex flex-wrap gap-x-2 gap-y-3" aria-label="Journey">
          @for (stage of journey; track stage; let last = $last) {
            <li class="flex items-center gap-2">
              <span class="font-mono text-label text-fg-muted uppercase">{{ stage }}</span>
              @if (!last) {
                <span class="text-fg-muted" aria-hidden="true">→</span>
              }
            </li>
          }
        </ol>

        <div class="mt-12 space-y-6">
          @for (paragraph of paragraphs(); track $index) {
            <p class="text-body-lg text-fg">{{ paragraph }}</p>
          }
        </div>

        <!-- 02 §7.4 and §7.5 — bridges out, rather than ending flat. -->
        <nav class="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-fg/12 pt-8">
          <a routerLink="/work" class="text-body text-action no-underline hover:underline"
            >See the work →</a
          >
          <a routerLink="/beyond" class="text-body text-action no-underline hover:underline"
            >Beyond code →</a
          >
          <a routerLink="/contact" class="text-body text-action no-underline hover:underline"
            >Get in touch →</a
          >
        </nav>
      }
    </article>
  `,
})
export class About {
  protected readonly profile = inject(SiteState).profile;
  protected readonly journey = JOURNEY;

  /** `bioLong` is stored with \n\n paragraph breaks (04 §2). */
  protected paragraphs(): string[] {
    return this.profile()?.bioLong.split('\n\n') ?? [];
  }
}
