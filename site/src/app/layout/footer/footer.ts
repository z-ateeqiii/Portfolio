import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Profile } from '../../core/models';
import { socialMark } from './social-icons';
import { UiStripBackdrop } from '../../shared/blocks/strip-backdrop/strip-backdrop';

/**
 * Site footer (02 §3, 07 §5a).
 *
 * Repeats the core paths for anyone who scrolled past the header, plus the
 * contact channels. No WhatsApp, no Calendly — an explicit exclusion in brief
 * §27 and restated in 02 §3, so those are absent by rule rather than oversight.
 *
 * Every channel renders only if the Profile actually carries it (04 §1.2): a
 * footer that lists an empty link is worse than a shorter footer.
 *
 * ─── The closing frame (visual alignment pass, 2026-09-07) ───────────────────
 * The design reference's frames are bounded top and bottom by the same two
 * marks: the wordmark, and a row of wide-tracked mono metadata. The header
 * carries the opening one; this is the closing one, and it is why the name is
 * set once more here at display scale rather than only as a copyright line.
 *
 * It also carries the last glow in the scroll — anchored bottom-left so the
 * page fades out warm instead of ending on a flat hairline. This is the one
 * place on the site where the backdrop is deliberately allowed to sit under
 * body-sized text, because there is very little of it and none of it is prose.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UiStripBackdrop],
  host: { class: 'relative mt-24 block border-t border-fg/12' },
  template: `
    <ui-strip-backdrop anchor="bottom-left" scale="sm" />

    <div class="container-page stagger-in-lead relative flex flex-col gap-10 py-14">
      @if (profile(); as p) {
        <p class="display-condensed text-display-2 font-display text-fg">{{ p.name }}</p>
      }

      <div class="rule-strip"></div>

      <div class="grid gap-10 sm:grid-cols-2">
        <div>
          <p class="mono-label text-fg-muted">Pages</p>
          <nav class="mt-4 flex flex-col items-start gap-1" aria-label="Footer">
            @for (item of paths; track item.path) {
              <a
                [routerLink]="item.path"
                class="sweep-underline flex min-h-11 items-center text-body text-fg-muted
                       no-underline hover:text-fg"
                >{{ item.label }}</a
              >
            }
            @if (profile()?.resumeFile; as url) {
              <a
                [href]="url"
                target="_blank"
                rel="noopener"
                class="sweep-underline flex min-h-11 items-center text-body text-fg-muted
                       no-underline hover:text-fg"
                >Resume</a
              >
            }
          </nav>
        </div>

        @if (profile()) {
          <div>
            <p class="mono-label text-fg-muted">Elsewhere</p>
            <ul class="mt-4 flex flex-col items-start gap-1">
              @for (channel of channels(); track channel.label) {
                <li>
                  <a
                    [href]="channel.href"
                    target="_blank"
                    rel="noopener"
                    class="group flex min-h-11 items-center gap-3 text-body text-fg-muted
                           no-underline transition-colors duration-(--duration-fast)
                           ease-out-strong hover:text-fg"
                  >
                    <!--
                      The channel's actual brand mark (07 §7c). These used to
                      be the same three abstract shapes the tags and eyebrows
                      cycle through, which worked as rhythm on a tag but not
                      here: a diamond beside "LinkedIn" and a circle beside
                      "Instagram" carry no meaning, so the row read as
                      decoration rather than as a set of destinations. A
                      recognisable mark is the one thing an icon in a footer
                      is actually for.

                      Decorative all the same — the link text is what names
                      the destination, so the svg stays hidden from assistive
                      tech and nothing is announced twice.
                    -->
                    @if (mark(channel.label); as glyph) {
                      <svg
                        class="size-4.5 shrink-0 transition-transform duration-(--duration-base)
                               ease-out-strong group-hover:-translate-y-0.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        [attr.fill-rule]="glyph.evenOdd ? 'evenodd' : null"
                        aria-hidden="true"
                      >
                        <path [attr.d]="glyph.path" />
                      </svg>
                    }
                    <span class="sweep-underline">{{ channel.label }}</span>
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      </div>

      <div class="rule-strip"></div>

      @if (profile(); as p) {
        <p class="mono-label text-fg-muted">© {{ year }} {{ p.name }}</p>
      }
    </div>
  `,
})
export class AppFooter {
  readonly profile = input<Profile | null>(null);

  /** Exposed to the template; null for any channel with no mark. */
  protected readonly mark = socialMark;

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
