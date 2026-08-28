import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Profile } from '../../core/models';

/**
 * Site footer (02 §3).
 *
 * Repeats the core paths for anyone who scrolled past the header, plus the
 * contact channels. No WhatsApp, no Calendly — an explicit exclusion in brief
 * §27 and restated in 02 §3, so those are absent by rule rather than oversight.
 *
 * Every channel renders only if the Profile actually carries it (04 §1.2): a
 * footer that lists an empty link is worse than a shorter footer.
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'mt-24 border-t border-fg/12' },
  template: `
    <div class="container-wide flex flex-col gap-8 py-12">
      <nav class="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
        @for (item of paths; track item.path) {
          <a
            [routerLink]="item.path"
            class="text-caption text-fg-muted no-underline hover:text-action"
            >{{ item.label }}</a
          >
        }
        @if (profile()?.resumeFile; as url) {
          <a
            [href]="url"
            target="_blank"
            rel="noopener"
            class="text-caption text-fg-muted no-underline hover:text-action"
            >Resume</a
          >
        }
      </nav>

      @if (profile(); as p) {
        <ul class="flex flex-wrap gap-x-6 gap-y-2">
          @for (channel of channels(); track channel.label) {
            <li>
              <a
                [href]="channel.href"
                target="_blank"
                rel="noopener"
                class="font-mono text-label text-fg-muted uppercase no-underline hover:text-action"
                >{{ channel.label }}</a
              >
            </li>
          }
        </ul>

        <p class="text-caption text-fg-muted">
          © {{ year }} {{ p.name }}
        </p>
      }
    </div>
  `,
})
export class AppFooter {
  readonly profile = input<Profile | null>(null);

  protected readonly year = new Date().getFullYear();

  protected readonly paths = [
    { path: '/work', label: 'Work' },
    { path: '/about', label: 'About' },
    { path: '/beyond', label: 'Beyond Code' },
    { path: '/contact', label: 'Contact' },
  ];

  /** Built from whatever the Profile actually has — never a fixed list. */
  protected channels(): { label: string; href: string }[] {
    const p = this.profile();
    if (!p) return [];
    return [
      { label: 'Email', href: p.contactEmail ? `mailto:${p.contactEmail}` : '' },
      { label: 'LinkedIn', href: p.contactLinkedIn },
      { label: 'GitHub', href: p.contactGitHub },
      { label: 'Instagram', href: p.socialInstagram ?? '' },
      { label: 'Facebook', href: p.socialFacebook ?? '' },
    ].filter((c) => c.href);
  }
}
