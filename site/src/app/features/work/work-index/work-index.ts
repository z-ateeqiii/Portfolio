import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ProjectsWithCovers } from '../../../core/content/project-covers';
import type { ProjectCategory } from '../../../core/models';
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
    <section class="relative py-20">
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

        <!--
          FILTER TABS. Rendered only when there is more than one category
          present, because a single tab is a label rather than a choice.

          A real <button> in a tablist, not a link: this filters what is
          already on the page and never navigates, so a link would promise a
          destination it does not have. The active tab is marked with
          aria-pressed so the state is announced, not just coloured — colour
          alone is not a state for anyone who cannot see it.
        -->
        @if (tabs().length) {
          <div
            class="mt-10 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter projects by category"
          >
            @for (tab of tabs(); track tab.value) {
              <button
                type="button"
                (click)="select(tab.value)"
                [attr.aria-pressed]="active() === tab.value"
                [class]="tabClasses(tab.value)"
              >
                <!--
                  The same small square that opens every eyebrow and sits on
                  every tag, filled when the tab is the active one and outlined
                  when it is not. State is therefore carried by a SHAPE as well
                  as by colour, which is what keeps it legible to anyone who
                  cannot tell the orange from the grey.
                -->
                <span
                  class="size-1.5 shrink-0 border border-current"
                  [class.bg-current]="active() === tab.value"
                  aria-hidden="true"
                ></span>
                <span class="capitalize">{{ tab.value }}</span>
                <span class="opacity-55">{{ pad(tab.count) }}</span>
              </button>
            }
          </div>
        }

        @if (featured(); as lead) {
          <div class="mt-14">
            <ui-card [interactive]="true" [accent]="true" [flush]="true">
              <div class="grid lg:grid-cols-[1.35fr_1fr]">
                @if (cover(lead.slug); as image) {
                  <div class="relative overflow-hidden">
                    <img
                      [src]="image.url"
                      [alt]="image.alt"
                      loading="lazy"
                      decoding="async"
                      class="hover-reveal-media aspect-[3/2] w-full object-cover grayscale contrast-115
                             sm:aspect-video lg:h-full"
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

                    <!--
                      No display-condensed, matching Home's lead card and 07
                      §7a's rule that card names are set for reading rather
                      than compression. This heading was the last one still
                      carrying it, and it was also the one card on the site
                      where clicking the body did nothing: the utility is a
                      scaleX, a transformed element becomes the containing
                      block for absolutely positioned descendants, and the
                      stretched link's overlay was therefore trapped inside the
                      heading. Dropping it fixes the click and settles the
                      inconsistency in one move. Caught by clicking each card
                      in a real browser and reading back the URL — nothing
                      about the markup looks wrong.
                    -->
                    <h2 class="mt-5 text-display-2 font-display text-fg">
                      <a
                        [routerLink]="['/work', lead.slug]"
                        class="stretched-link text-fg no-underline transition-colors
                               duration-(--duration-base) ease-out-strong hover:text-action"
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
          <!--
            Three columns from xl. At five projects two columns was right; the
            set is eight now and still growing, and a two-wide column of eight
            cards is a scroll, not an index. The breakpoint is where a third
            card still has room for a readable tagline — below it, three
            columns squeeze the text before it squeezes the grid.
          -->
          <div appReveal mode="grid" class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            @for (project of rest(); track project.slug) {
              <ui-card [interactive]="true" [flush]="true">
                @if (cover(project.slug); as image) {
                  <div class="media-frame aspect-[3/2] w-full sm:aspect-video">
                    <img
                      [src]="image.url"
                      [alt]="image.alt"
                      loading="lazy"
                      decoding="async"
                      class="hover-reveal-media size-full object-cover grayscale contrast-115"
                    />
                  </div>
                }

                <div class="flex flex-1 flex-col p-6 sm:p-7">
                  <h2 class="text-display-4 font-display text-fg">
                    <a
                      [routerLink]="['/work', project.slug]"
                      class="stretched-link text-fg no-underline transition-colors
                             duration-(--duration-base) ease-out-strong hover:text-action"
                      >{{ project.name }}</a
                    >
                  </h2>

                  <p class="mt-4 text-body text-fg-muted">{{ project.tagline }}</p>

                  @if (meta(project); as line) {
                    <p class="mono-label mt-4 text-fg-muted">{{ line }}</p>
                  }

                  <ul class="mt-auto flex flex-wrap gap-2 pt-7">
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
  /**
   * Which tab is active. A signal, not a route param: 02 §5 rules out anything
   * that makes the set look like an archive, and a filter that writes to the
   * URL turns "seven curated projects" into a browsable query. It also means
   * the server-rendered HTML always contains every project, so a crawler and a
   * visitor with no JavaScript both see the whole set rather than one slice.
   */
  protected readonly active = signal<ProjectCategory | 'all'>('all');

  /**
   * Tabs are BUILT FROM THE DATA, never hardcoded.
   *
   * A fixed list of four tabs would show an empty Personal tab the moment that
   * project is deleted, and would silently miss a category added later. This
   * derives the list from the projects actually present and in the order 04 §3
   * defines them, so deleting a project removes its tab when it was the last
   * of its kind, and nothing has to be edited here when the set changes.
   *
   * `category` is optional on Project, so before it is seeded every project is
   * uncategorised, no category tab has any members, and the row collapses to
   * "All" alone — which is correct rather than broken.
   */
  protected readonly tabs = computed(() => {
    const projects = this.projects().projects;
    const order: readonly ProjectCategory[] = ['company', 'freelance', 'personal'];
    const present = order
      .map((value) => ({ value, count: projects.filter((p) => p.category === value).length }))
      .filter((tab) => tab.count > 0);

    /** One tab is not a filter, it is a label — so the row only appears when
     *  there is an actual choice to make. */
    return present.length > 1
      ? [{ value: 'all' as const, count: projects.length }, ...present]
      : [];
  });

  /**
   * Tabs are sharp rectangles, not pills (2026-09-20).
   *
   * They were `rounded-full` with a solid orange fill on the active one, and
   * they were the only pill on the site: every other control — buttons, tags,
   * inputs, skill marks — is `rounded-sm` with a hairline border and a mono
   * uppercase label. A pill row above a grid of hard-cornered cards read as a
   * component borrowed from somewhere else.
   *
   * The active fill went with the shape. 07 §2 keeps orange on borders, marks
   * and controls rather than as a field, and a filled tab was the largest
   * orange area on the page — louder than the featured card it sat above,
   * which inverts the hierarchy the lead card exists to create. It is now a
   * tinted panel behind orange text: unambiguous, and quieter than the work.
   *
   * Built as one string rather than several [class.x] bindings because the
   * border colour differs between states: two single-class utilities writing
   * the same property would be decided by Tailwind's emit order, which is the
   * bug that silently ate the flush cards' padding (07 §5a).
   *
   * `min-h-11` is the 44px touch target, kept from the pill version — the row
   * wraps on a phone rather than scrolling, so every tab stays reachable
   * without a horizontal gesture that has no affordance.
   */
  protected tabClasses(value: ProjectCategory | 'all'): string {
    const base =
      'inline-flex min-h-11 items-center gap-2.5 rounded-sm border px-4 font-mono text-label ' +
      'uppercase tracking-label transition-colors duration-(--duration-base) ease-out-strong';
    return this.active() === value
      ? `${base} border-action/70 bg-action/12 text-action`
      : `${base} border-fg/15 text-fg-muted hover:border-action/50 hover:text-fg`;
  }

  protected select(value: ProjectCategory | 'all'): void {
    this.active.set(value);
  }

  /** Everything in the active tab, still in curation order. */
  protected readonly visible = computed(() => {
    const projects = this.projects().projects;
    const active = this.active();
    return active === 'all' ? projects : projects.filter((p) => p.category === active);
  });

  /**
   * The lead card is chosen by `tier`, not by taking `visible()[0]`.
   *
   * Ordering and prominence are two different decisions: `order` says where a
   * project sits in the list, `tier` says how much real estate it earns (03 §3).
   * Reading position 0 as "featured" would silently promote whatever happened
   * to sort first if the curation order ever changed.
   *
   * It is resolved WITHIN the active tab. Filtering to a category whose
   * projects are all compact simply has no lead and renders as an even grid —
   * better than promoting a compact project into a slot that expects a cover
   * image, a role and a timeframe it does not have.
   */
  protected readonly featured = computed(
    () => this.visible().find((p) => p.tier === 'featured') ?? null,
  );

  protected readonly rest = computed(() => {
    const lead = this.featured();
    return this.visible().filter((p) => p !== lead);
  });

  protected readonly count = computed(() => this.visible().length);

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
