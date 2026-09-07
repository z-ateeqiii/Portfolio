import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { imageUrl } from '../../../core/cloudinary/cloudinary.config';
import { Media, Project } from '../../../core/models';
import { SeoService } from '../../../core/seo/seo.service';
import { UiDisclosure } from '../../../shared/blocks/disclosure/disclosure';
import { UiGallery } from '../../../shared/blocks/gallery/gallery';
import { UiStripBackdrop } from '../../../shared/blocks/strip-backdrop/strip-backdrop';
import { RevealDirective } from '../../../shared/motion/reveal.directive';
import { UiButton, UiEyebrow, UiStatusDot, UiTag } from '../../../shared/ui';

/**
 * Case study — /work/:slug (02 §6, 03 §2, 08 §4).
 *
 * ONE template for all five projects, driven entirely by Firestore. The tier
 * system (03 §3) needs no branching here: a compact project simply has no
 * `approach`, so the block is absent because the data is absent rather than
 * because a `@switch (tier)` said so. That keeps promoting a project to a
 * deeper tier (03 §3 explicitly allows this later) a content edit, not a code
 * change.
 *
 * BLOCK ORDER IS FIXED (03 §2): Snapshot → Problem → Approach → Build →
 * Disclosures → Outcome. "Not every project needs all six at full depth — but
 * the order never changes", and 02 §6 restates it. The order is what lets a
 * visitor learn the pattern and trust it across projects.
 *
 * The disclosures are never skipped where present (09 §3). They render from
 * `@if (project.aiDisclosure)` / `@if (project.dataHonestyNote)` with no
 * condition beyond existence — there is deliberately no tier check, no
 * "collapse on mobile", and no way for a future edit to hide one, because
 * brief §14 requires they not be hidden.
 *
 * Stands alone as a shareable link (02 §6): the Snapshot repeats enough context
 * that a recruiter who was forwarded this URL with no covering note still knows
 * what they are looking at.
 */
@Component({
  selector: 'app-case-study',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RevealDirective,
    UiButton,
    UiDisclosure,
    UiEyebrow,
    UiGallery,
    UiStatusDot,
    UiStripBackdrop,
    UiTag,
  ],
  template: `
    @let p = project();

    @if (!p) {
      <!--
        Unknown slug, or a slug whose project is not published. Both land here,
        and that is the point: a draft is indistinguishable from a typo from
        the outside, so nothing leaks about content that exists but is not
        public (05 §6). The query never returned it in the first place.
      -->
      <section class="relative overflow-hidden py-20">
        <ui-strip-backdrop anchor="top-right" scale="sm" />

        <div class="container-content stagger-in-lead relative">
          <ui-eyebrow>404</ui-eyebrow>
          <h1 class="display-condensed mt-5 text-display-1 font-display text-fg">
            This case study isn’t here.
          </h1>
          <p class="mt-6 text-body-lg text-fg-muted">
            The link may be wrong, or the project may not be published.
          </p>
          <p class="mt-8">
            <a
              routerLink="/work"
              class="sweep-underline inline-flex min-h-11 items-center text-body text-action
                     no-underline"
              >See all work →</a
            >
          </p>
        </div>
      </section>
    } @else {
      <article class="py-20">
        <!-- 1. SNAPSHOT (03 §2.1). Photo-strip treatment: glow + grain behind
             the text, an oversized condensed name, and — when the project has
             a cover screenshot — a side panel with the viewfinder crop-mark
             frame. Text reveals in three steps on mount (pure CSS, no JS — see
             the stagger-in utilities in styles.css), distinct from the
             scroll-triggered appReveal directive used further down this page.

             This header deliberately breaks out of container-content to the
             wide container: it is the one full-bleed moment on a page that is
             otherwise a single reading column, which is what makes the switch
             to prose below it feel like arriving somewhere. -->
        <header class="relative overflow-hidden pb-16">
          <ui-strip-backdrop anchor="bottom-right" scale="md" />

          <div
            class="container-wide relative grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center"
          >
            <div>
              <div class="stagger-in-lead">
                <ui-eyebrow>{{ p.tier }} project</ui-eyebrow>
                <h1 class="display-condensed mt-5 text-display-hero font-display text-fg">
                  {{ p.name }}
                </h1>
                <p class="mt-6 max-w-lg text-body-lg text-fg">{{ p.tagline }}</p>
              </div>

              <div class="stagger-in-lead" style="animation-delay:140ms">
                <!-- The reference's metadata row: two facts with a short rule
                     between them, not a definition list of labelled cells.
                     Rendered only for what the project actually carries — the
                     freelance sites have neither, and get no row at all. -->
                @if (p.role || p.timeframe) {
                  <div class="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2">
                    @if (p.role) {
                      <span class="mono-label text-fg-muted">{{ p.role }}</span>
                    }
                    @if (p.role && p.timeframe) {
                      <span class="h-px w-6 bg-fg/30" aria-hidden="true"></span>
                    }
                    @if (p.timeframe) {
                      <span class="mono-label text-fg-muted">{{ p.timeframe }}</span>
                    }
                  </div>
                }

                <ul class="mt-8 flex flex-wrap gap-2">
                  @for (tech of p.stack; track tech; let i = $index) {
                    <li><ui-tag [icon]="tagIcon(i)">{{ tech }}</ui-tag></li>
                  }
                </ul>

                <!-- Links render only when they exist. Cyber50 has neither,
                     because its main repo was never provided (10 §2) — an
                     absent link is honest, a guessed one is a broken promise. -->
                @if (p.liveUrl || p.githubUrl) {
                  <div class="mt-9 flex flex-wrap items-center gap-4">
                    @if (p.liveUrl) {
                      <a uiButton [href]="p.liveUrl" target="_blank" rel="noopener">
                        <ui-status-dot />
                        Live demo
                      </a>
                    }
                    @if (p.githubUrl) {
                      <a uiButton variant="secondary" [href]="p.githubUrl" target="_blank" rel="noopener">
                        Source
                      </a>
                    }
                  </div>
                }
              </div>
            </div>

            @if (headerImage(); as image) {
              <div class="stagger-in-lead relative" style="animation-delay:280ms">
                <div
                  class="photo-strip-frame -top-5 -right-5 hidden h-[calc(100%+2.5rem)] w-3/5 lg:block"
                  aria-hidden="true"
                ></div>
                <img
                  [src]="headerImageSrc(image.publicId)"
                  [alt]="image.alt"
                  loading="lazy"
                  decoding="async"
                  class="relative w-full rounded-md object-cover grayscale contrast-125"
                />
              </div>
            }
          </div>
        </header>

        <div class="container-content">

        <!-- Media (04 §6). Nothing is seeded yet, so this renders nothing —
             missing media never blocks a case study going live (brief §32).
             A masonry grid a visitor can click through, not a static stack
             (Muhammed's manual-testing report) — see UiGallery. -->
        @if (media().length) {
          <div class="mt-14">
            <ui-gallery [items]="media()" />
          </div>
        }

        <!-- 2. THE PROBLEM (03 §2.2).

             Each prose block reveals its own children in sequence (eyebrow,
             then the paragraphs) rather than arriving as one slab. On a page
             that is six ordered blocks by rule (03 §2), motion that arrives in
             order is carrying the same information the numbering does. -->
        <section appReveal mode="children" class="mt-16">
          <ui-eyebrow index="01">The Problem</ui-eyebrow>
          <div class="mt-6 space-y-6">
            @for (para of paragraphs(p.problem); track $index) {
              <p class="text-body-lg text-fg">{{ para }}</p>
            }
          </div>
        </section>

        <!-- 3. THE APPROACH (03 §2.3) — absent on compact tier, by data. -->
        @if (p.approach) {
          <section appReveal mode="children" class="mt-16">
            <ui-eyebrow index="02">The Approach</ui-eyebrow>
            <div class="mt-6 space-y-6">
              @for (para of paragraphs(p.approach); track $index) {
                <p class="text-body-lg text-fg">{{ para }}</p>
              }
            </div>
          </section>
        }

        <!-- 4. THE BUILD (03 §2.4) -->
        <section appReveal mode="children" class="mt-16">
          <ui-eyebrow [index]="p.approach ? '03' : '02'">The Build</ui-eyebrow>
          <div class="mt-6 space-y-6">
            @for (para of paragraphs(p.build); track $index) {
              <p class="text-body-lg text-fg">{{ para }}</p>
            }
          </div>
        </section>

        <!-- 5. DISCLOSURES (03 §2.5, 03 §6.1) — never skipped, never buried. -->
        @if (p.aiDisclosure || p.dataHonestyNote) {
          <div class="mt-12 space-y-4">
            @if (p.aiDisclosure) {
              <ui-disclosure kind="ai">{{ p.aiDisclosure }}</ui-disclosure>
            }
            @if (p.dataHonestyNote) {
              <ui-disclosure kind="data">{{ p.dataHonestyNote }}</ui-disclosure>
            }
          </div>
        }

        <!-- 6. OUTCOME (03 §2.6) -->
        <section appReveal mode="children" class="mt-16">
          <ui-eyebrow [index]="outcomeIndex()">Outcome</ui-eyebrow>
          <div class="mt-6 space-y-6">
            @for (para of paragraphs(p.outcome); track $index) {
              <p class="text-body-lg text-fg">{{ para }}</p>
            }
          </div>
        </section>

          <!-- 02 §6: always a way back to /work and forward to contact/resume. -->
          <nav class="mt-16 flex flex-col items-start gap-1 border-t border-fg/12 pt-6 sm:flex-row sm:gap-x-8">
            <a
              routerLink="/work"
              class="sweep-underline flex min-h-11 items-center text-body text-action no-underline"
              >← All work</a
            >
            <a
              routerLink="/contact"
              class="sweep-underline flex min-h-11 items-center text-body text-action no-underline"
              >Get in touch →</a
            >
          </nav>
        </div>
      </article>
    }
  `,
})
export class CaseStudy implements OnInit {
  /** Null for an unknown OR unpublished slug — see the 404 branch above. */
  readonly project = input<Project | null>(null);
  readonly media = input<Media[]>([]);

  /** Rich-text fields are stored with \n\n paragraph breaks (04 §3). */
  protected paragraphs(text: string): string[] {
    return text.split('\n\n');
  }

  /**
   * The header's screenshot panel (visual-identity redesign, 2026-09-06) —
   * same "featured, else first" choice the OG image in `ngOnInit` already
   * makes, computed once and reused by both rather than duplicated.
   */
  protected readonly headerImage = computed(
    () => this.media().find((m) => m.isFeatured) ?? this.media()[0] ?? null,
  );

  protected headerImageSrc(publicId: string): string {
    return imageUrl(publicId, 900);
  }

  /**
   * Stack is free-text (04 §3) with no real per-technology meaning to assign
   * an icon shape to, so the three shapes just cycle by position — the same
   * purely-rhythmic alternation the design reference itself uses.
   */
  protected tagIcon(index: number): 'diamond' | 'square' | 'circle' {
    return (['diamond', 'square', 'circle'] as const)[index % 3];
  }

  private readonly seo = inject(SeoService);

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
    const p = this.project();
    if (!p) {
      /**
       * A not-found page still needs a description, and must NOT keep the
       * previous case study's tags after a client-side navigation.
       */
      this.seo.apply({
        path: '/work',
        title: 'Case study not found — Muhammed Al-Ateeqi',
        description: 'This case study is not available.',
      });
      return;
    }

    /**
     * OG image is the project's featured screenshot, which is what makes a
     * forwarded case-study link look intentional (06 §6, 02 §6). No image
     * rather than a placeholder when a project has no media (04 §6) — a broken
     * preview is worse than a text card.
     */
    const featured = this.headerImage();

    this.seo.apply({
      path: `/work/${p.slug}`,
      title: `${p.name} — Muhammed Al-Ateeqi`,
      description: p.tagline,
      type: 'article',
      image: featured ? imageUrl(featured.publicId, 1200) : undefined,
      jsonLd: this.seo.caseStudySchema(p),
    });
  }

  /** Keeps the section numbering contiguous when Approach is absent. */
  protected readonly outcomeIndex = computed(() => (this.project()?.approach ? '04' : '03'));
}
