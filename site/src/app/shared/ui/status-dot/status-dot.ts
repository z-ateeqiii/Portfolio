import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The signature element (07 §6).
 *
 * A small "live status" motif borrowed from Muhammed's own dashboards, where a
 * status dot means something real — a group covered, a lecture uploaded, an
 * attack detected. It recurs quietly outside the case studies (a live-demo
 * link, an availability line, a last-updated date).
 *
 * Deliberately single-purpose: this component has no `tone` or `color` input,
 * so it can only ever mean "live / verified / working". That is the rule from
 * 07 §2 enforced in code rather than left to a reviewer to catch.
 *
 * Use with restraint — a handful of appearances sitewide, never as a dominant
 * graphic (07 §6).
 */
@Component({
  selector: 'ui-status-dot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="dot" aria-hidden="true"></span>
    @if (label()) {
      <span class="font-mono text-label text-fg-muted uppercase">{{ label() }}</span>
    }
  `,
  host: { class: 'inline-flex items-center gap-2' },
  styles: `
    .dot {
      position: relative;
      flex: none;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background-color: var(--color-live);
    }

    /* The pulse. Subtle, slow, single-direction — motion that communicates
       "this is live" rather than motion for its own sake (07 §5). */
    .dot::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 9999px;
      background-color: var(--color-live);
      animation: status-pulse 2.4s var(--ease-out-soft) infinite;
    }

    @keyframes status-pulse {
      0% {
        transform: scale(1);
        opacity: 0.55;
      }
      70%,
      100% {
        transform: scale(2.75);
        opacity: 0;
      }
    }

    /* Hard requirement (07 §5, §8). The dot itself still reads as "live" —
       only the movement is removed, not the meaning. */
    @media (prefers-reduced-motion: reduce) {
      .dot::after {
        display: none;
      }
    }
  `,
})
export class UiStatusDot {
  /**
   * Optional visible text, e.g. "Live" or "Available for opportunities".
   * When omitted the dot is decorative and hidden from assistive tech, so it
   * must sit next to text that already carries the meaning.
   */
  readonly label = input<string>('');
}
