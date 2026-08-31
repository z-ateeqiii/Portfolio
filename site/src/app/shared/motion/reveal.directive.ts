import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Scroll reveal (07 §5, brief §25). Phase 7.
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
 * is the worst possible failure mode.
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
 * loads during SSR (06 §7).
 *
 * Single-direction and subtle, per 07 §5: a short upward drift with a fade. No
 * parallax, no scale, no stagger beyond a small per-item offset.
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealDirective {
  /** Small stagger index — multiplied into a delay so a group reveals in order. */
  readonly appReveal = input<number | ''>('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

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

      const index = Number(this.appReveal()) || 0;

      gsap.set(element, { opacity: 0, y: 16 });
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: Math.min(index, 4) * 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          /** Once only — 07 §5 rules out constant movement (brief §25). */
          once: true,
        },
      });
    } catch {
      /**
       * If GSAP fails to load, the element is still visible because it was
       * never hidden. Nothing to clean up, nothing to restore.
       */
    }
  }
}
