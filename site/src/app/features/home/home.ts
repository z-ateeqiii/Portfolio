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

        DELIBERATELY PLAIN. An earlier pass layered a "contrast strip" over the
        headline — a band of the undarkened photo painted above the type, so
        the word ran behind it and re-emerged. Rendered, it did not read as the
        reference did: it cut SOFTWARE mid-word and the rest never came back,
        so the one line a visitor must be able to read was the one thing on the
        page they could not. It is gone. The headline is plain text now, and
        the identity is carried by the photo, the glow, the grain and the type
        itself — which is enough.

        HEIGHT is content-driven with a floor, not a fixed viewport fraction.
        A fixed height forced a gap below the actions on a tall screen; a floor
        keeps the hero full-bleed on a normal one and lets it grow rather than
        stretch. svh not vh, because vh on mobile means the LARGEST viewport —
        the one you only get once the browser chrome retracts — which put the
        actions under the address bar on first paint.
      -->
      <section class="relative flex min-h-[95svh] w-full items-end bg-bg pt-28 pb-12">
        <!--
          The photo and its gradients are clipped by THIS wrapper, not by the
          section. The parallax layer is translated on scroll and genuinely has
          to be contained — but putting the clip on the section would also
          slice the glow below, redrawing the hard seam the backdrop component
          was changed to stop causing.
        -->
        <div class="absolute inset-0  overflow-hidden">
          <div
            #photoLayer
            class="absolute inset-0 bg-cover bg-center grayscale contrast-115 brightness-[1]"
            [style.background-image]="'url(' + heroPhotoUrl() + ')'"
            [attr.role]="'img'"
            [attr.aria-label]="p!.heroImage!.alt"
          ></div>

          <!-- Vertical scrim: holds the top and bottom edges down so the
               header and the section below meet the photo cleanly. -->
          <div
            class="absolute inset-0"
            style="background:linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.05) 30%, rgba(0,0,0,.74) 74%, rgba(0,0,0,.98) 100%)"
          ></div>

          <!--
            HORIZONTAL SCRIM — the reason every word in this hero is readable.

            All the copy sits in a left column, and the photo behind it is a
            high-contrast portrait whose brightest region is a lit sleeve just
            right of centre. Without this, the subline crossed that sleeve and
            became white-on-white: legible in one title state and not in the
            next, because the block's width changes with the length of the
            word above it.

            A scrim removes the variable entirely rather than trying to dodge
            it. It fades out well before the subject's face, so the portrait is
            still the photograph it was, and it is the layer that makes the
            left column safe at every viewport width and in every title state.
          -->
     
        </div>

        <ui-strip-backdrop anchor="bottom-left" scale="lg" />

        <div class="container-wide relative z-10 flex flex-col items-start gap-4 mb-15">
          <p class="mono-label text-action">
            Role {{ pad(heroTitleIndex() + 1) }} / {{ pad(p!.heroTitles!.length) }}
          </p>

          <!--
            The rotating title. A plain cross-fade on the inner span: the outer
            h1 already carries a scaleX from display-condensed, and a second
            transform on the same element silently overwrites it, so the two
            live on separate elements.

            No GSAP here. A fade between two words is two CSS properties and it
            cannot break; reaching for a timeline to do it was complexity this
            hero did not need.

            The word is real text in the server-rendered HTML, so it is
            readable and indexable before any script runs, and index 0 is a
            complete resting state rather than a loading one.
          -->
          <!--
            min-height reserves TWO lines, which is what the longest title
            needs. Without it the block reflowed every few seconds: "Builder"
            is one line and "Frontend Specialist" is two, so the hero grew and
            shrank on a timer and everything below it stepped up and down. The
            reference calls for exactly this ("bottom-anchored so the stack
            below never moves"); reserving the space is how that is kept.
            1.72em is two lines at the display-hero line-height of 0.86.
          -->
          <h1 class="display-condensed min-h-[1.72em] font-display text-display-hero text-fg">
            <span
              class="block transition-opacity duration-(--duration-slow) ease-out-soft"
              [class.opacity-0]="!heroTitleVisible()"
              >{{ p!.heroTitles![heroTitleIndex()] }}</span
            >
          </h1>

          <!--
            Positioning and subline, in the left column under the title rather
            than floated right over the photograph. positioning names the role,
            heroSubline says how he works; they read as a label and its
            sentence, so they belong together and in that order.
          -->
          <div class="max-w-xl">
            <p class="mono-label text-fg-muted">{{ p!.positioning }}</p>
            @if (p!.heroSubline) {
              <p class="mt-3 text-body-lg text-fg">{{ tidy(p!.heroSubline) }}</p>
            }
          </div>

          <div class="rule-strip mt-2"></div>

          <div class="flex flex-wrap items-center gap-4">
            <a uiButton routerLink="/work">View Work</a>
            @if (p!.resumeFile) {
              <a uiButton variant="secondary" [href]="p!.resumeFile" target="_blank" rel="noopener">
                Resume
              </a>
            }
          </div>
        </div>
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
        <!-- <ui-strip-backdrop anchor="bottom-left" scale="lg" /> -->

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
        <!-- <ui-strip-backdrop anchor="top-right" scale="sm" /> -->

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
        <!-- <ui-strip-backdrop anchor="bottom-right" scale="sm" /> -->

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

  /** Which of `heroTitles` is showing, and whether it is mid-fade. */
  protected readonly heroTitleIndex = signal(0);
  protected readonly heroTitleVisible = signal(true);

  private rotationTimer?: ReturnType<typeof setInterval>;
  private fadeTimer?: ReturnType<typeof setTimeout>;
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
      if (titles && titles.length > 1) this.startRotation(titles.length);
      this.startParallax();
    });

    this.destroyRef.onDestroy(() => {
      if (this.rotationTimer) clearInterval(this.rotationTimer);
      if (this.fadeTimer) clearTimeout(this.fadeTimer);
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
   * A cross-fade, driven by one signal and one CSS transition. An earlier
   * version ran a GSAP timeline that swept a band across the word while it
   * rolled out of a clipped frame odometer-style; it was more machinery than
   * this needed, and it depended on the contrast strip that has since been
   * removed for making the headline unreadable. Two CSS properties cannot
   * break, do not need a library, and cost nothing to load.
   *
   * Under `prefers-reduced-motion` the rotation does not start at all and the
   * first title stays. The criterion is not only about how a transition looks
   * but about content that changes on its own, and index 0 is a complete,
   * honest resting state rather than a loading one.
   */
  private startRotation(count: number): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /** Matches --duration-slow, the one deliberately slower transition. */
    const FADE_MS = 420;
    const DWELL_MS = 3000;

    this.rotationTimer = setInterval(() => {
      this.heroTitleVisible.set(false);
      this.fadeTimer = setTimeout(() => {
        this.heroTitleIndex.update((i) => (i + 1) % count);
        this.heroTitleVisible.set(true);
      }, FADE_MS);
    }, DWELL_MS + FADE_MS);
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

    let ticking = false;
    this.scrollHandler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        layer.style.transform = `translateY(${window.scrollY * -0.15}px)`;
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
