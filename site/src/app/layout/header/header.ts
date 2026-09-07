import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { UiButton } from '../../shared/ui';

/**
 * Site header (02 §3, 07 §5a).
 *
 * Nav is deliberately short — "this is a story-driven site, not a documentation
 * site". Resume is a button rather than a text link because 02 §3 and brief §28
 * make it a top-priority recruiter exit path that "should never require
 * scrolling or exploring to find".
 *
 * Beyond Code is present but visually quieter than Work/About: 02 §3 asks that
 * it "not visually compete" — it is an invitation, not a headline item. That is
 * done with weight, not colour.
 *
 * ─── The wordmark (visual alignment pass, 2026-09-07) ────────────────────────
 * The design reference puts the name in wide-tracked uppercase monospace at the
 * top-left of every frame, and it is the single most identifying mark in the
 * whole system — so the header now carries exactly that, via `mono-wordmark`
 * (0.38em tracking, the widest step on the site and reserved for the name
 * alone). It replaces a display-face rendering of the same words: the reference
 * never sets the name in the display face, which is kept for headlines.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── Why there is now a real mobile menu ─────────────────────────────────────
 * Four nav links plus a Resume button previously sat in one row at every width.
 * At 375px that produced roughly 30px-tall tap targets packed against each
 * other — under both the WCAG 2.2 AA 24px floor and the 44px platform guidance
 * ui-ux-pro-max flags at High severity, and the exact "same tiny buttons on
 * mobile" pattern its Responsive/Touch Friendly rule names. Below `sm` the
 * links now live in a disclosure panel where each is a full-width 48px row.
 *
 * The panel is plain conditional markup driven by a signal — no library, no
 * focus-trap, no scroll-lock. It is a short list of links, not a modal: the
 * page behind it stays perfectly usable, and Escape/Tab behave the way the
 * platform already makes them behave.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, UiButton],
  host: { class: 'sticky top-0 z-40 border-b border-fg/12 bg-bg/85 backdrop-blur-sm' },
  template: `
    <div class="container-wide flex items-center justify-between gap-6 py-4">
      <!-- Logo/name always returns Home (02 §3). -->
      <a
        routerLink="/"
        (click)="open.set(false)"
        class="mono-wordmark sweep-underline text-fg no-underline hover:text-fg"
        >{{ name() || 'Muhammed Al-Ateeqi' }}</a
      >

      <!-- Desktop nav. Hidden below the sm breakpoint, where the disclosure
           panel further down takes over. -->
      <nav class="hidden items-center gap-1 sm:flex sm:gap-2" aria-label="Primary">
        @for (item of links; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="text-fg nav-active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="nav-underline flex min-h-11 items-center px-3 text-body text-fg-muted
                   no-underline transition-colors duration-[--duration-fast]
                   ease-[--ease-out-strong] hover:text-fg"
            >{{ item.label }}</a
          >
        }

        @if (resumeUrl(); as url) {
          <a uiButton variant="secondary" [href]="url" target="_blank" rel="noopener" class="ml-2">
            Resume
          </a>
        }
      </nav>

      <!--
        Mobile trigger. A 44px square, which is the platform guidance for a
        standalone icon control and well clear of the 24px WCAG floor. Drawn
        with two spans rather than an icon font or an SVG sprite: it is two
        lines, and it animates into a close mark on open.
      -->
      <button
        type="button"
        (click)="open.set(!open())"
        [attr.aria-expanded]="open()"
        aria-controls="mobile-nav"
        [attr.aria-label]="open() ? 'Close menu' : 'Open menu'"
        class="flex size-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-sm
               border border-fg/40 transition-colors duration-[--duration-fast]
               ease-[--ease-out-strong] hover:border-action sm:hidden"
      >
        <!--
          A style binding, not a class binding: the offset that closes the 6px
          gap between the two lines is 3.5px, which as a Tailwind arbitrary
          value carries square brackets — and square brackets inside a
          class-binding NAME are a template parse error, not just ugly.
        -->
        <span
          class="block h-px w-5 bg-fg transition-transform duration-[--duration-base]
                 ease-[--ease-out-strong]"
          [style.transform]="open() ? 'translateY(3.5px) rotate(45deg)' : 'none'"
        ></span>
        <span
          class="block h-px w-5 bg-fg transition-transform duration-[--duration-base]
                 ease-[--ease-out-strong]"
          [style.transform]="open() ? 'translateY(-3.5px) rotate(-45deg)' : 'none'"
        ></span>
      </button>
    </div>

    @if (open()) {
      <nav
        id="mobile-nav"
        aria-label="Primary"
        class="container-wide flex flex-col gap-1 border-t border-fg/12 pb-6 sm:hidden"
      >
        @for (item of links; track item.path; let i = $index) {
          <a
            [routerLink]="item.path"
            routerLinkActive="text-fg nav-active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            (click)="open.set(false)"
            class="stagger-in nav-underline flex min-h-12 items-center border-b border-fg/12
                   text-body-lg text-fg-muted no-underline"
            [style.animation-delay.ms]="i * 40"
            >{{ item.label }}</a
          >
        }

        @if (resumeUrl(); as url) {
          <a
            uiButton
            variant="secondary"
            [href]="url"
            target="_blank"
            rel="noopener"
            class="stagger-in mt-4 w-full"
            [style.animation-delay.ms]="links.length * 40"
          >
            Resume
          </a>
        }
      </nav>
    }
  `,
})
export class AppHeader {
  /** From the Profile singleton, so the site name is content, not a constant. */
  readonly name = input<string>('');

  /**
   * Absent until a resume is uploaded (04 §2, 10 §4b). The button is not
   * rendered at all rather than rendered dead: 02 §3 promises this link works,
   * and a Resume button that goes nowhere is worse for a recruiter than no
   * button, because it costs them a click to discover the gap.
   */
  readonly resumeUrl = input<string | undefined>(undefined);

  protected readonly links = [
    { path: '/work', label: 'Work', exact: false },
    { path: '/about', label: 'About', exact: true },
    { path: '/beyond', label: 'Beyond Code', exact: false },
    { path: '/contact', label: 'Contact', exact: true },
  ];

  /**
   * Mobile disclosure state. Closed on every navigation (each link sets it
   * back), so returning to a page never lands on an open menu — and because
   * the panel is `@if`-gated, a closed menu is genuinely absent from the DOM
   * rather than hidden, which keeps its links out of the tab order.
   */
  protected readonly open = signal(false);
}
