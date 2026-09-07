import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StripAnchor = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type StripScale = 'sm' | 'md' | 'lg';

/**
 * The photo-strip backdrop — the atmospheric layer behind a section (07 §5a).
 *
 * Two elements, always together: a blurred orange glow anchored off one corner,
 * and a film-grain overlay across the whole area. Both are decorative and both
 * are `pointer-events: none`.
 *
 *   <section class="relative overflow-hidden">
 *     <ui-strip-backdrop anchor="top-right" />
 *     …content…
 *   </section>
 *
 * ─── Why a component rather than two divs copy-pasted per page ───────────────
 * The glow and the grain are the two things that make an ordinary section look
 * like it belongs to this visual system. Before this existed they were pasted
 * into three templates with hand-tuned offsets that had already started to
 * diverge — which is exactly how a "visual language" quietly becomes three
 * similar-looking pages. Anchoring and size are now a choice from a fixed set,
 * so a new page can pick a corner but cannot invent a fourth glow geometry.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * REQUIREMENTS ON THE CALLER, and they are not optional:
 *  - the parent must be `relative`, or the glow anchors to the page.
 *  - the parent must be `overflow-hidden` (or `overflow-clip`). The glow is
 *    deliberately larger than its section and hangs past the corner; unclipped
 *    it would extend the page's scroll width. `body { overflow-x: clip }` in
 *    styles.css is the safety net, not the mechanism.
 *
 * The host sits at `z-0` and every sibling that carries content needs to be
 * above it — `relative` on the content wrapper is enough, since the backdrop
 * establishes no stacking context of its own beyond its own children.
 */
@Component({
  selector: 'ui-strip-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pointer-events-none absolute inset-0 z-0 overflow-hidden',
    'aria-hidden': 'true',
  },
  template: `
    <div [class]="glowClasses()"></div>
    <div class="photo-strip-grain"></div>
  `,
})
export class UiStripBackdrop {
  /** Which corner the glow hangs off. */
  readonly anchor = input<StripAnchor>('top-right');

  /**
   * How much of the section it lights. `sm` for a page header, `lg` for a
   * full-bleed hero. Three steps, so glow sizes stay a system rather than a
   * per-page guess.
   */
  readonly scale = input<StripScale>('md');

  private static readonly ANCHORS: Record<StripAnchor, string> = {
    'top-right': '-top-56 -right-56',
    'top-left': '-top-56 -left-56',
    'bottom-right': '-bottom-56 -right-56',
    'bottom-left': '-bottom-56 -left-56',
  };

  /**
   * Sized in viewport-relative units with a cap, so the glow is proportionate
   * on a 320px phone instead of a fixed 40rem blob that swamps the screen —
   * the same reason the type scale uses clamp().
   */
  private static readonly SCALES: Record<StripScale, string> = {
    sm: 'h-[60vw] w-[70vw] max-h-125 max-w-150',
    md: 'h-[80vw] w-[90vw] max-h-160 max-w-190',
    lg: 'h-[110vw] w-[120vw] max-h-205 max-w-250',
  };

  /**
   * `photo-strip-glow` is part of the computed string rather than a static
   * `class` on the element. Angular does merge a static class attribute with a
   * `[class]` binding, but keeping the whole set in one place means there is
   * only one thing to read when asking what classes this element has.
   */
  protected readonly glowClasses = computed(
    () =>
      `photo-strip-glow ${UiStripBackdrop.ANCHORS[this.anchor()]} ${UiStripBackdrop.SCALES[this.scale()]}`,
  );
}
