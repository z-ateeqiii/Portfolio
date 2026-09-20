import { Injectable, computed, signal } from '@angular/core';

/**
 * The shared "something is loading" counter behind the top progress bar
 * (07 §5c).
 *
 * A COUNTER, not a boolean. Two overlapping loads finishing at different times
 * would each set a boolean to false, so the first one to finish would hide the
 * bar while the second was still running. Counting makes the bar disappear when
 * the last thing finishes, which is the only moment it is honest.
 *
 * Route navigation drives this automatically from the app shell; anything else
 * that takes long enough to need feedback calls `track()` and lets the promise
 * settle it:
 *
 *     await this.progress.track(this.admin.publish(...));
 *
 * `track` releases in a `finally`, so a rejected promise still clears the bar
 * rather than leaving it stuck at 90% forever.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly pending = signal(0);

  readonly active = computed(() => this.pending() > 0);

  start(): void {
    this.pending.update((n) => n + 1);
  }

  /** Never drops below zero, so an unbalanced stop cannot wedge the counter. */
  stop(): void {
    this.pending.update((n) => Math.max(0, n - 1));
  }

  async track<T>(work: Promise<T>): Promise<T> {
    this.start();
    try {
      return await work;
    } finally {
      this.stop();
    }
  }
}
