import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { COPY } from '../../core/content/site-copy';
import { SiteState } from '../../core/services/site-state';
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
  imports: [UiButton, UiEyebrow],
  template: `
    @let p = profile();

    <section class="container-content py-20">
      <ui-eyebrow>Contact</ui-eyebrow>
      <h1 class="mt-4 text-display-1 font-display text-fg">Get in touch</h1>

      @if (p) {
        <p class="mt-6 text-body-lg text-fg-muted">{{ copy.contact }}</p>

        <div class="mt-10">
          <a uiButton [href]="'mailto:' + p.contactEmail">{{ p.contactEmail }}</a>
        </div>

        <ul class="mt-10 space-y-4">
          @for (channel of channels(); track channel.label) {
            <li class="border-t border-fg/12 pt-4">
              <a
                [href]="channel.href"
                target="_blank"
                rel="noopener"
                class="text-body-lg text-fg no-underline hover:text-action"
                >{{ channel.label }}</a
              >
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
    </section>
  `,
})
export class Contact {
  protected readonly profile = inject(SiteState).profile;
  protected readonly copy = COPY;

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
