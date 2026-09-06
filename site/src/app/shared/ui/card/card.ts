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
 *
 * `interactive` only warms the border on hover. It does NOT make the card a
 * control: the clickable thing inside (a link to the case study) stays the
 * real focus target, so keyboard users get one predictable stop rather than a
 * card-sized hit area that no ring can describe.
 *
 * `accent` tints the border orange instead of the neutral hairline — the
 * featured-project treatment from the visual-identity redesign (2026-09-06).
 * A real input rather than a `[class.border-action/32]` bolted on from
 * outside: this component already owns its border color as one computed
 * string, and a second, externally-applied border-color utility on the same
 * host would just be two classes of equal specificity fighting over the same
 * property — whichever Tailwind happened to emit last would win.
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

  private static readonly BASE = 'block rounded-md bg-surface p-6';
  private static readonly BORDER: Record<'neutral' | 'accent', string> = {
    neutral: 'border border-fg/12 hover:border-fg/40',
    // Stays in the orange family on hover rather than reverting to neutral —
    // this card is the notable one before, during, and after interaction.
    accent: 'border border-action/32 hover:border-action',
  };

  protected readonly hostClasses = computed(() => {
    const border = UiCard.BORDER[this.accent() ? 'accent' : 'neutral'];
    return this.interactive()
      ? `${UiCard.BASE} ${border} transition-colors duration-[--duration-base] ease-[--ease-out-soft]`
      : `${UiCard.BASE} border ${this.accent() ? 'border-action/32' : 'border-fg/12'}`;
  });
}
