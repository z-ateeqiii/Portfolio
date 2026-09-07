import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Surface card (07 §7).
 *
 * Depth comes from the warm near-black surface shift (#140A03 against #000000),
 * not from stacked drop shadows — the "floating card" cliché is explicitly out
 * (07 §7, and 00 §24's rejection of unnecessary visual effects).
 *
 *   <ui-card>…</ui-card>
 *   <ui-card [interactive]="true">…</ui-card>
 *   <ui-card [accent]="true">…</ui-card>
 *   <ui-card [flush]="true">…</ui-card>
 *
 * `interactive` only warms the border on hover. It does NOT make the card a
 * control: the clickable thing inside (a link to the case study) stays the
 * real focus target, so keyboard users get one predictable stop rather than a
 * card-sized hit area that no ring can describe.
 *
 * `accent` tints the border orange instead of the neutral hairline — the
 * featured-project treatment from the visual-identity redesign (2026-09-06).
 *
 * `flush` removes the padding so a cover image can run edge to edge, and the
 * caller pads its own text block instead.
 *
 * ─── WHY THESE ARE INPUTS AND NOT CLASSES PASSED FROM OUTSIDE ────────────────
 * This component owns its border and padding as one computed string. A second
 * utility for the same property applied to the same host from a template is
 * just two single-class selectors of equal specificity fighting, and the
 * winner is whichever Tailwind happened to emit LAST — which is a property of
 * Tailwind's output ordering, not of the template.
 *
 * That is not hypothetical. `class="overflow-hidden p-0"` was passed on the
 * Work index and Home cards to let their cover images sit flush, and it never
 * worked: Tailwind emits `.p-0` before `.p-6`, so the card's own padding won
 * and every "flush" image was silently inset by 24px. Found 2026-09-07 by
 * checking the byte offsets of both rules in the built stylesheet rather than
 * by looking at the template, which reads as though it should work.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: { '[class]': 'hostClasses()' },
})
export class UiCard {
  readonly interactive = input(false);
  readonly accent = input(false);
  readonly flush = input(false);

  /**
   * `group` is on every card, interactive or not, so descendants can react to
   * the card being hovered — the cover image un-desaturating via
   * `hover-reveal-media` is the main one. A non-interactive card simply has
   * nothing inside it that listens.
   *
   * `overflow-hidden` is unconditional: the card has a radius, and a flush
   * cover image must be clipped to it or its square corners poke out past the
   * rounded border.
   */
  private static readonly BASE = 'group block overflow-hidden rounded-md bg-surface';

  private static readonly BORDER: Record<'neutral' | 'accent', string> = {
    neutral: 'border border-fg/12 hover:border-fg/40 focus-within:border-fg/40',
    // Stays in the orange family on hover rather than reverting to neutral —
    // this card is the notable one before, during, and after interaction.
    accent: 'border border-action/32 hover:border-action focus-within:border-action',
  };

  /**
   * `hover-lift` (styles.css) supplies the 4px rise and the transition, and
   * mirrors it onto `:focus-within` so a keyboard user tabbing to the link
   * inside sees the same response a mouse user does — ui-ux-pro-max flags
   * hover-only feedback as a Critical anti-pattern.
   */
  protected readonly hostClasses = computed(() => {
    const border = UiCard.BORDER[this.accent() ? 'accent' : 'neutral'];
    const padding = this.flush() ? '' : 'p-6';
    return this.interactive()
      ? `${UiCard.BASE} ${padding} ${border} hover-lift`
      : `${UiCard.BASE} ${padding} border ${this.accent() ? 'border-action/32' : 'border-fg/12'}`;
  });
}
