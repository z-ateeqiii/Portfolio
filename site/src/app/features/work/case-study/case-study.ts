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
  imports: [RouterLink, UiButton, UiDisclosure, UiEyebrow, UiStatusDot, UiTag],
  template: `
    @let p = project();

    @if (!p) {
      <!--
        Unknown slug, or a slug whose project is not published. Both land here,
        and that is the point: a draft is indistinguishable from a typo from
        the outside, so nothing leaks about content that exists but is not
        public (05 §6). The query never returned it in the first place.
      -->
      <section class="container-content py-20">
        <ui-eyebrow>404</ui-eyebrow>
        <h1 class="mt-4 text-display-2 font-display text-fg">This case study isn’t here.</h1>
        <p class="mt-6 text-body-lg text-fg-muted">
          The link may be wrong, or the project may not be published.
        </p>
        <p class="mt-8">
          <a routerLink="/work" class="text-body text-action no-underline hover:underline"
            >See all work →</a
          >
        </p>
      </section>
    } @else {
      <article class="container-content py-20">
        <!-- 1. SNAPSHOT (03 §2.1) -->
        <header>
          <ui-eyebrow>{{ p.tier }} project</ui-eyebrow>
          <h1 class="mt-4 text-display-1 font-display text-fg">{{ p.name }}</h1>
          <p class="mt-6 text-body-lg text-fg-muted">{{ p.tagline }}</p>

          <dl class="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            @if (p.role) {
              <div>
                <dt class="font-mono text-label text-fg-muted uppercase">Role</dt>
                <dd class="mt-1 text-body text-fg">{{ p.role }}</dd>
              </div>
            }
            @if (p.timeframe) {
              <div>
                <dt class="font-mono text-label text-fg-muted uppercase">Timeframe</dt>
                <dd class="mt-1 text-body text-fg">{{ p.timeframe }}</dd>
              </div>
            }
          </dl>

          <ul class="mt-8 flex flex-wrap gap-2">
            @for (tech of p.stack; track tech) {
              <li><ui-tag>{{ tech }}</ui-tag></li>
            }
          </ul>

          <!-- Links render only when they exist. Cyber50 has neither, because
               its main repo was never provided (10 §2) — an absent link is
               honest, a guessed one is a broken promise. -->
          @if (p.liveUrl || p.githubUrl) {
            <div class="mt-8 flex flex-wrap items-center gap-4">
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
        </header>

        <!-- Media (04 §6). Nothing is seeded yet, so this renders nothing —
             missing media never blocks a case study going live (brief §32). -->
        @if (media().length) {
          <div class="mt-14 space-y-6">
            @for (item of media(); track item.id) {
              <figure>
                <img
                  [src]="src(item)"
                  [alt]="item.alt"
                  loading="lazy"
                  decoding="async"
                  class="w-full rounded-md border border-fg/12"
                />
                @if (item.caption) {
                  <figcaption class="mt-3 text-caption text-fg-muted">{{ item.caption }}</figcaption>
                }
              </figure>
            }
          </div>
        }

        <!-- 2. THE PROBLEM (03 §2.2) -->
        <section class="mt-16">
          <ui-eyebrow index="01">The Problem</ui-eyebrow>
          <div class="mt-6 space-y-6">
            @for (para of paragraphs(p.problem); track $index) {
              <p class="text-body-lg text-fg">{{ para }}</p>
            }
          </div>
        </section>

        <!-- 3. THE APPROACH (03 §2.3) — absent on compact tier, by data. -->
        @if (p.approach) {
          <section class="mt-16">
            <ui-eyebrow index="02">The Approach</ui-eyebrow>
            <div class="mt-6 space-y-6">
              @for (para of paragraphs(p.approach); track $index) {
                <p class="text-body-lg text-fg">{{ para }}</p>
              }
            </div>
          </section>
        }

        <!-- 4. THE BUILD (03 §2.4) -->
        <section class="mt-16">
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
        <section class="mt-16">
          <ui-eyebrow [index]="outcomeIndex()">Outcome</ui-eyebrow>
          <div class="mt-6 space-y-6">
            @for (para of paragraphs(p.outcome); track $index) {
              <p class="text-body-lg text-fg">{{ para }}</p>
            }
          </div>
        </section>

        <!-- 02 §6: always a way back to /work and forward to contact/resume. -->
        <nav class="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-fg/12 pt-8">
          <a routerLink="/work" class="text-body text-action no-underline hover:underline"
            >← All work</a
          >
          <a routerLink="/contact" class="text-body text-action no-underline hover:underline"
            >Get in touch →</a
          >
        </nav>
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
    const featured = this.media().find((m) => m.isFeatured) ?? this.media()[0];

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

  /**
   * Cloudinary delivery URL built from `publicId` rather than using the stored
   * `url` directly, so every case-study image gets f_auto/q_auto and a width
   * cap. Screenshots are the heaviest asset on the site (06 §7).
   */
  protected src(item: Media): string {
    return imageUrl(item.publicId, 1200);
  }
}
