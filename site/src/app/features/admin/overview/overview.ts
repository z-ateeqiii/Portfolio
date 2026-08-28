import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ContentService } from '../../../core/services';

interface SectionStatus {
  readonly label: string;
  readonly path: string;
  readonly live: number;
  readonly lastUpdated: Date | null;
}

/**
 * Dashboard overview (05 §3.1).
 *
 * "At-a-glance: what's in draft, what's live, last-updated timestamps."
 *
 * The LIVE and LAST-UPDATED columns are real. The DRAFT column is not built
 * yet, because the draft model itself is an open question — 04 §12 gives every
 * entity a single `status` field, which cannot represent "this project is live
 * AND has unpublished edits waiting", and that is exactly what 05 §2 requires.
 * See 10 §4e. Rather than show a column of zeroes that would read as "nothing
 * in draft" — a false reassurance on the one screen whose job is to tell the
 * truth about pending work — the column is absent until the model is settled.
 *
 * Counts come from the public read layer, so this screen shows what a visitor
 * would actually see. That is the useful question here: not "what rows exist"
 * but "what is actually live right now".
 */
@Component({
  selector: 'app-admin-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="p-8">
      <h1 class="font-display text-display-3 text-fg">Overview</h1>
      <p class="mt-2 text-caption text-fg-muted">What is live on the site right now.</p>

      @if (loading()) {
        <p class="mt-8 text-body text-fg-muted">Loading…</p>
      } @else {
        <table class="mt-8 w-full max-w-2xl text-left">
          <thead>
            <tr class="border-b border-fg/12">
              <th class="pb-2 font-mono text-label font-normal text-fg-muted uppercase">Section</th>
              <th class="pb-2 font-mono text-label font-normal text-fg-muted uppercase">Live</th>
              <th class="pb-2 font-mono text-label font-normal text-fg-muted uppercase">
                Last updated
              </th>
            </tr>
          </thead>
          <tbody>
            @for (section of sections(); track section.path) {
              <tr class="border-b border-fg/12">
                <td class="py-3">
                  <a [routerLink]="section.path" class="text-body text-fg no-underline hover:text-action">{{
                    section.label
                  }}</a>
                </td>
                <td class="py-3 font-mono text-caption text-fg">{{ section.live }}</td>
                <td class="py-3 font-mono text-caption text-fg-muted">
                  {{ section.lastUpdated ? (section.lastUpdated | date: 'd MMM yyyy') : '—' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class AdminOverview {
  private readonly content = inject(ContentService);

  protected readonly loading = signal(true);
  protected readonly sections = signal<SectionStatus[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const [profile, projects, experience, skills, social, ventures, education, proofPoints] =
      await Promise.all([
        this.content.profile(),
        this.content.projects(),
        this.content.experience(),
        this.content.skills(),
        this.content.socialPlatforms(),
        this.content.businessVentures(),
        this.content.education(),
        this.content.proofPoints(),
      ]);

    const newest = (dates: (Date | undefined)[]): Date | null => {
      const valid = dates.filter((d): d is Date => d instanceof Date);
      return valid.length ? new Date(Math.max(...valid.map((d) => d.getTime()))) : null;
    };

    this.sections.set([
      {
        label: 'Profile',
        path: '/admin/profile',
        live: profile ? 1 : 0,
        lastUpdated: profile?.updatedAt ?? null,
      },
      {
        label: 'Projects',
        path: '/admin/projects',
        live: projects.length,
        lastUpdated: newest(projects.map((p) => p.updatedAt)),
      },
      {
        label: 'Experience',
        path: '/admin/experience',
        live: experience.length,
        lastUpdated: newest(experience.map((e) => e.updatedAt)),
      },
      { label: 'Skills', path: '/admin/skills', live: skills.length, lastUpdated: null },
      { label: 'Social platforms', path: '/admin/social', live: social.length, lastUpdated: null },
      {
        label: 'Business ventures',
        path: '/admin/business',
        live: ventures.length,
        lastUpdated: null,
      },
      { label: 'Education', path: '/admin/education', live: education.length, lastUpdated: null },
      {
        label: 'Proof points',
        path: '/admin/proof-points',
        live: proofPoints.length,
        lastUpdated: null,
      },
    ]);

    this.loading.set(false);
  }
}
