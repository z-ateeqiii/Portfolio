import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary';

/**
 * Buttons (07 §7).
 *
 * Attribute selector rather than a wrapper element, so the host stays a real
 * `<button>` or `<a>`. Semantics, keyboard behaviour and the global
 * :focus-visible ring come from the platform instead of being re-implemented.
 *
 *   <button uiButton>View Work</button>
 *   <a uiButton variant="secondary" href="/resume">Resume</a>
 *
 * Colour note (07 §2, resolved 08 §2 Option A): solid orange is reserved for
 * the one main action per section. If a screen appears to need three orange
 * buttons, the section has an unclear hierarchy — that is a design problem to
 * raise, not a colour rule to bend.
 *
 * Body typeface, not monospace: mono is reserved for tags, dates and stat
 * labels (07 §3), and spending it on buttons would dilute that signal.
 */
@Component({
  selector: 'button[uiButton], a[uiButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: { '[class]': 'hostClasses()' },
})
export class UiButton {
  readonly variant = input<UiButtonVariant>('primary');

  private static readonly BASE =
    'inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 ' +
    'font-sans text-body font-medium leading-none no-underline select-none ' +
    'transition-colors duration-[--duration-fast] ease-[--ease-out-soft] ' +
    'disabled:pointer-events-none disabled:opacity-50';

  private static readonly VARIANTS: Record<UiButtonVariant, string> = {
    // Black text on orange — 7.4:1, comfortably past AA (07 §8).
    primary: 'bg-action text-bg hover:bg-action-hover',
    // Ghost/outline for the secondary action, legible on both bg and surface.
    secondary: 'bg-transparent text-fg border border-fg/40 hover:border-action hover:text-action',
  };

  protected readonly hostClasses = computed(
    () => `${UiButton.BASE} ${UiButton.VARIANTS[this.variant()]}`,
  );
}
