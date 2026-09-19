import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** The six marks the tech strip can draw. Text-only items pass no icon. */
export type MarqueeIcon = 'angular' | 'typescript' | 'firebase' | 'cloudinary' | 'tailwind' | 'gsap';

export interface MarqueeItem {
  readonly label: string;
  readonly icon?: MarqueeIcon;
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
                @if (!item.icon) {
                  <span class="size-1.5 shrink-0 border border-action" aria-hidden="true"></span>
                }
                @if (item.icon) {
                  <span class="text-action" aria-hidden="true">
                    @switch (item.icon) {
                      @case ('angular') {
                        <svg viewBox="0 0 24 24" class="size-5" fill="currentColor">
                          <path d="M12 1.5 2.4 4.9l1.5 12.7L12 22.5l8.1-4.9 1.5-12.7L12 1.5Zm0 2.2 7.4 2.6-1.1 9.8L12 20l-6.3-3.9-1.1-9.8L12 3.7Zm0 2.4L7.6 16.2h1.8l.9-2.2h3.4l.9 2.2h1.8L12 6.1Zm0 3 1.2 3H10.8l1.2-3Z" />
                        </svg>
                      }
                      @case ('typescript') {
                        <svg viewBox="0 0 24 24" class="size-5" fill="currentColor">
                          <path d="M3 3h18v18H3V3Zm2 2v14h14V5H5Zm2.6 4.6h5.2v1.5h-1.8v5.4H9.4v-5.4H7.6V9.6Zm6.3 5.2c.4.4 1 .7 1.6.7.5 0 .9-.2.9-.6 0-.4-.3-.6-1.1-.9-1.1-.4-1.9-.9-1.9-2 0-1.1.9-1.9 2.2-1.9.8 0 1.5.2 2 .6l-.7 1.2c-.4-.3-.8-.4-1.2-.4s-.8.2-.8.6c0 .4.4.5 1.2.9 1.1.4 1.8.9 1.8 2 0 1.3-1 2-2.4 2-1 0-1.9-.4-2.4-1l.8-1.2Z" />
                        </svg>
                      }
                      @case ('firebase') {
                        <svg viewBox="0 0 24 24" class="size-5" fill="currentColor">
                          <path d="m4 17.7 2-13c.1-.5.7-.6 1-.2l2 3.7L4 17.7Zm1.6 1.1L12 22.5l6.4-3.7-1.8-11.2c-.1-.5-.7-.6-1-.2L5.6 18.8ZM9.7 9.6 12 5.2c.2-.4.8-.4 1 0l1.5 2.7-4.8 1.7Z" />
                        </svg>
                      }
                      @case ('cloudinary') {
                        <svg viewBox="0 0 24 24" class="size-5" fill="currentColor">
                          <path d="M18.4 9.6A6.5 6.5 0 0 0 6.1 8.4 5 5 0 0 0 6.5 18.3h11.2a4.4 4.4 0 0 0 .7-8.7Zm-.7 7.2H6.5a3.5 3.5 0 0 1-.2-7l.6.1.2-.6a5 5 0 0 1 9.6 1.1l.1.7h.7a2.9 2.9 0 0 1 .2 5.7Z" />
                        </svg>
                      }
                      @case ('tailwind') {
                        <svg viewBox="0 0 24 24" class="size-5" fill="currentColor">
                          <path d="M12 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 1.9 1.4 1 1 2.2 2.1 4.6 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.8-1.9-1.4C15.6 7.1 14.4 6 12 6Zm-5 6c-2.7 0-4.3 1.3-5 4 1-1.3 2.2-1.8 3.5-1.5.8.2 1.3.8 1.9 1.4 1 1 2.2 2.1 4.6 2.1 2.7 0 4.3-1.3 5-4-1 1.3-2.2 1.8-3.5 1.5-.8-.2-1.3-.8-1.9-1.4-1-1-2.2-2.1-4.6-2.1Z" />
                        </svg>
                      }
                      @case ('gsap') {
                        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.6">
                          <circle cx="12" cy="12" r="8.5" />
                          <path d="M15.5 9.2a4.2 4.2 0 1 0 .6 4.1h-3.4" stroke-linecap="square" />
                        </svg>
                      }
                    }
                  </span>
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
