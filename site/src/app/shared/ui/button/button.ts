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

  /**
   * `min-h-11` is 44px — the platform touch-target guidance ui-ux-pro-max
   * flags at High severity, and comfortably past the 24px WCAG 2.2 AA floor.
   * The px-6/py-3 padding already produced roughly that at body size, but a
   * minimum states it rather than leaving it as an accident of the type scale.
   *
   * The hover (visual alignment pass, 2026-09-07) is a 2px lift plus the
   * colour change, transitioned on transform and colour only — both compositor
   * properties, so it never triggers layout. Deliberately half the 4px lift a
   * card gets: a button is small and already carries a fill, so it needs less
   * movement to read as responsive. `active:translate-y-0` puts it back down
   * on press, which is what makes it feel like a physical control rather than
   * something that merely highlights.
   */
  private static readonly BASE =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-6 py-3 ' +
    'font-sans text-body font-medium leading-none no-underline select-none ' +
    'transition-[color,background-color,border-color,transform] ' +
    'duration-(--duration-base) ease-out-strong ' +
    'hover:-translate-y-0.5 active:translate-y-0 ' +
    'disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0';

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
