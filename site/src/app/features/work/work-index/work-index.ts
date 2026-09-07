import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ProjectsWithCovers } from '../../../core/content/project-covers';
import { SeoService } from '../../../core/seo/seo.service';
import { UiStripBackdrop } from '../../../shared/blocks/strip-backdrop/strip-backdrop';
import { RevealDirective } from '../../../shared/motion/reveal.directive';
import { UiCard, UiEyebrow, UiTag } from '../../../shared/ui';

/**
 * Work index (02 §5).
 *
 * The credibility layer for hiring managers and clients. Curated and ordered by
 * relevance rather than date (brief §12) — the `order` field already carries
 * that curation, so this page renders the sequence rather than re-sorting it.
 *
 * No pagination and no infinite scroll (02 §5, 02 §13): a curated set, not an
 * archive, and paging it would imply there is more behind a click when there
 * is not.
 *
 * The featured project is visually distinguished at the top (02 §5, brief §15)
 * — by size and span, by an orange-tinted border (`ui-card`'s `accent` input),
 * and by oversized condensed type on its name. Never by fill colour: orange
 * stays on borders, marks and controls (07 §2), never as a large field.
 *
 * ─── Layout (visual alignment pass, 2026-09-07) ──────────────────────────────
 * The featured card is a two-column split at `lg` — cover image on one side,
 * the text block on the other — which is the reference's own featured
 * treatment, and it stacks to a single column below that. The standard cards
 * keep the image-above-text stack at every width; two different card shapes is
 * the point, since the tier difference should be legible at a glance rather
 * than only via the "Featured" label.
 *
 * Cover images are desaturated and un-desaturate on hover (`hover-reveal-media`
 * on a `group` card) — a deliberate, consistent photo treatment, not a
 * missing-colour bug, and the colour returning is what rewards the hover
 * without spending the orange accent on it.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'app-work-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, UiCard, UiEyebrow, UiStripBackdrop, UiTag],
  template: `
    <section class="relative overflow-hidden py-20">
      <ui-strip-backdrop anchor="top-right" scale="md" />

      <div class="container-wide relative">
        <div class="stagger-in-lead flex flex-wrap items-end justify-between gap-6">
          <div>
            <ui-eyebrow index="02">Selected Work</ui-eyebrow>

            <!-- 02 §5: "intro line reinforcing positioning (not a repeat of the
                 Hero)". This talks about the set of projects; the Hero talks
                 about Muhammed. Kept at display-1 rather than the oversized
                 display-hero: that size is for a short NAME, and condensing a
                 full sentence reads as broken rather than bold. -->
            <h1 class="mt-5 max-w-3xl text-display-1 font-display text-fg">
              Every project here was built to fix something specific.
            </h1>
          </div>

          <!-- Metadata, muted rather than orange — the reference reserves
               orange for the section opener and greys the counts beside it.
               Derived from the rendered set, so it can never disagree with the
               number of cards below it. -->
          @if (count()) {
            <p class="mono-label text-fg-muted">
              {{ pad(count()) }} {{ count() === 1 ? 'Project' : 'Projects' }}
            </p>
          }
        </div>

        @if (featured(); as lead) {
          <div class="mt-14">
            <ui-card [interactive]="true" [accent]="true" class="overflow-hidden p-0">
              <div class="grid lg:grid-cols-[1.35fr_1fr]">
                @if (cover(lead.slug); as image) {
                  <div class="relative overflow-hidden">
                    <img
                      [src]="image.url"
                      [alt]="image.alt"
                      loading="lazy"
                      decoding="async"
                      class="hover-reveal-media aspect-video w-full object-cover grayscale
                             contrast-115 lg:h-full"
                    />
                    <!-- Viewfinder crop marks, desktop only: on a phone the
                         image is small enough that a frame across it reads as
                         clutter rather than as a photographic reference. -->
                    <div
                      class="photo-strip-frame top-10 left-10 hidden h-3/5 w-2/5 lg:block"
                      aria-hidden="true"
                    ></div>
                  </div>
                }

                <div class="flex flex-col justify-between gap-7 p-6 sm:p-10">
                  <div>
                    <p class="mono-label flex items-center gap-2.5 text-action">
                      <span class="size-1.5 shrink-0 bg-action" aria-hidden="true"></span>
                      Featured
                    </p>

                    <h2 class="display-condensed mt-5 text-display-2 font-display text-fg">
                      <a
                        [routerLink]="['/work', lead.slug]"
                        class="text-fg no-underline transition-colors duration-[--duration-base]
                               ease-[--ease-out-strong] hover:text-action"
                        >{{ lead.name }}</a
                      >
                    </h2>

                    <p class="mt-5 max-w-md text-body-lg text-fg-muted">{{ lead.tagline }}</p>

                    @if (meta(lead); as line) {
                      <p class="mono-label mt-5 text-fg-muted">{{ line }}</p>
                    }
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

        @if (rest().length) {
          <!--
            One reveal on the GRID, not one per card. The grid mode staggers
            the cards as a diagonal wave using GSAP's grid inference, which
            reads as "here is a set" rather than as six identical, independent,
            simultaneous fades.
          -->
          <div appReveal mode="grid" class="mt-8 grid gap-6 md:grid-cols-2">
            @for (project of rest(); track project.slug) {
              <ui-card [interactive]="true" class="overflow-hidden p-0">
                @if (cover(project.slug); as image) {
                  <div class="overflow-hidden">
                    <img
                      [src]="image.url"
                      [alt]="image.alt"
                      loading="lazy"
                      decoding="async"
                      class="hover-reveal-media aspect-video w-full object-cover grayscale
                             contrast-115"
                    />
                  </div>
                }

                <div class="p-6">
                  <h2 class="display-condensed text-display-3 font-display text-fg">
                    <a
                      [routerLink]="['/work', project.slug]"
                      class="text-fg no-underline transition-colors duration-[--duration-base]
                             ease-[--ease-out-strong] hover:text-action"
                      >{{ project.name }}</a
                    >
                  </h2>

                  <p class="mt-4 text-body text-fg-muted">{{ project.tagline }}</p>

                  @if (meta(project); as line) {
                    <p class="mono-label mt-4 text-fg-muted">{{ line }}</p>
                  }

                  <ul class="mt-6 flex flex-wrap gap-2">
                    @for (tech of project.stack; track tech; let j = $index) {
                      <li><ui-tag [icon]="tagIcon(j)">{{ tech }}</ui-tag></li>
                    }
                  </ul>
                </div>
              </ui-card>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class WorkIndex {
  readonly projects = input<ProjectsWithCovers>({ projects: [], covers: {} });

  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      path: '/work',
      title: 'Work — Muhammed Al-Ateeqi',
      description:
        'Operational dashboards, an internal onboarding platform, a digital menu built unprompted, and client sites — each built to fix something specific.',
    });
  }

  /**
   * The lead card is chosen by `tier`, not by taking `projects[0]`.
   *
   * Ordering and prominence are two different decisions: `order` says where a
   * project sits in the list, `tier` says how much real estate it earns (03 §3).
   * Reading position 0 as "featured" would silently promote whatever happened
   * to sort first if the curation order ever changed.
   */
  protected readonly featured = computed(
    () => this.projects().projects.find((p) => p.tier === 'featured') ?? null,
  );

  protected readonly rest = computed(() => {
    const lead = this.featured();
    return this.projects().projects.filter((p) => p !== lead);
  });

  protected readonly count = computed(() => this.projects().projects.length);

  /** A project's cover image (04 §6's isFeatured), if one has been set. */
  protected cover(slug: string) {
    return this.projects().covers[slug];
  }

  /**
   * The reference's "LEAD FRONTEND — 2025 / 2026" metadata line, assembled
   * from whatever the project actually carries. Several projects have neither
   * `role` nor `timeframe` (the freelance sites, and FreshCart) — those get no
   * line at all rather than a separator with nothing on either side of it.
   */
  protected meta(project: { role?: string; timeframe?: string }): string {
    return [project.role, project.timeframe].filter(Boolean).join(' — ');
  }

  /** "01", "02" … — matches the zero-padded style of the reference's counters. */
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
}
