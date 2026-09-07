import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { COPY } from '../../core/content/site-copy';
import { SeoService } from '../../core/seo/seo.service';
import { SiteState } from '../../core/services/site-state';
import { UiStripBackdrop } from '../../shared/blocks/strip-backdrop/strip-backdrop';
import { UiButton, UiEyebrow } from '../../shared/ui';

/**
 * Contact (02 §9).
 *
 * Link-only, no form. 02 §9 says "no contact form complexity required unless
 * later decided" and 10 §3 still has that decision open — so the simpler thing
 * ships, and a form can be added if it is ever actually wanted. Building one
 * now would be answering an open question by default.
 *
 * Primary channels only: Email, LinkedIn, GitHub (brief §27, 02 §9). The social
 * profiles are reachable from the footer and from /beyond/social, so they are
 * not repeated here — 02 §9 asks for a hierarchy that prioritises professional
 * communication, and listing five equal links is not a hierarchy.
 *
 * NO WhatsApp and NO Calendly anywhere, per brief §27's explicit exclusion.
 */
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButton, UiEyebrow, UiStripBackdrop],
  template: `
    @let p = profile();

    <section class="relative overflow-hidden py-20">
      <ui-strip-backdrop anchor="bottom-right" scale="md" />

      <div class="container-content stagger-in-lead relative">
        <ui-eyebrow>Contact</ui-eyebrow>
        <h1 class="display-condensed mt-5 text-display-hero font-display text-fg">Get in touch</h1>

        @if (p) {
          <p class="mt-6 max-w-lg text-body-lg text-fg">{{ copy.contact }}</p>

          <div class="mt-10">
            <a uiButton [href]="'mailto:' + p.contactEmail">{{ p.contactEmail }}</a>
          </div>

          <!--
            Each channel is a full row, not a word on a line: the whole row is
            the target, which is what makes these comfortable on a phone. The
            arrow slides on hover so the row reads as a door rather than a
            label that happens to be blue.
          -->
          <ul class="mt-12">
            @for (channel of channels(); track channel.label) {
              <li>
                <a
                  [href]="channel.href"
                  target="_blank"
                  rel="noopener"
                  class="group flex min-h-16 items-center justify-between gap-4 border-t
                         border-fg/12 py-4 text-body-lg text-fg no-underline transition-colors
                         duration-[--duration-base] ease-[--ease-out-strong] hover:border-action/60
                         hover:text-action"
                >
                  <span class="sweep-underline">{{ channel.label }}</span>
                  <span
                    class="shrink-0 transition-transform duration-[--duration-base]
                           ease-[--ease-out-strong] group-hover:translate-x-1"
                    aria-hidden="true"
                    >→</span
                  >
                </a>
              </li>
            }
          </ul>

          <!-- 02 §10: the resume is repeated here as one of its entry points. -->
          @if (p.resumeFile) {
            <div class="mt-12 border-t border-fg/12 pt-8">
              <a uiButton variant="secondary" [href]="p.resumeFile" target="_blank" rel="noopener">
                Download resume
              </a>
            </div>
          }
        }
      </div>
    </section>
  `,
})
export class Contact {
  protected readonly profile = inject(SiteState).profile;
  protected readonly copy = COPY;

  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.apply({
      path: '/contact',
      title: 'Contact — Muhammed Al-Ateeqi',
      description: 'Email, LinkedIn and GitHub — the fastest ways to get in touch.',
    });
  }

  /** Professional channels only — see the class note on brief §27. */
  protected channels(): { label: string; href: string }[] {
    const p = this.profile();
    if (!p) return [];
    return [
      { label: 'LinkedIn', href: p.contactLinkedIn },
      { label: 'GitHub', href: p.contactGitHub },
    ].filter((c) => c.href);
  }
}
