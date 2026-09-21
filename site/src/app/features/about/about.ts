import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { JOURNEY } from '../../core/content/site-copy';
import { Experience, Profile, Skill, SkillLevel } from '../../core/models';
import { SeoService } from '../../core/seo/seo.service';
import { SiteState } from '../../core/services/site-state';
import { UiStripBackdrop } from '../../shared/blocks/strip-backdrop/strip-backdrop';
import { UiSkillIcon } from '../../shared/ui/skill-icon/skill-icon';
import { UiEyebrow } from '../../shared/ui';
import { RevealDirective } from '../../shared/motion/reveal.directive';
import { ExperienceList } from './experience-list';

/**
 * About / Story (02 §7).
 *
 * The narrative is `Profile.bioLong` from Firestore — the one place someone can
 * get the complete picture in one sitting. It is rendered as paragraphs of
 * prose, not restructured into a bullet timeline, because 02 §7.2 asks for "a
 * narrative arc, not a bullet timeline".
 *
 * ON THE SETBACK (02 §7.3, brief §9, brand §17): this page references it only
 * as far as the seeded `bioLong` does — "a personal setback interrupted that
 * momentum". No detail is added here, and none should be: personal and romantic
 * detail is a hard boundary, not a matter of taste. The single sentence in the
 * content is the whole treatment, which is why this component adds no
 * setback-specific section of its own to tempt anyone into filling it.
 *
 * Uses the narrow reading column (07 §4) — this is the longest prose on the
 * site and the one page most likely to be read start to finish.
 *
 * ─── Why the profile is an input, not just a store read ──────────────────────
 * `profileInput` lets the dashboard render THIS component with a draft profile
 * (05 §2's Preview step), the same way /work/:slug previews a draft project.
 * Before this, /about read only the live profile from SiteState, so editing the
 * bio could be published but never previewed — the gap found during the Phase 5
 * smoke test.
 *
 * On the public route the input is absent and the live profile is used, so the
 * normal path is unchanged. One template serves both, which is the point: a
 * separate preview copy would drift from what actually ships.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RevealDirective,
    UiEyebrow,
    UiSkillIcon,
    UiStripBackdrop,
    ExperienceList,
  ],
  template: `
    @let p = profile();

    <article>
      <!-- The page frame gets the strip treatment; the prose below it
           deliberately does not. A glow behind two thousand words of body copy
           would fight the reading, and this is the one page most likely to be
           read start to finish (02 §7). Intensity is the variable here, not
           whether the language applies at all. -->
      <header class="relative pt-20 pb-12">
        <ui-strip-backdrop anchor="top-right" scale="sm" />

        <div class="container-page stagger-in-lead relative">
          <ui-eyebrow>About</ui-eyebrow>
          <h1 class="display-condensed mt-5 text-display-hero font-display text-fg">
            The long version
          </h1>

          @if (p) {
            <p class="prose-measure mt-6 text-body-lg text-fg">{{ p.bioShort }}</p>
          }
        </div>
      </header>

      @if (p) {
        <div class="container-page pb-24">
          <!-- The journey arc (brief §8) as a visual spine beside the prose.
               07 §7 allows sequence markers here because this genuinely is an
               ordered timeline rather than decorative numbering. Each stage now
               carries the same small orange mark the eyebrows and tags use, and
               the connectors are hairlines rather than arrow glyphs — a drawn
               rule reads as a spine, a "→" reads as punctuation. -->
          <ol class="flex flex-wrap items-center gap-x-3 gap-y-3" aria-label="Journey">
            @for (stage of journey; track stage; let last = $last) {
              <li class="flex items-center gap-3">
                <span class="flex items-center gap-2.5">
                  <span class="size-1.5 shrink-0 bg-action" aria-hidden="true"></span>
                  <span class="mono-label text-fg-muted">{{ stage }}</span>
                </span>
                @if (!last) {
                  <span class="h-px w-5 bg-fg/30" aria-hidden="true"></span>
                }
              </li>
            }
          </ol>

          <div class="rule-strip mt-10"></div>

          <div class="prose-measure mt-10 space-y-6">
            @for (paragraph of paragraphs(); track $index) {
              <p class="text-body-lg text-fg">{{ paragraph }}</p>
            }
          </div>

          <!-- 02 §7 item 4 — Experience, after the journey narrative. -->
          <app-experience-list appReveal [roles]="experience()" />

          <!--
            STACK (04 §5). 45 Skill records were seeded and had no public
            surface at all until now — they existed only in the dashboard.

            Grouped by LEVEL rather than by category, because level is the
            thing Muhammed actually framed them with ("Strong / Good /
            Learning / Interested in", 04 §5) and it is what a hiring manager
            is reading for. Category is an internal taxonomy; "state-data" is
            not a sentence anyone wants to read.

            Honesty rules the ordering: "Learning" and "Interested in" are
            shown, not hidden behind the strong list. Publishing only the
            strong half would make the page a claim rather than a summary
            (brief §22), and the levels are Muhammed's own words.
          -->
          @if (skillGroups().length) {
            <section appReveal class="mt-16 border-t border-fg/12 pt-12">
              <ui-eyebrow>Stack</ui-eyebrow>
              <h2 class="mt-4 text-display-3 font-display text-fg">What I build with</h2>

              <div class="mt-10 space-y-10">
                @for (group of skillGroups(); track group.level) {
                  <div>
                    <p class="mono-label flex items-center gap-2.5 text-action">
                      <span class="size-1.5 shrink-0 bg-action" aria-hidden="true"></span>
                      {{ group.label }}
                      <span class="text-fg-muted">{{ pad(group.skills.length) }}</span>
                    </p>

                    <ul class="mt-5 flex flex-wrap gap-2">
                      @for (skill of group.skills; track skill.id) {
                        <li><ui-skill-icon [name]="skill.name" /></li>
                      }
                    </ul>
                  </div>
                }
              </div>
            </section>
          }

          <!-- 02 §7.5 and §7.6 — bridges out, rather than ending flat. -->
          <nav
            class="mt-16 flex flex-col items-start gap-1 border-t border-fg/12 pt-6
                   sm:flex-row sm:gap-x-8"
          >
            <a
              routerLink="/work"
              class="sweep-underline flex min-h-11 items-center text-body text-action no-underline"
              >See the work →</a
            >
            <a
              routerLink="/beyond"
              class="sweep-underline flex min-h-11 items-center text-body text-action no-underline"
              >Beyond code →</a
            >
            <a
              routerLink="/contact"
              class="sweep-underline flex min-h-11 items-center text-body text-action no-underline"
              >Get in touch →</a
            >
          </nav>
        </div>
      }
    </article>
  `,
})
export class About implements OnInit {
  /**
   * Optional override. Supplied by the dashboard preview with unpublished
   * content; absent on the public route, where the live profile is used.
   */
  readonly profileInput = input<Profile | null>(null);

  /** Resolved per-route; empty in the dashboard preview, which previews the
   *  Profile draft rather than the Experience records. */
  readonly experience = input<Experience[]>([]);
  readonly skills = input<Skill[]>([]);

  /**
   * Skills in Muhammed's own four levels, strongest first, with empty levels
   * dropped.
   *
   * The order is fixed here rather than taken from the data: Firestore
   * returns reference records unordered (04 §12), and "Interested in" landing
   * above "Strong" would misrepresent him. Within a level the seeded order is
   * kept, which is the curation order from the brief.
   */
  protected readonly skillGroups = computed(() => {
    const levels: { level: SkillLevel; label: string }[] = [
      { level: 'strong', label: 'Strong' },
      { level: 'good', label: 'Good' },
      { level: 'learning', label: 'Learning' },
      { level: 'interested', label: 'Interested in' },
    ];
    return levels
      .map((entry) => ({ ...entry, skills: this.skills().filter((s) => s.level === entry.level) }))
      .filter((group) => group.skills.length > 0);
  });

  /** Zero-padded counts, matching the mono counters used elsewhere. */
  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private readonly live = inject(SiteState).profile;

  protected readonly profile = computed(() => this.profileInput() ?? this.live());
  protected readonly journey = JOURNEY;

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
    /** Not applied in the dashboard preview — that is not a public page. */
    if (!p || this.profileInput()) return;
    this.seo.apply({
      path: '/about',
      title: `About — ${p.name}`,
      description: p.bioShort,
      jsonLd: this.seo.personSchema(p),
    });
  }

  /** `bioLong` is stored with \n\n paragraph breaks (04 §2). */
  protected paragraphs(): string[] {
    return this.profile()?.bioLong.split('\n\n') ?? [];
  }
}
