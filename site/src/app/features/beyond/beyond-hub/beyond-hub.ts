import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COPY } from '../../../core/content/site-copy';
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
  imports: [RouterLink, UiCard, UiEyebrow],
  template: `
    <section class="container-wide py-20">
      <ui-eyebrow>Beyond Code</ui-eyebrow>
      <h1 class="mt-4 max-w-3xl text-display-1 font-display text-fg">{{ copy.beyondHub }}</h1>

      <div class="mt-14 grid gap-6 md:grid-cols-3">
        @for (room of rooms; track room.path) {
          <ui-card [interactive]="true">
            <h2 class="text-display-3 font-display text-fg">
              <a [routerLink]="room.path" class="text-fg no-underline hover:text-action">{{
                room.title
              }}</a>
            </h2>
            <p class="mt-4 text-body text-fg-muted">{{ room.blurb }}</p>
          </ui-card>
        }
      </div>
    </section>
  `,
})
export class BeyondHub {
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
}
