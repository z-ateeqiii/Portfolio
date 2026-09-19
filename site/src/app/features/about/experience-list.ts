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
 *
 * ─── What is visible collapsed, and what expanding adds (2026-09-19) ─────────
 * A COLLAPSED row is not a bare title. It carries the role, organisation,
 * timeframe, the summary paragraph and the tech tags — everything needed to
 * judge the role without opening it. Expanding adds only "What I Did", the
 * CV bullet list in `highlights`.
 *
 * That split is the point of the pattern. Previously the summary and the tags
 * lived inside the disclosure, so three of the four roles showed nothing but a
 * job title and a date, and the page could not be scanned without clicking
 * through it. The accordion now hides detail, not substance.
 *
 * A role with no `highlights` renders no toggle at all — no chevron, no
 * pointer cursor, nothing that invites a click that would do nothing.
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
            <div class="border-b border-fg/12">
              <!--
                The always-visible half of the row. Not inside <summary>: a
                summary element is a control, and burying a paragraph and a
                list of tags inside one makes the whole block a click target
                and reads them to a screen reader as part of the toggle's
                label.
              -->
              <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-6">
                <h3 class="text-body-lg text-fg">{{ role.role }}</h3>
                <p class="mono-label text-fg-muted">
                  {{ role.organization }}@if (role.engagement) {
                    <span> · {{ role.engagement }}</span>
                  }
                </p>
                <p class="mono-label ml-auto shrink-0 text-fg-muted">{{ role.timeframe }}</p>
              </div>

              <p class="prose-measure mt-4 text-body text-fg">{{ role.summary }}</p>

              @if (role.tech?.length) {
                <ul class="mt-4 flex flex-wrap gap-2">
                  @for (tech of role.tech; track tech) {
                    <li><ui-tag>{{ tech }}</ui-tag></li>
                  }
                </ul>
              }

              <!-- Links to the case studies this role produced (04 §4). -->
              @if (role.linkedProjectSlugs?.length) {
                <p class="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                  @for (slug of role.linkedProjectSlugs; track slug) {
                    <a
                      [routerLink]="['/work', slug]"
                      class="sweep-underline inline-flex min-h-11 items-center text-caption
                             text-action no-underline"
                      >{{ label(slug) }} →</a
                    >
                  }
                </p>
              }

              <!--
                Only the bullet list is behind the disclosure, and the whole
                <details> is absent when there are none — so a role without
                highlights shows no affordance for an action it cannot perform.
              -->
              @if (role.highlights?.length) {
                <details [open]="first" class="group mt-2 pb-6">
                  <summary
                    class="mono-label inline-flex min-h-11 cursor-pointer list-none items-center
                           gap-2 text-fg-muted transition-colors duration-(--duration-base)
                           ease-out-strong marker:content-none hover:text-action
                           focus-visible:text-action"
                  >
                    <!--
                      A real chevron, rotating 90deg when open. The previous
                      affordance was a 9px square that rotated 45deg; it was
                      part of the mark system but too quiet to read as a
                      control, which is why the section did not look
                      interactive at all. Decorative only — <details> announces
                      its own expanded state to assistive tech.
                    -->
                    <svg
                      class="size-3 shrink-0 transition-transform duration-(--duration-base)
                             ease-out-strong group-open:rotate-90"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="square"
                      aria-hidden="true"
                    >
                      <path d="M4 2l4 4-4 4" />
                    </svg>
                    What I did
                  </summary>

                  <ul class="prose-measure mt-4 space-y-2 pl-5">
                    @for (item of role.highlights; track item) {
                      <li class="relative text-body text-fg-muted">
                        <span
                          class="absolute top-2.5 -left-5 size-1.5 shrink-0 border border-action"
                          aria-hidden="true"
                        ></span>
                        {{ item }}
                      </li>
                    }
                  </ul>
                </details>
              } @else {
                <div class="pb-6"></div>
              }
            </div>
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
