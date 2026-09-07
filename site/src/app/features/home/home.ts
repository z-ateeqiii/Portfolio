import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { imageUrl } from '../../core/cloudinary/cloudinary.config';
import type { ProjectsWithCovers } from '../../core/content/project-covers';
import { COPY, PROCESS } from '../../core/content/site-copy';
import { ProofPoint } from '../../core/models';
import { SeoService } from '../../core/seo/seo.service';
import { SiteState } from '../../core/services/site-state';
import { UiStripBackdrop } from '../../shared/blocks/strip-backdrop/strip-backdrop';
import { RevealDirective } from '../../shared/motion/reveal.directive';
import { UiButton, UiCard, UiEyebrow, UiTag } from '../../shared/ui';

/**
 * Home (02 §4).
 *
 * Section order is 02 §4's, unchanged: Hero, Proof Strip, Featured Work, How I
 * Work, Story Teaser, Beyond Code Teaser, Contact CTA. The order is the design
 * — it takes a recruiter from "who is this" to "show me the work" without
 * scrolling past anything they did not ask for, while leaving three doors open
 * for anyone who wants to go deeper.
 *
 * Every section renders only if it has content. The Proof Strip is the clear
 * case: 02 §4.2 marks it optional and brief §22 says numbers must be verified,
 * and `proofPoints` is deliberately empty (04 §11), so the strip is absent
 * rather than filled with whatever figures happened to be available.
 *
 * ─── The Hero has two forms, and both are real ────────────────────────────────
 * Visual-identity redesign, 2026-09-06 (see `00` §26, `04` §2): a full-bleed
 * personal photo plus a rotating role title, reversing the original
 * "no portrait" rule. `Profile.heroImage`/`heroTitles` are both optional and
 * new to the schema, so a Profile document written before this change simply
 * doesn't have them yet — this renders the ORIGINAL simple hero
 * (`heroStatement`/`heroSubline` only) until both are actually seeded through
 * the dashboard, rather than assuming a field that may not be there (the exact
 * shape of bug `hydrate()` had with `publishedAt` on Media). Nothing is
 * hidden behind a loading state either way — whichever form applies renders
 * synchronously from the resolved Profile, so SSR still emits full content.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, UiButton, UiCard, UiEyebrow, UiStripBackdrop, UiTag],
  template: `
    @let p = profile();

    @if (p?.heroImage && (p?.heroTitles?.length ?? 0) > 0) {
      <!--
        1. HERO — photo variant (00 §26, 04 §2, 07 §4c).

        HEIGHT is svh-based and capped at both ends. vh on mobile means the
        LARGEST viewport — the one you only get after the browser chrome
        retracts — so a 92vh hero with bottom-anchored content pushed the CTA
        row under the address bar on first paint. svh is the small viewport,
        so what is laid out is what is actually visible. The max cap stops the
        hero becoming a wall of empty photo on a tall monitor, and the min
        keeps it usable on a short landscape screen. Net effect: View Work and
        Resume are above the fold at every common screen height, which matters
        because they are the two things a recruiter came to press (brief §28).
      -->
      <section class="relative flex h-[80svh] max-h-184 min-h-136 w-full items-end bg-bg">
        <!--
          The photo and its gradient are clipped by THIS wrapper, not by the
          section. The parallax layer is translated on scroll and genuinely has
          to be contained — but putting the clip on the section would also
          slice the glow below, redrawing the exact hard seam that the
          backdrop component was just changed to stop causing.
        -->
        <div class="absolute inset-0 overflow-hidden">
          <div
            #photoLayer
            class="absolute inset-0 bg-cover bg-center grayscale contrast-125 brightness-[.82]"
            [style.background-image]="'url(' + heroPhotoUrl() + ')'"
            [attr.role]="'img'"
            [attr.aria-label]="p!.heroImage!.alt"
          ></div>
          <div
            class="absolute inset-0"
            style="background:linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.05) 30%, rgba(0,0,0,.74) 74%, rgba(0,0,0,.98) 100%)"
          ></div>
        </div>

        <ui-strip-backdrop anchor="bottom-left" scale="lg" />

        <!--
          LAYER ORDER IS THE EFFECT, so it is set per child rather than on this
          wrapper: backdrop z-0, headline z-10, contrast strip z-20, everything
          else z-30. Only the headline is left underneath the strip.

          This wrapper deliberately carries position:relative with NO z-index.
          A relative element at z-index auto does not create a stacking
          context, so its children compete directly with the strip that is
          their parent's sibling. Putting a z-index here instead would trap
          every child inside one context and the strip could never come between
          them — which is exactly the bug this replaced.
        -->
        <div class="container-wide relative flex flex-col items-start gap-6 pb-16 sm:pb-24">
          <p class="relative z-30 mono-label text-action">
            Role {{ pad(heroTitleIndex() + 1) }} / {{ pad(p!.heroTitles!.length) }}
          </p>

          <!--
            THE ROTATING TITLE.

            Two nested spans, each owning exactly one thing, because the outer
            <h1> already carries a scaleX from the display-condensed utility and a second
            transform on the same element would silently overwrite it:
              - the CLIP wrapper hides the word as it rolls out of frame;
              - the ROLL span is the only thing GSAP translates.

            The vertical padding on the clip wrapper is not decoration: the
            display-hero line-height is 0.86, tighter than the glyph box, so a
            flush overflow-hidden would shave the tops of the capitals. The
            negative margin takes the added height back out of the layout so
            the block below does not move.

            SET IN UPPERCASE, which is presentation and not a content edit —
            the stored titles keep their own casing and every other use of them
            is unaffected. It matters for two reasons: the reference sets this
            headline in caps, and Title Case is narrow enough that the shortest
            title ("Builder") would stop short of the contrast strip entirely,
            so the effect would fire on some titles and not others.

            The word is real text in the server-rendered HTML, so it is
            readable and indexable before any of this runs, and the full title
            is always in the accessibility tree even while the strip visually
            covers part of it.
          -->
          <h1 class="display-condensed relative z-10 font-display text-display-hero text-fg uppercase">
            <span class="relative my-[-0.08em] block overflow-hidden py-[0.08em]">
              <span #titleRoll class="block will-change-transform">{{
                p!.heroTitles![heroTitleIndex()]
              }}</span>

              <!--
                The wipe band. Same idea as the contrast strip that cuts the
                headline, but kinetic: it sweeps across the word each time the
                title changes, and the swap happens while it is passing over —
                so the new word emerges from behind it rather than dissolving
                into place. Contained by the clip wrapper above, hidden until
                GSAP drives it, and inert to assistive tech.
              -->
              <span
                #titleWipe
                class="title-wipe pointer-events-none absolute inset-y-0 left-0 w-1/4 opacity-0"
                aria-hidden="true"
              ></span>
            </span>
          </h1>

          <div class="rule-strip relative z-30"></div>

          <!--
            The row below the rule: the two primary actions on the left, and
            the positioning line plus subline on the right. The reference puts
            a left/right pair here and the right half was empty, because the
            only thing the mockup had there was a location, which is not a
            field that exists (10 §1). These two are real Profile fields and
            they belong together — positioning names the role, heroSubline
            says how he works.
          -->
          <div class="relative z-30 flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div class="flex flex-wrap items-center gap-4">
              <a uiButton routerLink="/work">View Work</a>
              @if (p!.resumeFile) {
                <a uiButton variant="secondary" [href]="p!.resumeFile" target="_blank" rel="noopener">
                  Resume
                </a>
              }
            </div>

            <div class="max-w-md md:text-right">
              <p class="mono-label text-fg-muted">{{ p!.positioning }}</p>
              @if (p!.heroSubline) {
                <p class="mt-3 text-body text-fg">{{ tidy(p!.heroSubline) }}</p>
              }
            </div>
          </div>
        </div>

        <!--
          THE CONTRAST STRIP (07 §4c) — the reference's signature.

          The same photo, at the same size and position so it registers exactly
          with the layer below, but lifted out of the darkening treatment and
          clipped to a vertical band. Because it paints ABOVE the headline and
          BELOW everything else, the giant word runs behind it and re-emerges
          on the other side. That is the "high-contrast strip cutting through
          the letters" — in the mockup it happened because white type crossed a
          bright white sleeve; here it is a real layer, so it is deliberate and
          it lands in the same place every time.

          Desktop only. Across a phone-width headline the band would swallow a
          whole word rather than slice a letter, and the title has to stay
          readable more than it has to be clever.

          It also doubles as the transition: the wipe band below sweeps a copy of
          this same band across the word as it changes.
        -->
        <div
          #stripLayer
          class="pointer-events-none absolute inset-0 z-20 hidden bg-cover bg-center
                 grayscale contrast-[1.45] brightness-[1.12] md:block"
          [style.background-image]="'url(' + heroPhotoUrl() + ')'"
          style="clip-path: inset(0 36% 0 48%)"
          aria-hidden="true"
        ></div>

        <div
          class="photo-strip-frame top-16 right-16 z-30 hidden h-112 w-52 lg:block"
          aria-hidden="true"
        ></div>
      </section>
    } @else if (p) {
      <!-- 1. HERO — simple variant (02 §4.1). No photo, so nothing is layered
           over an image; the strip treatment is carried by the backdrop alone.

           The statement stays at display-1 rather than the oversized
           display-hero: heroStatement is a full sentence, and the condensed
           oversized size is for a short NAME or role word. Condensing a
           sentence reads as broken rather than bold — the same call made on
           the Work index heading. -->
      <section class="relative flex min-h-[78vh] items-end pt-20 pb-16 sm:pt-28">
        <ui-strip-backdrop anchor="bottom-left" scale="lg" />

        <div class="container-wide stagger-in-lead relative flex flex-col items-start gap-7">
          <p class="mono-label text-action">{{ p.positioning }}</p>

          <h1 class="max-w-4xl text-display-1 font-display text-fg">{{ p.heroStatement }}</h1>

          @if (p.heroSubline) {
            <p class="max-w-xl text-body-lg text-fg">{{ p.heroSubline }}</p>
          }

          <div class="rule-strip mt-3"></div>

          <div class="flex flex-wrap items-center gap-4">
            <a uiButton routerLink="/work">View Work</a>
            @if (p.resumeFile) {
              <a uiButton variant="secondary" [href]="p.resumeFile" target="_blank" rel="noopener">
                Resume
              </a>
            }
          </div>
        </div>
      </section>
    }

    <!-- 2. Proof Strip (02 §4.2) — optional, and currently empty by design. -->
    @if (provenProofPoints().length) {
      <section class="container-wide pb-16">
        <div class="rule-strip"></div>
        <ul appReveal mode="children" class="mt-8 flex flex-wrap gap-x-12 gap-y-6">
          @for (point of provenProofPoints(); track point.id) {
            <li>
              <p class="display-condensed font-display text-display-2 text-fg">{{ point.value }}</p>
              <p class="mono-label mt-2 text-fg-muted">{{ point.label }}</p>
            </li>
          }
        </ul>
      </section>
    }

    <!-- 3. Featured Work (02 §4.3) — leads with Scholarship, per brief §15. -->
    @if (featured().projects.length) {
      <section class="relative py-16">
        <ui-strip-backdrop anchor="top-right" scale="sm" />

        <div class="container-wide relative">
          <ui-eyebrow index="01">Featured Work</ui-eyebrow>
          <h2 class="mt-5 max-w-2xl text-display-2 font-display text-fg">{{ copy.featuredWork }}</h2>

          <div appReveal mode="grid" class="mt-10 grid gap-6 md:grid-cols-2">
            @for (project of featured().projects; track project.slug) {
              <ui-card
                [interactive]="true"
                [accent]="project.tier === 'featured'"
                [flush]="true"
              >
                <!--
                  Cover image (04 §6's isFeatured), rendered only when a project
                  has one — a text-only card is the existing, already-correct
                  fallback (brief §32: missing media never blocks a page).
                  Desaturated, and un-desaturating on hover, matching /work.
                -->
                @if (featured().covers[project.slug]; as cover) {
                  <div class="overflow-hidden">
                    <img
                      [src]="cover.url"
                      [alt]="cover.alt"
                      loading="lazy"
                      decoding="async"
                      class="hover-reveal-media aspect-video w-full object-cover grayscale
                             contrast-115"
                    />
                  </div>
                }

                <div class="p-6">
                  <div class="flex items-baseline justify-between gap-4">
                    <h3 class="display-condensed text-display-3 font-display text-fg">
                      <a
                        [routerLink]="['/work', project.slug]"
                        class="text-fg no-underline transition-colors duration-(--duration-base)
                               ease-out-strong hover:text-action"
                        >{{ project.name }}</a
                      >
                    </h3>
                    @if (project.timeframe) {
                      <span class="mono-label shrink-0 text-fg-muted">{{ project.timeframe }}</span>
                    }
                  </div>

                  <p class="mt-4 text-body text-fg-muted">{{ project.tagline }}</p>

                  <ul class="mt-6 flex flex-wrap gap-2">
                    @for (tech of project.stack; track tech; let i = $index) {
                      <li><ui-tag [icon]="tagIcon(i)">{{ tech }}</ui-tag></li>
                    }
                  </ul>
                </div>
              </ui-card>
            }
          </div>

          <p class="mt-8">
            <a
              routerLink="/work"
              class="sweep-underline inline-flex min-h-11 items-center text-body text-action
                     no-underline"
              >All work →</a
            >
          </p>
        </div>
      </section>
    }

    <!-- 4. How I Work (02 §4.4) — condensed from brief §10, not the full list.
         The four movements stagger as a grid: they are a sequence, and arriving
         in sequence says so without numbering them. -->
    <section class="container-wide py-16">
      <ui-eyebrow index="02">How I Work</ui-eyebrow>
      <h2 class="mt-5 max-w-2xl text-display-2 font-display text-fg">{{ copy.process }}</h2>

      <ol appReveal mode="grid" class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        @for (movement of process; track movement.title) {
          <li
            class="border-t border-fg/12 pt-4 transition-colors duration-(--duration-base)
                   ease-out-strong hover:border-action/60"
          >
            <p class="mono-label text-fg">{{ movement.title }}</p>
            <ul class="mt-3 space-y-2">
              @for (step of movement.steps; track step) {
                <li class="text-caption text-fg-muted">{{ step }}</li>
              }
            </ul>
          </li>
        }
      </ol>
    </section>

    <!-- 5. Story Teaser (02 §4.5) — a short excerpt, bridging into /about. -->
    @if (storyExcerpt(); as excerpt) {
      <section appReveal mode="children" class="container-wide py-16">
        <ui-eyebrow index="03">Story</ui-eyebrow>
        <h2 class="mt-5 max-w-2xl text-display-2 font-display text-fg">{{ copy.storyTeaser }}</h2>
        <p class="mt-6 max-w-2xl text-body-lg text-fg-muted">{{ excerpt }}</p>
        <p class="mt-8">
          <a
            routerLink="/about"
            class="sweep-underline inline-flex min-h-11 items-center text-body text-action
                   no-underline"
            >The full story →</a
          >
        </p>
      </section>
    }

    <!-- 6. Beyond Code Teaser (02 §4.6) — one line and a door, not a section. -->
    <section appReveal mode="children" class="container-wide py-16">
      <ui-eyebrow index="04">Beyond Code</ui-eyebrow>
      <p class="mt-5 max-w-2xl text-display-3 font-display text-fg">{{ copy.beyondTeaser }}</p>
      <p class="mt-8">
        <a
          routerLink="/beyond"
          class="sweep-underline inline-flex min-h-11 items-center text-body text-action
                 no-underline"
          >Take a look →</a
        >
      </p>
    </section>

    <!-- 7. Contact / Closing CTA (02 §4.7). The last full-strip moment before
         the footer, so the page closes lit rather than trailing off. -->
    @if (p) {
      <section class="relative py-16">
        <ui-strip-backdrop anchor="bottom-right" scale="sm" />

        <div class="container-wide relative">
          <ui-eyebrow index="05">Contact</ui-eyebrow>
          <h2 class="mt-5 max-w-2xl text-display-2 font-display text-fg">{{ copy.contact }}</h2>
          <div class="mt-8 flex flex-wrap items-center gap-4">
            <a uiButton [href]="'mailto:' + p.contactEmail">Email me</a>
            @if (p.resumeFile) {
              <a uiButton variant="secondary" [href]="p.resumeFile" target="_blank" rel="noopener">
                Resume
              </a>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class Home implements OnInit {
  /** Resolved per-route (see app.routes.ts). */
  readonly featured = input<ProjectsWithCovers>({ projects: [], covers: {} });
  readonly proofPoints = input<ProofPoint[]>([]);

  /**
   * Proof points that actually state something (found 2026-09-07).
   *
   * A ProofPoint created in the dashboard and never filled in is a real record
   * with `value: ''` and `label: ''`, and the strip was rendering it as a blank
   * list item — an empty figure presented as a credential. brief §22 requires
   * proof-point numbers to be verified before they are published, and an empty
   * one is unverified by definition.
   *
   * Filtered here rather than fixed in the data because the same empty record
   * can be created again at any time from the dashboard. The section as a whole
   * disappears when nothing survives the filter, which is the same rule the
   * rest of the site follows: a missing section beats an empty shelf
   * (brief §32).
   */
  protected readonly provenProofPoints = computed(() =>
    this.proofPoints().filter((p) => p.value.trim() !== '' && p.label.trim() !== ''),
  );

  /** Shared across every route, so it is read from the store, not re-fetched. */
  protected readonly profile = inject(SiteState).profile;

  protected readonly copy = COPY;
  protected readonly process = PROCESS;

  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly photoLayer = viewChild<ElementRef<HTMLElement>>('photoLayer');
  private readonly stripLayer = viewChild<ElementRef<HTMLElement>>('stripLayer');
  private readonly titleRoll = viewChild<ElementRef<HTMLElement>>('titleRoll');
  private readonly titleWipe = viewChild<ElementRef<HTMLElement>>('titleWipe');

  /** Which of `heroTitles` is showing. */
  protected readonly heroTitleIndex = signal(0);

  private rotationTimer?: ReturnType<typeof setInterval>;
  private scrollHandler?: () => void;

  /**
   * Removes a space that sits before its punctuation ("myself , so" →
   * "myself, so").
   *
   * This is a typographic repair, not a content edit: it deletes an erroneous
   * character and can never change a word. It lives at render rather than in
   * the data because `heroSubline` is edited through the dashboard, so the
   * same slip can be reintroduced at any time — the same reasoning as the
   * empty-proof-point filter above. The stored value should still be corrected
   * in `/admin/profile`; this only stops it reaching a visitor meanwhile.
   */
  protected tidy(text: string): string {
    return text.replace(/\s+([,.;:!?])/g, '$1');
  }

  constructor() {
    /**
     * Browser-only, same as `RevealDirective`: `afterNextRender` never runs
     * during SSR, so the rotation timer and the scroll listener below can
     * never leak into the server-rendered response — the first title (index
     * 0) is what SSR emits, which is also a completely valid resting state,
     * not a "loading" one.
     */
    afterNextRender(() => {
      const titles = this.profile()?.heroTitles;
      if (titles && titles.length > 1) void this.startRotation(titles.length);
      this.startParallax();
    });

    this.destroyRef.onDestroy(() => {
      if (this.rotationTimer) clearInterval(this.rotationTimer);
      if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    });
  }

  protected heroPhotoUrl(): string {
    const image = this.profile()?.heroImage;
    return image ? imageUrl(image.publicId, 1600) : '';
  }

  /** "01", "02", ... — matches the mono counter's zero-padded style. */
  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  /**
   * Stack is free-text (04 §3) with no real per-technology meaning to assign
   * an icon shape to, so the three shapes just cycle by position — the same
   * purely-rhythmic alternation the design reference itself uses.
   */
  protected tagIcon(index: number): 'diamond' | 'square' | 'circle' {
    return (['diamond', 'square', 'circle'] as const)[index % 3];
  }

  /**
   * The rotating-title transition (07 §5a).
   *
   * ─── Why this is not a crossfade ─────────────────────────────────────────────
   * A fade between two words is the default every site reaches for, and it says
   * nothing about this one. The motion here is built from the site's own
   * signature instead: the contrast strip that cuts through the headline is
   * what performs the change.
   *
   * Two things happen together:
   *   1. A WIPE band — the strip made kinetic — sweeps across the word.
   *   2. The word ROLLS: the outgoing title travels up out of a clipped frame
   *      and the incoming one arrives from below, like an odometer. That reads
   *      far better on oversized condensed type than a fade, because the type
   *      is the thing with presence and movement keeps it solid rather than
   *      dissolving it into a ghost.
   *
   * The swap itself is timed to happen WHILE the band is over the word, so the
   * new title emerges from behind it. Nothing announces the change; the strip
   * passes and the word has become the next one.
   *
   * Everything animated is `transform` and `opacity`, so it stays on the
   * compositor and never triggers layout. GSAP's free core only — no
   * SplitText, no Club plugin, nothing requiring a licence key.
   * ─────────────────────────────────────────────────────────────────────────────
   *
   * Under `prefers-reduced-motion` the rotation does not start at all, and the
   * first title stays. That is deliberate: this criterion is not only about
   * how a transition looks but about content that changes on its own, and
   * index 0 is a complete, honest resting state rather than a loading one. It
   * also means GSAP is never fetched for that visitor — the same rule
   * `RevealDirective` follows.
   */
  private async startRotation(count: number): Promise<void> {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let gsap: typeof import('gsap').gsap;
    try {
      ({ gsap } = await import('gsap'));
    } catch {
      /** No GSAP, no rotation. The first title is already on screen and
       *  readable, so there is nothing to fall back to. */
      return;
    }

    /** Dwell long enough to actually read the word before it moves again. */
    const CYCLE_MS = 3400;
    this.rotationTimer = setInterval(() => this.rollToNextTitle(gsap, count), CYCLE_MS);
  }

  private rollToNextTitle(gsap: typeof import('gsap').gsap, count: number): void {
    const roll = this.titleRoll()?.nativeElement;
    if (!roll) return;

    const timeline = gsap.timeline();
    const wipe = this.titleWipe()?.nativeElement;

    if (wipe) {
      /**
       * The band is a quarter of the headline wide, so crossing the full width
       * plus its own body is roughly 500% of itself. Expressed in `xPercent`
       * rather than pixels so it needs no measurement and stays correct when
       * the fluid type scale resizes the heading.
       */
      timeline
        .fromTo(
          wipe,
          { xPercent: -140, opacity: 1 },
          { xPercent: 500, duration: 0.78, ease: 'power2.inOut' },
          0,
        )
        .set(wipe, { opacity: 0 });
    }

    timeline
      /** Out through the top of the clipped frame. */
      .to(roll, { yPercent: -130, duration: 0.28, ease: 'power3.in' }, 0.14)
      /** Swapped while the band covers it — this is the moment of the trick. */
      .add(() => this.heroTitleIndex.update((i) => (i + 1) % count))
      .set(roll, { yPercent: 130 })
      /** And in from below. */
      .to(roll, { yPercent: 0, duration: 0.38, ease: 'power3.out' });
  }

  /**
   * Photo layer translates at 0.85× scroll, text stays at 1× (it's a sibling
   * layer, untouched) — hero only, transform-only, and skipped entirely under
   * prefers-reduced-motion, checked before a single scroll listener attaches.
   */
  private startParallax(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = this.photoLayer()?.nativeElement;
    if (!layer) return;

    /**
     * The contrast strip is the same photo at the same size and position, so
     * it MUST travel with the base layer — a pixel of drift between them and
     * the illusion that one continuous image is being sliced falls apart.
     * Hence the identical transform rather than a second, separately-tuned
     * parallax factor.
     */
    const strip = this.stripLayer()?.nativeElement;

    let ticking = false;
    this.scrollHandler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const shift = `translateY(${window.scrollY * -0.15}px)`;
        layer.style.transform = shift;
        if (strip) strip.style.transform = shift;
        ticking = false;
      });
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  /**
   * Set in ngOnInit, not an effect.
   *
   * Effects do not flush before Angular serialises the server-rendered HTML, so
   * an effect-based version emitted no meta tags at all on the first response —
   * which is the only response a crawler or link-preview bot ever sees. Caught
   * by grepping the served HTML for the canonical tag rather than trusting the
   * code to have run. ngOnInit runs during SSR, after inputs are bound.
   */
  ngOnInit(): void {
    const p = this.profile();
    if (!p) return;
    this.seo.apply({
      path: '/',
      title: `${p.name} — ${p.positioning}`,
      description: p.bioShort,
      jsonLd: this.seo.personSchema(p),
    });
  }

  /**
   * First paragraph of the seeded `bioLong` (04 §2).
   *
   * 02 §4.5 asks for "a short excerpt" of the journey, and the full narrative
   * already exists as content — so the teaser is a slice of the real thing
   * rather than a second, separately-written summary that could drift out of
   * step with it.
   */
  protected storyExcerpt(): string {
    return this.profile()?.bioLong.split('\n\n')[0] ?? '';
  }
}
