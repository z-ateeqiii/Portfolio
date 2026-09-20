import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface MarqueeItem {
  readonly label: string;
  /**
   * A Simple Icons path, when the item has a brand mark. Passed in as data
   * rather than looked up here: the tech strip's items come from Firestore
   * Skill records, and the strip should not need to know where a logo comes
   * from or which ones exist.
   */
  readonly path?: string;
}

/**
 * An infinitely scrolling horizontal strip (07 §5b).
 *
 * Used twice on Home, for two different jobs: the stack the site is actually
 * built with, and the words Muhammed already uses to describe himself. One
 * component rather than two because the scrolling mechanic is the hard part
 * and it is identical — only the payload differs, which is why items carry an
 * optional `icon` instead of the component being forked.
 *
 * ─── How the seam is hidden ──────────────────────────────────────────────────
 * The list is rendered exactly TWICE and the track translates by exactly -50%.
 * At the end of the cycle the second copy sits precisely where the first
 * started, so the loop restarts on an identical frame and there is no visible
 * jump. This is why the duplication is structural and not a styling detail:
 * render the list once, or three times, and the -50% no longer lands on a
 * matching frame.
 *
 * The clone is `aria-hidden`, so the content is announced once. Without that a
 * screen reader reads the whole stack twice with no indication why.
 *
 * ─── Motion ──────────────────────────────────────────────────────────────────
 * A CSS animation on `transform`, so it runs on the compositor and costs no
 * main-thread work — a JS-driven ticker on a strip that never stops would be
 * the single most expensive thing on the page.
 *
 * `prefers-reduced-motion` needs an explicit rule here rather than relying on
 * the global one in styles.css. That global rule collapses animations to
 * 0.01ms, which for a normal transition means "arrive instantly" — but for a
 * marquee it means the track jumps straight to -50% and stays there, leaving
 * the strip visibly offset. The stylesheet therefore stops the animation
 * outright, drops the clone, and turns the strip into something that can be
 * scrolled by hand instead.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'ui-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="marquee" [attr.aria-label]="label()" role="group">
      <div
        class="marquee-track"
        [class.marquee-reverse]="reverse()"
        [style.--marquee-duration]="duration()"
      >
        @for (run of [0, 1]; track run) {
          <ul class="marquee-run" [attr.aria-hidden]="run === 1 ? 'true' : null">
            @for (item of items(); track item.label) {
              <li class="marquee-item">
                <!--
                  Text-only items get the same small orange square that opens
                  every eyebrow and sits on every stack tag, so the identity
                  strip reads in the site's existing rhythm rather than as a
                  run-on sentence. Items with an icon already have a mark and
                  do not need a second one.
                -->
                <!--
                  Text-only items get the same small orange square that opens
                  every eyebrow and sits on every stack tag, so the identity
                  strip reads in the site's existing rhythm rather than as a
                  run-on sentence. Items with a brand mark already carry one.
                -->
                @if (item.path) {
                  <svg
                    class="size-5 shrink-0 text-action"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path [attr.d]="item.path" />
                  </svg>
                } @else {
                  <span class="size-1.5 shrink-0 border border-action" aria-hidden="true"></span>
                }
                <span class="mono-label text-fg-muted">{{ item.label }}</span>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class UiMarquee {
  readonly items = input<readonly MarqueeItem[]>([]);

  /** Names the strip for assistive tech — it is a group, not a list of links. */
  readonly label = input('');

  /**
   * Seconds for one full pass. Longer strips need longer, or they travel
   * faster for the same duration — the distance is the content's own width.
   */
  readonly seconds = input(38);

  /**
   * Runs right-to-left instead. Used so the two strips on Home travel in
   * opposite directions and read as a system rather than as one element
   * rendered twice.
   */
  readonly reverse = input(false);

  protected readonly duration = computed(() => `${this.seconds()}s`);
}
