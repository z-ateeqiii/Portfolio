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
 * ─── THE HOST DOES NOT CLIP, AND THAT IS THE WHOLE POINT (2026-09-07) ────────
 * This used to be `overflow-hidden`, and its section used to be too. That drew
 * a hard horizontal line across every page at the exact pixel the section
 * ended: the glow is much larger than the block it lights, so clipping sliced
 * it mid-gradient and the page read as two stacked boxes rather than one
 * continuous surface. It was most obvious on /about, where a short header sat
 * above a long column of prose.
 *
 * So nothing clips it now. The glow ends the way light actually ends — its own
 * radial gradient reaches full transparency at 70% — and it is free to spill
 * into whatever sits above or below, which is what makes consecutive sections
 * read as one lit space. `body { overflow-x: clip }` in styles.css is what
 * stops the horizontal spill from widening the page; that is now the
 * mechanism, not merely a safety net.
 *
 * The one thing the caller still MUST do is set `relative` on the section, or
 * the glow anchors to the nearest positioned ancestor instead — usually the
 * page, which puts it somewhere unintended.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The host sits at `z-0` and every sibling that carries content needs to be
 * above it — `relative` on the content wrapper is enough, since the backdrop
 * establishes no stacking context of its own beyond its own children.
 */
@Component({
  selector: 'ui-strip-backdrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pointer-events-none absolute inset-0 z-0',
    'aria-hidden': 'true',
  },
  template: `
    <div [class]="glowClasses()"></div>
    <!--
      The grain is scoped to the glow's own box rather than the whole section.
      Overlay blend renders as black against a black backdrop, so grain outside
      the lit area is invisible anyway — and an inset-0 grain layer whose
      section had a hard edge was half of the seam this component just stopped
      drawing. The page-level layer in the app shell carries the rest.
    -->
    <div [class]="grainClasses()"></div>
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
    lg: 'h-[160vw] w-[500vw] max-h-195 max-w-200',
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

  /** Same box as the glow, so the texture sits exactly where the light is. */
  protected readonly grainClasses = computed(
    () =>
      `photo-strip-grain ${UiStripBackdrop.ANCHORS[this.anchor()]} ${UiStripBackdrop.SCALES[this.scale()]}`,
  );
}
