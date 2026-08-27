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
 *
 * `interactive` only warms the border on hover. It does NOT make the card a
 * control: the clickable thing inside (a link to the case study) stays the
 * real focus target, so keyboard users get one predictable stop rather than a
 * card-sized hit area that no ring can describe.
 */
@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: { '[class]': 'hostClasses()' },
})
export class UiCard {
  readonly interactive = input(false);

  private static readonly BASE = 'block rounded-md border border-fg/12 bg-surface p-6';

  protected readonly hostClasses = computed(() =>
    this.interactive()
      ? `${UiCard.BASE} transition-colors duration-[--duration-base] ease-[--ease-out-soft] hover:border-fg/24`
      : UiCard.BASE,
  );
}
