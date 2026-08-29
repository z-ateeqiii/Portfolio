import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Experience } from '../../core/models';
import { UiEyebrow, UiTag } from '../../shared/ui';

/**
 * Experience section on /about (02 §7, item 4).
 *
 * Appended after the journey narrative rather than given its own top-level
 * route: 02 §13 rules out standalone Skills/Certifications destinations because
 * they fragment the story, and this is the same kind of supporting content for
 * the same audience — the hiring manager who wants more than a resume (02 §7).
 *
 * ─── Built on <details>, not a click handler ─────────────────────────────────
 * Native disclosure gives keyboard support, correct ARIA semantics and screen
 * reader announcement for free, and it works in the server-rendered HTML before
 * any JavaScript loads. A hand-rolled accordion would need all of that
 * reimplemented and would collapse to nothing without JS — on a page whose
 * whole job is being read (02 §7, brief §29).
 *
 * The first role is open by default. It is the current one, and it is what a
 * recruiter scanning the page is looking for; the rest stay collapsed so the
 * sequence of roles is scannable rather than buried under four paragraphs.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ON THE ONGOING ROLE: `timeframe` renders verbatim, so "Apr 2026 – Present"
 * stays present tense. Nothing here derives a tense or an end date from it —
 * there is no path that can present a current job as a past one.
 */
@Component({
  selector: 'app-experience-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiEyebrow, UiTag],
  template: `
    @if (roles().length) {
      <section class="mt-16 border-t border-fg/12 pt-12">
        <ui-eyebrow>Experience</ui-eyebrow>
        <h2 class="mt-4 text-display-3 font-display text-fg">Where the work happened</h2>

        <div class="mt-8">
          @for (role of roles(); track role.id; let first = $first) {
            <details [open]="first" class="group border-b border-fg/12">
              <summary
                class="flex cursor-pointer list-none items-baseline gap-4 py-4 marker:content-none"
              >
                <span class="text-fg-muted transition-transform group-open:rotate-45" aria-hidden="true"
                  >+</span
                >
                <span class="min-w-0 flex-1">
                  <span class="block text-body-lg text-fg">{{ role.role }}</span>
                  <span class="block text-caption text-fg-muted">
                    {{ role.organization }}@if (role.engagement) {
                      <span> · {{ role.engagement }}</span>
                    }
                  </span>
                </span>
                <span class="font-mono text-label text-fg-muted whitespace-nowrap">{{
                  role.timeframe
                }}</span>
              </summary>

              <div class="pb-6 pl-8">
                <p class="text-body text-fg">{{ role.summary }}</p>

                @if (role.tech?.length) {
                  <ul class="mt-4 flex flex-wrap gap-2">
                    @for (tech of role.tech; track tech) {
                      <li><ui-tag>{{ tech }}</ui-tag></li>
                    }
                  </ul>
                }

                <!-- Links to the case studies this role produced (04 §4). -->
                @if (role.linkedProjectSlugs?.length) {
                  <p class="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                    @for (slug of role.linkedProjectSlugs; track slug) {
                      <a
                        [routerLink]="['/work', slug]"
                        class="text-caption text-action no-underline hover:underline"
                        >{{ label(slug) }} →</a
                      >
                    }
                  </p>
                }
              </div>
            </details>
          }
        </div>
      </section>
    }
  `,
})
export class ExperienceList {
  readonly roles = input<Experience[]>([]);

  /**
   * Turns a slug into a readable link label without a second Firestore read.
   *
   * The alternative — fetching each linked project to get its real `name` —
   * would add a read per role to a page that already has what it needs. If a
   * slug ever stops matching its project's name closely enough for this to
   * read well, that is a signal to pass the projects in, not to fetch here.
   */
  protected label(slug: string): string {
    return slug
      .split('-')
      .map((part) => (part.length > 3 ? part[0].toUpperCase() + part.slice(1) : part))
      .join(' ');
  }
}
