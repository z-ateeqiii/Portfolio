import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/** How an element enters. See the per-mode notes on `REVEALS` below. */
export type RevealMode = 'item' | 'children' | 'grid';

/**
 * Scroll reveal (07 §5, §5a, brief §25). Phase 7; extended in the full visual
 * alignment pass (2026-09-07).
 *
 * ─── The rule this directive is built around ─────────────────────────────────
 * "No animation should delay a visitor's access to real content — a page must
 * be usable the instant it renders, motion or not" (07 §5).
 *
 * The usual way to build a scroll reveal breaks that rule: put `opacity: 0` in
 * the CSS, animate to 1 when the element scrolls in. If the JavaScript is slow,
 * blocked, or broken, the content is simply invisible — permanently. On a
 * server-rendered site whose entire premise is being readable and indexable
 * (brief §29), shipping HTML full of real content and then hiding it with CSS
 * is the worst possible failure mode. ui-ux-pro-max's own Scroll Reveal entry
 * names this as the anti-pattern: "Don't reveal below-the-fold content needed
 * for SEO/crawlers as invisible-by-default without a no-JS fallback."
 *
 * So NOTHING here is hidden in CSS. The element renders visible; this directive
 * hides it only after JavaScript has run, confirmed motion is wanted, and
 * loaded GSAP. If any of that fails, the page stays exactly as the server sent
 * it — fully readable.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Two further consequences of the same rule:
 *
 * - Elements ALREADY IN THE VIEWPORT are never animated. Hiding something the
 *   visitor is currently looking at, to fade it back in, is a flicker that
 *   delays reading for no storytelling benefit. A reveal only makes sense for
 *   content being scrolled to, so that is the only place it applies.
 * - `prefers-reduced-motion` exits before GSAP is even fetched, so a visitor who
 *   asked for less motion does not download an animation library either.
 *
 * GSAP is dynamically imported so it stays out of the initial bundle and never
 * loads during SSR (06 §7). Repeated `import()` calls resolve from the module
 * cache, so a page with thirty revealing elements still fetches it once.
 *
 * ─── Why there are three modes and not one ───────────────────────────────────
 * The original single fade-and-rise was applied to every section on the site,
 * which made an eight-section page perform the identical gesture eight times —
 * the "one duration for every transition" anti-pattern in ui-ux-pro-max's
 * Animation category. The three modes below are all still single-direction and
 * still reveal-once, per 07 §5; what differs is whether the thing entering is
 * one block, a sequence, or a grid — and a sequence that arrives in sequence is
 * carrying information (there are several of these, in this order) rather than
 * just moving.
 *
 *   <section appReveal>…</section>                     one block
 *   <div appReveal mode="children">…</div>             a list, in order
 *   <div appReveal mode="grid">…cards…</div>           a grid, as a wave
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealDirective {
  /** Small stagger index — multiplied into a delay so sibling blocks that each
   *  carry their own `appReveal` enter in order rather than together. */
  readonly appReveal = input<number | ''>('');

  readonly mode = input<RevealMode>('item');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Tuning per mode, taken from the ui-ux-pro-max GSAP presets so the numbers
   * are sourced rather than guessed:
   *
   *  item     "Scroll Reveal / Standard"  — 400-600ms, power2.out
   *  children "Scroll Reveal / Standard"  — the stagger variant, 0.08 each.
   *                                         Its Don't: no more than ~8 children,
   *                                         beyond which the last item feels
   *                                         laggy. Enforced in `run()`.
   *  grid     "Stagger List / Standard"   — back.out(1.4) with `grid: 'auto'`,
   *                                         which lets GSAP infer rows and
   *                                         columns from the CSS grid and
   *                                         reveal as a diagonal wave.
   *
   * `y` stays small everywhere (12-24px): the preset's Do is "keep the y offset
   * small so it reads as a fade, not a slide", which is also 07 §5's "subtle,
   * single-direction".
   */
  private static readonly REVEALS: Record<
    RevealMode,
    { y: number; duration: number; ease: string; stagger: number; scale?: number }
  > = {
    item: { y: 16, duration: 0.5, ease: 'power2.out', stagger: 0 },
    children: { y: 24, duration: 0.5, ease: 'power2.out', stagger: 0.08 },
    grid: { y: 16, duration: 0.45, ease: 'back.out(1.4)', stagger: 0.06, scale: 0.94 },
  };

  constructor() {
    /**
     * `afterNextRender` runs in the browser only, so this never executes during
     * SSR and never touches the server-rendered markup.
     */
    afterNextRender(() => {
      void this.reveal();
    });
  }

  private async reveal(): Promise<void> {
    const element = this.host.nativeElement;

    // 07 §5: respected without exception, and checked before anything is loaded.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Already visible: leave it alone rather than hiding and re-showing it.
    const box = element.getBoundingClientRect();
    if (box.top < window.innerHeight) return;

    try {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      this.run(gsap, element);
    } catch {
      /**
       * If GSAP fails to load, the element is still visible because it was
       * never hidden. Nothing to clean up, nothing to restore.
       */
    }
  }

  private run(gsap: typeof import('gsap').gsap, element: HTMLElement): void {
    const mode = this.mode();
    const spec = RevealDirective.REVEALS[mode];

    /**
     * In the staggered modes the CHILDREN move and the container does not —
     * animating both would compound the offsets and double the travel.
     *
     * A container with more children than the preset's ceiling falls back to
     * revealing as one block. Staggering twenty cards at 0.08s each is 1.6s
     * before the last one appears, which stops being a reveal and becomes a
     * queue the visitor waits in.
     */
    const children = mode === 'item' ? [] : Array.from(element.children);
    const staggered = children.length > 0 && children.length <= 8;
    const targets: Element | Element[] = staggered ? children : element;

    gsap.set(targets, { opacity: 0, y: spec.y, ...(staggered && spec.scale ? { scale: spec.scale } : {}) });

    gsap.to(targets, {
      opacity: 1,
      y: 0,
      ...(staggered && spec.scale ? { scale: 1 } : {}),
      duration: spec.duration,
      /**
       * `grid: 'auto'` is what turns a grid of cards into a diagonal wave
       * rather than a straight left-to-right sweep — GSAP reads the actual
       * laid-out rows and columns. It is harmless on a single-column list,
       * which is what the same grid becomes on mobile.
       */
      stagger: staggered ? { each: spec.stagger, from: 'start' as const, grid: 'auto' as const } : 0,
      /** Sibling blocks that each carry their own appReveal index. */
      delay: staggered ? 0 : Math.min(Number(this.appReveal()) || 0, 4) * 0.06,
      ease: spec.ease,
      scrollTrigger: {
        trigger: element,
        start: 'top 88%',
        /** Once only — 07 §5 rules out constant movement (brief §25). */
        once: true,
      },
    });
  }
}
