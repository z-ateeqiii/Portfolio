import { ChangeDetectionStrategy, Component, OnInit, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COPY, PROCESS } from '../../core/content/site-copy';
import { Project, ProofPoint } from '../../core/models';
import { SeoService } from '../../core/seo/seo.service';
import { SiteState } from '../../core/services/site-state';
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
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, UiButton, UiCard, UiEyebrow, UiTag],
  template: `
    @let p = profile();

    <!-- 1. Hero (02 §4.1) — no portrait, per brief §26. -->
    <section class="container-wide pt-20 pb-16 sm:pt-28 sm:pb-24">
      @if (p) {
        <p class="font-mono text-label text-fg-muted uppercase">{{ p.positioning }}</p>
        <h1 class="mt-6 max-w-4xl text-display-1 font-display text-fg">{{ p.heroStatement }}</h1>
        @if (p.heroSubline) {
          <p class="mt-6 max-w-2xl text-body-lg text-fg-muted">{{ p.heroSubline }}</p>
        }

        <div class="mt-10 flex flex-wrap items-center gap-4">
          <a uiButton routerLink="/work">View Work</a>
          @if (p.resumeFile) {
            <a uiButton variant="secondary" [href]="p.resumeFile" target="_blank" rel="noopener">
              Resume
            </a>
          }
        </div>
      }
    </section>

    <!-- 2. Proof Strip (02 §4.2) — optional, and currently empty by design. -->
    @if (proofPoints().length) {
      <section class="container-wide pb-16">
        <ul class="flex flex-wrap gap-x-12 gap-y-6">
          @for (point of proofPoints(); track point.id) {
            <li>
              <p class="font-display text-display-3 text-fg">{{ point.value }}</p>
              <p class="mt-1 font-mono text-label text-fg-muted uppercase">{{ point.label }}</p>
            </li>
          }
        </ul>
      </section>
    }

    <!-- 3. Featured Work (02 §4.3) — leads with Scholarship, per brief §15. -->
    @if (featured().length) {
      <section appReveal class="container-wide py-16">
        <ui-eyebrow index="01">Featured Work</ui-eyebrow>
        <h2 class="mt-4 max-w-2xl text-display-2 font-display text-fg">{{ copy.featuredWork }}</h2>

        <div class="mt-10 grid gap-6 md:grid-cols-2">
          @for (project of featured(); track project.slug) {
            <ui-card [interactive]="true">
              <div class="flex items-baseline justify-between gap-4">
                <h3 class="text-display-3 font-display text-fg">
                  <a
                    [routerLink]="['/work', project.slug]"
                    class="text-fg no-underline hover:text-action"
                    >{{ project.name }}</a
                  >
                </h3>
                @if (project.timeframe) {
                  <span class="font-mono text-label text-fg-muted whitespace-nowrap">{{
                    project.timeframe
                  }}</span>
                }
              </div>

              <p class="mt-4 text-body text-fg-muted">{{ project.tagline }}</p>

              <ul class="mt-6 flex flex-wrap gap-2">
                @for (tech of project.stack; track tech) {
                  <li><ui-tag>{{ tech }}</ui-tag></li>
                }
              </ul>
            </ui-card>
          }
        </div>

        <p class="mt-8">
          <a routerLink="/work" class="text-body text-action no-underline hover:underline"
            >All work →</a
          >
        </p>
      </section>
    }

    <!-- 4. How I Work (02 §4.4) — condensed from brief §10, not the full list. -->
    <section appReveal class="container-wide py-16">
      <ui-eyebrow index="02">How I Work</ui-eyebrow>
      <h2 class="mt-4 max-w-2xl text-display-2 font-display text-fg">{{ copy.process }}</h2>

      <ol class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        @for (movement of process; track movement.title) {
          <li class="border-t border-fg/12 pt-4">
            <p class="font-mono text-label text-fg uppercase">{{ movement.title }}</p>
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
      <section appReveal class="container-wide py-16">
        <ui-eyebrow index="03">Story</ui-eyebrow>
        <h2 class="mt-4 max-w-2xl text-display-2 font-display text-fg">{{ copy.storyTeaser }}</h2>
        <p class="mt-6 max-w-2xl text-body-lg text-fg-muted">{{ excerpt }}</p>
        <p class="mt-8">
          <a routerLink="/about" class="text-body text-action no-underline hover:underline"
            >The full story →</a
          >
        </p>
      </section>
    }

    <!-- 6. Beyond Code Teaser (02 §4.6) — one line and a door, not a section. -->
    <section appReveal class="container-wide py-16">
      <ui-eyebrow index="04">Beyond Code</ui-eyebrow>
      <p class="mt-4 max-w-2xl text-display-3 font-display text-fg">{{ copy.beyondTeaser }}</p>
      <p class="mt-8">
        <a routerLink="/beyond" class="text-body text-action no-underline hover:underline"
          >Take a look →</a
        >
      </p>
    </section>

    <!-- 7. Contact / Closing CTA (02 §4.7). -->
    @if (p) {
      <section appReveal class="container-wide py-16">
        <ui-eyebrow index="05">Contact</ui-eyebrow>
        <h2 class="mt-4 max-w-2xl text-display-2 font-display text-fg">{{ copy.contact }}</h2>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <a uiButton [href]="'mailto:' + p.contactEmail">Email me</a>
          @if (p.resumeFile) {
            <a uiButton variant="secondary" [href]="p.resumeFile" target="_blank" rel="noopener">
              Resume
            </a>
          }
        </div>
      </section>
    }
  `,
})
export class Home implements OnInit {
  /** Resolved per-route (see app.routes.ts). */
  readonly featured = input<Project[]>([]);
  readonly proofPoints = input<ProofPoint[]>([]);

  /** Shared across every route, so it is read from the store, not re-fetched. */
  protected readonly profile = inject(SiteState).profile;

  protected readonly copy = COPY;
  protected readonly process = PROCESS;

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
