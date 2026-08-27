import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Section eyebrow — the small label above a section heading, e.g.
 *
 *   <ui-eyebrow index="01">The Problem</ui-eyebrow>   →   01 — THE PROBLEM
 *   <ui-eyebrow>In plain English</ui-eyebrow>         →   IN PLAIN ENGLISH
 *
 * Colour decision (08 §2, resolved as OPTION A): eyebrows are NOT orange.
 * The design mockups used #FF6B00 here; that has been rolled back so orange
 * means one thing only — "act on this". The eyebrow earns its distinctiveness
 * from the monospace face, the letter-spacing and the muted index instead.
 *
 * Renders a span, not a heading: the real <h2> follows it. An eyebrow is a
 * label on a heading, and marking it up as one would put a second, near-empty
 * heading into the document outline for every section on the site.
 */
@Component({
  selector: 'ui-eyebrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (index()) {
      <span class="text-fg-muted">{{ index() }}</span>
      <span class="text-fg-muted" aria-hidden="true">—</span>
    }
    <span class="text-fg"><ng-content /></span>
  `,
  host: {
    class: 'inline-flex items-center gap-2 font-mono text-label uppercase',
  },
})
export class UiEyebrow {
  /** Optional ordinal, e.g. "01". Sequence markers are justified here because
   *  case-study sections genuinely are an ordered sequence (07 §7). */
  readonly index = input<string>('');
}
