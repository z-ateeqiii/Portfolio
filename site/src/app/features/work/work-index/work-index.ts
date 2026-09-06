import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ProjectsWithCovers } from '../../../core/content/project-covers';
import { SeoService } from '../../../core/seo/seo.service';
import { RevealDirective } from '../../../shared/motion/reveal.directive';
import { UiCard, UiEyebrow, UiTag } from '../../../shared/ui';

/**
 * Work index (02 §5).
 *
 * The credibility layer for hiring managers and clients. Curated and ordered by
 * relevance rather than date (brief §12) — the `order` field already carries
 * that curation, so this page renders the sequence rather than re-sorting it.
 *
 * No pagination and no infinite scroll (02 §5, 02 §13): five projects is a
 * curated set, not an archive, and paging it would imply there is more behind
 * a click when there is not.
 *
 * The featured project is visually distinguished at the top (02 §5, brief §15)
 * — by size and span, and now (visual-identity redesign, 2026-09-06) by an
 * orange-tinted border (`ui-card`'s `accent` input) and oversized condensed
 * type on its name — never by fill colour, since orange stays reserved for
 * interactive elements (07 §2, Option A); the tint is on a border, the same
 * place focus rings and control edges already use it.
 *
 * Cover images are desaturated (grayscale + contrast) per the same redesign —
 * a deliberate, consistent photo treatment, not a missing-color bug.
 */
@Component({
  selector: 'app-work-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, UiCard, UiEyebrow, UiTag],
  template: `
    <section class="container-wide relative overflow-hidden py-20">
      <div class="photo-strip-glow absolute -top-56 -right-64 h-160 w-190"></div>
      <div class="photo-strip-grain"></div>

      <div class="relative">
        <ui-eyebrow>Work</ui-eyebrow>

        <!-- 02 §5: "intro line reinforcing positioning (not a repeat of the Hero)".
             This talks about the set of projects; the Hero talks about Muhammed. -->
        <h1 class="mt-4 max-w-3xl text-display-1 font-display text-fg">
          Five projects, each built to fix something specific.
        </h1>

        @if (featured(); as lead) {
          <div class="mt-14">
            <ui-card [interactive]="true" [accent]="true">
              @if (cover(lead.slug); as image) {
                <img
                  [src]="image.url"
                  [alt]="image.alt"
                  loading="lazy"
                  decoding="async"
                  class="mb-6 aspect-video w-full rounded-sm object-cover grayscale contrast-125"
                />
              }
              <p class="font-mono text-label text-action uppercase">Featured</p>

              <h2 class="display-condensed mt-4 text-display-1 font-display text-fg">
                <a
                  [routerLink]="['/work', lead.slug]"
                  class="text-fg no-underline hover:text-action"
                  >{{ lead.name }}</a
                >
              </h2>

              <p class="mt-4 max-w-2xl text-body-lg text-fg-muted">{{ lead.tagline }}</p>

              <dl class="mt-6 flex flex-wrap gap-x-10 gap-y-2">
                @if (lead.role) {
                  <div>
                    <dt class="font-mono text-label text-fg-muted uppercase">Role</dt>
                    <dd class="mt-1 text-caption text-fg">{{ lead.role }}</dd>
                  </div>
                }
                @if (lead.timeframe) {
                  <div>
                    <dt class="font-mono text-label text-fg-muted uppercase">Timeframe</dt>
                    <dd class="mt-1 text-caption text-fg">{{ lead.timeframe }}</dd>
                  </div>
                }
              </dl>

              <ul class="mt-6 flex flex-wrap gap-2">
                @for (tech of lead.stack; track tech; let i = $index) {
                  <li><ui-tag [icon]="tagIcon(i)">{{ tech }}</ui-tag></li>
                }
              </ul>
            </ui-card>
          </div>
        }

        @if (rest().length) {
          <div class="mt-8 grid gap-6 md:grid-cols-2">
            @for (project of rest(); track project.slug; let i = $index) {
              <ui-card [interactive]="true" [appReveal]="i">
                @if (cover(project.slug); as image) {
                  <img
                    [src]="image.url"
                    [alt]="image.alt"
                    loading="lazy"
                    decoding="async"
                    class="mb-4 aspect-video w-full rounded-sm object-cover grayscale contrast-125"
                  />
                }
                <h2 class="display-condensed text-display-3 font-display text-fg">
                  <a
                    [routerLink]="['/work', project.slug]"
                    class="text-fg no-underline hover:text-action"
                    >{{ project.name }}</a
                  >
                </h2>

                <p class="mt-4 text-body text-fg-muted">{{ project.tagline }}</p>

                <ul class="mt-6 flex flex-wrap gap-2">
                  @for (tech of project.stack; track tech; let j = $index) {
                    <li><ui-tag [icon]="tagIcon(j)">{{ tech }}</ui-tag></li>
                  }
                </ul>
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
        'Five projects, each built to fix something specific — operational dashboards, an internal onboarding platform, and a digital menu built unprompted.',
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

  /** A project's cover image (04 §6's isFeatured), if one has been set. */
  protected cover(slug: string) {
    return this.projects().covers[slug];
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
