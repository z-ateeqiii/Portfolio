import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

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
 * Pace is specified as a SPEED and the duration is derived from the measured
 * content width, so two strips of very different lengths stacked on top of
 * each other still travel at the same rate. See the `speed` input.
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
        #track
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
   * Travel in pixels per second — a SPEED, not a duration (2026-09-20).
   *
   * It used to take seconds, and that was the bug. A CSS animation's duration
   * is time for a fixed distance, but this strip's distance is its own content
   * width, so two strips given similar durations run at wildly different
   * speeds. Measured on Home at 1440px: the tech strip was 3,969px of content
   * in 34s and the identity strip 1,279px in 42s — 117 px/s against 30 px/s,
   * nearly four times faster, sitting directly above one another. Tuning the
   * seconds by hand would only hold until a skill was added or renamed.
   *
   * Taking a speed makes the pace the thing that is specified and the duration
   * the thing that is derived, so any two strips match by construction and a
   * longer list simply takes longer to loop.
   */
  readonly speed = input(30);

  /**
   * Runs right-to-left instead. Used so the two strips on Home travel in
   * opposite directions and read as a system rather than as one element
   * rendered twice.
   */
  readonly reverse = input(false);

  private readonly destroyRef = inject(DestroyRef);

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  /**
   * One run's width in pixels, measured. Null until the browser has laid the
   * strip out — which includes SSR, where there is no layout at all.
   */
  private readonly runWidth = signal<number | null>(null);

  /**
   * Seconds for one pass, from whichever width is known.
   *
   * The estimate is not decoration: SSR emits this strip fully formed, and a
   * visitor on a slow connection watches it move for however long hydration
   * takes. Without a fallback the strip would either not move or run at a
   * default speed unrelated to its contents, then visibly change pace. The
   * constants are the item's own box — 56px of padding, a 10px gap, a mark —
   * plus a per-character width for the mono label, which is a fixed size at
   * fixed tracking and so is very nearly constant. Checked against the served
   * HTML: the estimate gives 132.43s and 42.68s where the browser then
   * measures 132.4s and 42.7s, so there is no correction to see.
   */
  protected readonly duration = computed(() => {
    const measured = this.runWidth();
    const width = measured ?? this.estimateWidth();
    return `${Math.max(width / this.speed(), 1).toFixed(2)}s`;
  });

  private estimateWidth(): number {
    return this.items().reduce(
      (total, item) => total + 66 + (item.path ? 20 : 6) + item.label.length * 10.1,
      0,
    );
  }

  constructor() {
    /**
     * Browser only, and re-measured rather than measured once: the width moves
     * when the web font finishes loading, when the viewport changes, and when
     * the items themselves change. A ResizeObserver covers all three without
     * this component needing to know which one happened.
     */
    afterNextRender(() => {
      const el = this.track()?.nativeElement;
      if (!el) return;

      const measure = () => {
        /** The track holds the list twice, so half of it is one pass. */
        const half = el.getBoundingClientRect().width / 2;
        if (half > 0) this.runWidth.set(half);
      };

      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
