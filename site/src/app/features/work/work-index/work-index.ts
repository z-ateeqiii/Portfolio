import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Project } from '../../../core/models';
import { SeoService } from '../../../core/seo/seo.service';
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
 * — by size and span, not by colour, since orange is reserved for interactive
 * elements (07 §2, Option A).
 */
@Component({
  selector: 'app-work-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiCard, UiEyebrow, UiTag],
  template: `
    <section class="container-wide py-20">
      <ui-eyebrow>Work</ui-eyebrow>

      <!-- 02 §5: "intro line reinforcing positioning (not a repeat of the Hero)".
           This talks about the set of projects; the Hero talks about Muhammed. -->
      <h1 class="mt-4 max-w-3xl text-display-1 font-display text-fg">
        Five projects, each built to fix something specific.
      </h1>

      @if (featured(); as lead) {
        <div class="mt-14">
          <ui-card [interactive]="true">
            <p class="font-mono text-label text-fg-muted uppercase">Featured</p>

            <h2 class="mt-4 text-display-2 font-display text-fg">
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
              @for (tech of lead.stack; track tech) {
                <li><ui-tag>{{ tech }}</ui-tag></li>
              }
            </ul>
          </ui-card>
        </div>
      }

      @if (rest().length) {
        <div class="mt-8 grid gap-6 md:grid-cols-2">
          @for (project of rest(); track project.slug) {
            <ui-card [interactive]="true">
              <h2 class="text-display-3 font-display text-fg">
                <a
                  [routerLink]="['/work', project.slug]"
                  class="text-fg no-underline hover:text-action"
                  >{{ project.name }}</a
                >
              </h2>

              <p class="mt-4 text-body text-fg-muted">{{ project.tagline }}</p>

              <ul class="mt-6 flex flex-wrap gap-2">
                @for (tech of project.stack; track tech) {
                  <li><ui-tag>{{ tech }}</ui-tag></li>
                }
              </ul>
            </ui-card>
          }
        </div>
      }
    </section>
  `,
})
export class WorkIndex {
  readonly projects = input<Project[]>([]);

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
    () => this.projects().find((p) => p.tier === 'featured') ?? null,
  );

  protected readonly rest = computed(() => {
    const lead = this.featured();
    return this.projects().filter((p) => p !== lead);
  });
}
