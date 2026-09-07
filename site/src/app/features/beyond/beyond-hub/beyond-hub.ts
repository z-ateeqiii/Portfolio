import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COPY } from '../../../core/content/site-copy';
import { SeoService } from '../../../core/seo/seo.service';
import { UiStripBackdrop } from '../../../shared/blocks/strip-backdrop/strip-backdrop';
import { RevealDirective } from '../../../shared/motion/reveal.directive';
import { UiCard, UiEyebrow } from '../../../shared/ui';

/**
 * Beyond Code hub (02 §8).
 *
 * A hub, not a deep page: three doors and a short framing, nothing more. The
 * temptation is to make this page substantial in its own right — 02 §8 rules
 * that out explicitly, and brief §18 says this layer "should not compete with
 * the professional experience".
 *
 * On the "different room, same house" register shift (02 §8, brand §11–12):
 * this is done with space and scale, not with a different palette. Introducing
 * a second visual system here would break the colour-role discipline in 07 §2
 * for a page whose whole job is to feel connected to the rest of the site.
 */
@Component({
  selector: 'app-beyond-hub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, UiCard, UiEyebrow, UiStripBackdrop],
  template: `
    <section class="relative py-20">
      <ui-strip-backdrop anchor="top-right" scale="md" />

      <div class="container-wide relative">
        <div class="stagger-in-lead">
          <ui-eyebrow>Beyond Code</ui-eyebrow>
          <h1 class="mt-5 max-w-3xl text-display-1 font-display text-fg">{{ copy.beyondHub }}</h1>
        </div>

        <div appReveal mode="grid" class="mt-14 grid gap-6 md:grid-cols-3">
          @for (room of rooms; track room.path; let i = $index) {
            <ui-card [interactive]="true">
              <p class="mono-label text-fg-muted">{{ pad(i + 1) }}</p>

              <h2 class="display-condensed mt-5 text-display-3 font-display text-fg">
                <a
                  [routerLink]="room.path"
                  class="text-fg no-underline transition-colors duration-(--duration-base)
                         ease-out-strong hover:text-action"
                  >{{ room.title }}</a
                >
              </h2>

              <p class="mt-4 text-body text-fg-muted">{{ room.blurb }}</p>
            </ui-card>
          }
        </div>
      </div>
    </section>
  `,
})
export class BeyondHub {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      path: '/beyond',
      title: 'Beyond Code — Muhammed Al-Ateeqi',
      description:
        'The layer behind the engineer: social media, the Ateeqi Tech laptop business, and teaching.',
    });
  }

  protected readonly copy = COPY;

  /**
   * The three entry cards named in 02 §8, in that order. Blurbs describe what
   * each page contains rather than making a claim — the claims live on the
   * pages themselves, backed by seeded records.
   */
  protected readonly rooms = [
    {
      path: '/beyond/social',
      title: 'Social Media World',
      blurb: 'Years of making things for an audience, and what that turned into.',
    },
    {
      path: '/beyond/business',
      title: 'Business',
      blurb: 'Ateeqi Tech — a laptop business built on asking what someone actually needed.',
    },
    {
      path: '/beyond/teaching',
      title: 'Teaching',
      blurb: 'Explaining technical things to people who are still learning them.',
    },
  ];

  /** "01", "02" … — the zero-padded ordinals the reference uses on its cards. */
  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
