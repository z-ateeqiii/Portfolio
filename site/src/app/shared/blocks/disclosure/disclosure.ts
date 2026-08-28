import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * The two honesty blocks (08 §4, 04 §3, 09 §3).
 *
 * ─── Why this is one component and not two copy-pasted templates ─────────────
 * 08 §4 asks for these as "reusable blocks … not copy-pasted per project — this
 * is what keeps the honesty standard consistent as projects are added later."
 * A disclosure that looks slightly different on one project reads as an
 * afterthought on that project, which is the opposite of the point.
 *
 * `kind` is REQUIRED and has no default. There is no way to render this
 * component without saying which disclosure it is, and no colour or tone input
 * to soften one — the same enforcement-in-code approach as UiStatusDot (07 §6).
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The two kinds are genuinely different claims and must not be merged:
 *
 *   'ai'   — how the BUILD was done (03 §2.5, brief §14). Never implies AI
 *            created the project independently.
 *   'data' — what the DATA actually is (03 §6.1). Surfaced by Cyber50, whose
 *            incident dataset is AI-generated dummy data. On a
 *            cybersecurity-themed dashboard, staying quiet about that implies
 *            real threat intelligence by omission, which 01 §9 Rule 4 forbids.
 *
 * Styling: deliberately prominent, never orange. brief §14 says "the website
 * should not hide this", so it sits inline in the reading flow on a raised
 * surface rather than in a footnote — but orange means "act on this" and this
 * is not a control (07 §2, Option A). The monospace label carries the emphasis.
 */
export type DisclosureKind = 'ai' | 'data';

@Component({
  selector: 'ui-disclosure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block rounded-md border border-fg/12 bg-surface p-6' },
  template: `
    <p class="font-mono text-label text-fg uppercase">{{ label() }}</p>
    <p class="mt-3 text-body text-fg-muted"><ng-content /></p>
  `,
})
export class UiDisclosure {
  /** Required — see the class note. No default, deliberately. */
  readonly kind = input.required<DisclosureKind>();

  protected readonly label = computed(() =>
    this.kind() === 'ai' ? 'AI disclosure' : 'About this data',
  );
}
