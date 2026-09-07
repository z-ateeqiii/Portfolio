import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Section eyebrow — the small label above a section heading, e.g.
 *
 *   <ui-eyebrow index="01">The Problem</ui-eyebrow>   →   01 — THE PROBLEM
 *   <ui-eyebrow>In plain English</ui-eyebrow>         →   IN PLAIN ENGLISH
 *
 * ─── Colour: 08 §2 "Option A" is superseded here (2026-09-07) ────────────────
 * Option A made eyebrows deliberately NOT orange, so that orange could mean
 * one thing only: "act on this". The design reference in design-reference/ is
 * now the source of truth for visual direction, and it is unambiguous — every
 * section-opening label in it is #FF6B00 with a small orange square before it
 * ("02 — SELECTED WORK", "TIER 01 — FLAGSHIP", "FEATURED"), while secondary
 * metadata in the same frames stays #888888.
 *
 * So the rule is not abandoned, it is restated more precisely (07 §2): orange
 * marks the SPINE of a page — the interactive elements a visitor can act on,
 * and the markers that say where they are in the structure. It never fills a
 * large area and it never appears in body prose, which is what kept it
 * meaningful in the first place. What distinguishes an eyebrow from a button
 * is not colour but shape and size: 12px of tracked monospace is not a
 * control, and no visitor has ever tried to click one.
 *
 * The distinction the reference actually draws is section-opener vs. metadata,
 * and this component is only the former. Metadata rows (a timeframe, a
 * verified-on date, a project ordinal) use `mono-label text-fg-muted` directly
 * and stay grey.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Renders a span, not a heading: the real <h2> follows it. An eyebrow is a
 * label on a heading, and marking it up as one would put a second, near-empty
 * heading into the document outline for every section on the site.
 */
@Component({
  selector: 'ui-eyebrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- The reference's 6px orange square. Decorative: the label beside it
         carries the meaning, so this is hidden from assistive tech. -->
    <span class="size-1.5 shrink-0 bg-action" aria-hidden="true"></span>
    @if (index()) {
      <span>{{ index() }}</span>
      <span aria-hidden="true">—</span>
    }
    <span><ng-content /></span>
  `,
  host: {
    class: 'mono-label inline-flex items-center gap-2 text-action',
  },
})
export class UiEyebrow {
  /** Optional ordinal, e.g. "01". Sequence markers are justified here because
   *  case-study sections genuinely are an ordered sequence (07 §7). */
  readonly index = input<string>('');
}
