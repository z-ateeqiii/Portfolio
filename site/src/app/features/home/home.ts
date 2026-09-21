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
import { ProofPoint, Skill } from '../../core/models';
import { SeoService } from '../../core/seo/seo.service';
import { SiteState } from '../../core/services/site-state';
import { UiMarquee, type MarqueeItem } from '../../shared/blocks/marquee/marquee';
import { skillIcon } from '../../shared/ui/skill-icon/skill-icons';
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
  imports: [
    RouterLink,
    RevealDirective,
    UiButton,
    UiCard,
    UiEyebrow,
    UiMarquee,
    UiStripBackdrop,
    UiTag,
  ],
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
      <!--
        overflow-clip, and it is load-bearing (2026-09-20).

        This section paints two oversized layers — a parallaxed photo and a
        glow much larger than the box it lights. Both are positioned, and a
        positioned z-0 layer paints ABOVE the static sections that follow it in
        the document, so whatever escaped this section landed on top of the
        marquees and the Featured Work cards rather than behind them. Measured
        at 1440x900: the glow overhung the hero by 255px and washed everything
        below it orange.

        Clip rather than hidden: hidden makes the box a scroll container, which
        would also mean any sticky descendant starts sticking to THIS section
        instead of the viewport. Nothing here is sticky today; clip means
        nothing here can be broken by adding one tomorrow.

        Clipping alone would only trade the bleed for a hard line, since the
        glow is still near full strength where the section ends — so the
        backdrop below is contained, which moves the gradient so it has already
        faded out by that edge. The clip is the guarantee, not the fix.
      -->
      <section
        class="relative flex min-h-[95svh] w-full items-end overflow-clip bg-bg pt-28 pb-12"
      >
        <!--
          The photo and its scrim keep their own clip even though the section
          now clips too. They are a unit: the scrim is sized to the photo, and
          an inner wrapper is what guarantees the two stay aligned no matter
          what the section's padding or min-height do to its box.
        -->
        <div class="absolute inset-0  overflow-hidden">
          <!--
            hero-photo-fade is what stops this layer drawing a hard line across
            the page while it moves. Being inset-0 it is exactly the size of the
            frame it parallaxes inside, so it slides off its own bottom edge;
            the utility ramps its last 12% to nothing, and there is no step left
            to see. The full reasoning, including why the layer cannot simply be
            made taller, is on the utility in styles.css.
          -->
          <div
            #photoLayer
            class="hero-photo-fade absolute inset-0 bg-cover bg-center grayscale contrast-115
                   brightness-[1]"
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

        <ui-strip-backdrop anchor="bottom-left" scale="lg" [contained]="true" />

        <div class="container-page relative z-10 flex flex-col items-start gap-4 mb-15">
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

        <div class="container-page stagger-in-lead relative flex flex-col items-start gap-7">
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
      <section class="container-page pb-16">
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

    <!--
      2b. THE TWO STRIPS (07 §5b).

      Placed between the Hero and Featured Work on purpose: they are the
      handoff between "who is this" and "show me the work", and they answer
      both halves in one glance — what he builds with, and what he calls
      himself. Neither is new content. The stack is the stack this site is
      actually built on, and the identity terms are the ones already in the
      brief and in Profile.positioning; nothing here was written for the strip.

      Full-bleed rather than inside container-page, because a strip that stops
      at a container edge reads as a component and a strip that runs off both
      sides reads as motion passing through the page.

      The tech strip is absent entirely when no seeded skill has a brand mark,
      rather than rendering an empty bordered band — the same rule the Proof
      Strip follows (brief §32: a missing section beats an empty shelf).
    -->
    @if (stackMarks().length) {
      <section class="border-y border-fg/12 py-7">
        <!-- No pace given: both strips take the component's default speed,
             which is what makes them read as one rhythm despite one carrying
             four times as much content as the other. -->
        <ui-marquee [items]="stackMarks()" label="Technologies Muhammed works with" />
      </section>
    }

    <section class="border-b border-fg/12 py-7">
      <!-- Runs the other way, so the two strips read as a system rather than
           as the same element repeated. -->
      <ui-marquee
        [items]="identityMarks"
        label="How Muhammed describes his work"
        [reverse]="true"
      />
    </section>

    <!-- 3. Featured Work (02 §4.3) — leads with Scholarship, per brief §15. -->
    @if (featured().projects.length) {
      <section class="relative py-16">
        <!-- <ui-strip-backdrop anchor="top-right" scale="sm" /> -->

        <div class="container-page relative">
          <ui-eyebrow index="01">Featured Work</ui-eyebrow>
          <h2 class="mt-5 max-w-2xl text-display-2 font-display text-fg">{{ copy.featuredWork }}</h2>

          <!--
            Same lead-plus-grid shape as /work, so the two pages read as one
            system: the featured project takes a wide two-column card, the
            rest sit in an even grid beneath it. Home shows a curated subset
            rather than everything, so its grid stops at two columns where
            /work goes to three.
          -->
          @if (homeLead(); as lead) {
            <div class="mt-10">
              <ui-card [interactive]="true" [accent]="true" [flush]="true">
                <div class="grid lg:grid-cols-[1.35fr_1fr]">
                  @if (featured().covers[lead.slug]; as cover) {
                    <div class="media-frame">
                      <img
                        [src]="cover.url"
                        [alt]="cover.alt"
                        loading="lazy"
                        decoding="async"
                        class="hover-reveal-media aspect-[3/2] w-full object-cover grayscale contrast-115
                               sm:aspect-video lg:h-full"
                      />
                    </div>
                  }

                  <div class="flex flex-col justify-between gap-7 p-6 sm:p-10">
                    <div>
                      <p class="mono-label flex items-center gap-2.5 text-action">
                        <span class="size-1.5 shrink-0 bg-action" aria-hidden="true"></span>
                        Featured
                      </p>

                      <h3 class="mt-5 text-display-2 font-display text-fg">
                        <a
                          [routerLink]="['/work', lead.slug]"
                          class="stretched-link text-fg no-underline transition-colors
                                 duration-(--duration-base) ease-out-strong hover:text-action"
                          >{{ lead.name }}</a
                        >
                      </h3>

                      <p class="mt-5 max-w-md text-body-lg text-fg-muted">{{ lead.tagline }}</p>
                    </div>

                    <ul class="flex flex-wrap gap-2">
                      @for (tech of lead.stack; track tech; let i = $index) {
                        <li><ui-tag [icon]="tagIcon(i)">{{ tech }}</ui-tag></li>
                      }
                    </ul>
                  </div>
                </div>
              </ui-card>
            </div>
          }

          @if (homeRest().length) {
            <div appReveal mode="grid" class="mt-6 grid gap-6 md:grid-cols-2">
              @for (project of homeRest(); track project.slug) {
                <ui-card [interactive]="true" [flush]="true">
                <!--
                  Cover image (04 §6's isFeatured), rendered only when a project
                  has one — a text-only card is the existing, already-correct
                  fallback (brief §32: missing media never blocks a page).
                  Desaturated, and un-desaturating on hover, matching /work.
                -->
                @if (featured().covers[project.slug]; as cover) {
                  <div class="media-frame aspect-[3/2] w-full sm:aspect-video">
                    <img
                      [src]="cover.url"
                      [alt]="cover.alt"
                      loading="lazy"
                      decoding="async"
                      class="hover-reveal-media size-full object-cover grayscale contrast-115"
                    />
                  </div>
                }

                <div class="flex flex-1 flex-col p-6 sm:p-7">
                  <div class="flex items-baseline justify-between gap-4">
                    <h3 class="text-display-4 font-display text-fg">
                      <a
                        [routerLink]="['/work', project.slug]"
                        class="stretched-link text-fg no-underline transition-colors
                               duration-(--duration-base) ease-out-strong hover:text-action"
                        >{{ project.name }}</a
                      >
                    </h3>
                    @if (project.timeframe) {
                      <span class="mono-label shrink-0 text-fg-muted">{{ project.timeframe }}</span>
                    }
                  </div>

                  <p class="mt-4 text-body text-fg-muted">{{ project.tagline }}</p>

                  <ul class="mt-auto flex flex-wrap gap-2 pt-7">
                    @for (tech of project.stack; track tech; let i = $index) {
                      <li><ui-tag [icon]="tagIcon(i)">{{ tech }}</ui-tag></li>
                    }
                  </ul>
                </div>
              </ui-card>
              }
            </div>
          }

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
    <section class="container-page py-16">
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
      <section appReveal mode="children" class="container-page py-16">
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
    <section appReveal mode="children" class="container-page py-16">
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

        <div class="container-page relative">
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

  readonly skills = input<Skill[]>([]);

  /**
   * The lead card on Home, chosen by `tier` exactly as /work chooses its own —
   * not by taking the first of `featuredOnHome`. Those are two different
   * decisions: `featuredOnHome` says a project appears here at all, `tier`
   * says how much room it earns (03 §3).
   */
  protected readonly homeLead = computed(
    () => this.featured().projects.find((p) => p.tier === 'featured') ?? null,
  );

  protected readonly homeRest = computed(() => {
    const lead = this.homeLead();
    return this.featured().projects.filter((p) => p !== lead);
  });

  /**
   * The tech strip, built from the seeded Skill records (04 §5) rather than
   * from a list typed into this file.
   *
   * The hardcoded version named six technologies and was accurate, but it was
   * a second place the truth lived: adding a skill in the dashboard changed
   * /about and left Home saying something older. Now there is one source, and
   * the strip cannot disagree with it.
   *
   * Only skills that HAVE a brand mark ride the strip. A scrolling row of
   * logos is a visual device, and "Code Reviews" or "SDLC" in it would be a
   * text item drifting past with nothing to look at — those belong to About's
   * Stack section, which shows everything. This filters on the same icon map
   * the tag component uses, so the two can never disagree about what has a
   * logo.
   */
  protected readonly stackMarks = computed<readonly MarqueeItem[]>(() =>
    this.skills()
      .map((skill) => ({ label: skill.name, path: skillIcon(skill.name)?.path }))
      .filter((item): item is { label: string; path: string } => Boolean(item.path)),
  );

  /**
   * Identity terms, all of them already established elsewhere — the brief's
   * positioning, Profile.positioning, and the Beyond Code sections that exist
   * because he teaches and creates. Nothing was coined to fill the strip; if a
   * seventh is ever wanted it has to come from the same places.
   */
  protected readonly identityMarks: readonly MarqueeItem[] = [
    { label: 'Software Engineer' },
    { label: 'Builder' },
    { label: 'Problem Solver' },
    { label: 'Entrepreneurial Thinker' },
    { label: 'Content Creator' },
    { label: 'Educator' },
  ];

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
   *
   * It stops once the hero has left the viewport, and parks the layer at its
   * resting transform on the way out (2026-09-20). Containment is the
   * section's job — it clips, so nothing was ever escaping geometrically — but
   * there is no reason to keep writing a transform onto an element nobody can
   * see, and a visitor who scrolls the whole page spends most of it in that
   * state. `offsetHeight` is read once here rather than per frame, so this
   * adds a comparison to the handler and no layout work.
   */
  private startParallax(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = this.photoLayer()?.nativeElement;
    if (!layer) return;

    const hero = layer.closest('section');
    let ticking = false;
    this.scrollHandler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const past = hero ? y > hero.offsetHeight : false;
        layer.style.transform = past ? '' : `translateY(${y * -0.15}px)`;
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
