import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';

import { ProgressService } from '../../../core/ui/progress.service';

/**
 * The top-of-viewport loading bar (07 §5c).
 *
 * ─── Why it fakes its own progress ──────────────────────────────────────────
 * Neither a route navigation nor a Firestore read reports how far along it is,
 * so there is no real percentage to show. The honest options are a bar that
 * jumps 0 to 100 (which communicates nothing) or one that eases toward a
 * ceiling it never reaches until the work actually finishes. The second is what
 * every tool that does this well uses, and it is not a lie: the bar says "still
 * working", and only completion moves it to the end.
 *
 * It trickles toward 90% and stops there. When the work finishes it snaps to
 * 100%, then fades out — so the last thing a visitor sees is a completed bar,
 * not one vanishing mid-travel.
 *
 * ─── Why nothing shows for a fast load ──────────────────────────────────────
 * The bar waits 120ms before appearing at all. A cached route resolves in
 * well under that, and flashing a progress bar for 40ms reads as a glitch
 * rather than as feedback — it draws the eye to something that already
 * finished. Slow loads, which are the ones that need reassurance, comfortably
 * clear the delay.
 *
 * Purely decorative: `aria-hidden`, `pointer-events: none`. The routed content
 * itself is what assistive tech should announce on navigation, and a busy
 * indicator that steals focus or speaks over it makes navigation worse.
 */
@Component({
  selector: 'ui-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'progress-bar-host', 'aria-hidden': 'true' },
  template: `
    <div
      class="progress-bar"
      [class.progress-bar-visible]="visible()"
      [style.transform]="'scaleX(' + value() / 100 + ')'"
    ></div>
  `,
})
export class UiProgressBar {
  private readonly progress = inject(ProgressService);

  protected readonly visible = signal(false);
  protected readonly value = signal(0);

  private appearTimer?: ReturnType<typeof setTimeout>;
  private trickleTimer?: ReturnType<typeof setInterval>;
  private hideTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => (this.progress.active() ? this.begin() : this.finish()));
  }

  private begin(): void {
    this.clearTimers();
    this.appearTimer = setTimeout(() => {
      this.value.set(8);
      this.visible.set(true);
      /**
       * Decelerating: big steps early, tiny ones near the ceiling. A linear
       * trickle reaches 90% and then sits dead still, which looks frozen —
       * easing means it is always still moving, just less and less.
       */
      this.trickleTimer = setInterval(() => {
        this.value.update((v) => (v >= 90 ? v : v + Math.max(0.4, (90 - v) * 0.06)));
      }, 160);
    }, 120);
  }

  private finish(): void {
    this.clearTimers();

    /** Never appeared, so there is nothing to complete — just reset. */
    if (!this.visible()) {
      this.value.set(0);
      return;
    }

    this.value.set(100);
    this.hideTimer = setTimeout(() => {
      this.visible.set(false);
      /** Reset only after the fade, or the bar visibly rewinds to zero. */
      this.hideTimer = setTimeout(() => this.value.set(0), 220);
    }, 180);
  }

  private clearTimers(): void {
    if (this.appearTimer) clearTimeout(this.appearTimer);
    if (this.trickleTimer) clearInterval(this.trickleTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.appearTimer = this.trickleTimer = this.hideTimer = undefined;
  }
}
