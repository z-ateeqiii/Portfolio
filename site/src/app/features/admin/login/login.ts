import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';

/**
 * Admin sign-in (05 §1, 06 §3.3).
 *
 * No sign-up link, no password reset flow, no "remember me". There is one
 * account, created in the Firebase console — a self-service account system on a
 * single-admin tool is the scope creep 09 §3 rules out.
 *
 * Deliberately plain: the dashboard is a functional tool and does not share the
 * public site's art direction (05 §7, 07 §9). It still uses the design tokens,
 * because a second colour system to maintain would be a cost with no benefit.
 *
 * Errors are shown verbatim-ish but generic: a login screen that distinguishes
 * "no such user" from "wrong password" tells an attacker which half they got
 * right.
 */
@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <!--
      Centred in the viewport, both axes. It used to be a max-w-sm block left
      aligned inside a 58rem container, which put the form at neither the
      centre nor the edge — it read as content that had lost its layout. A
      sign-in screen has exactly one thing on it, so that thing belongs in the
      middle.

      min-h-dvh, not min-h-screen: on mobile the screen unit resolves to the largest
      viewport, so the form sat lower than centre with the browser chrome up.
    -->
    <div class="flex min-h-dvh items-center justify-center px-6 py-16">
      <div class="w-full max-w-sm">
        <h1 class="font-display text-display-3 text-fg">Dashboard</h1>
        <p class="mt-2 text-caption text-fg-muted">Sign in to manage site content.</p>

        <!--
          A bordered surface, which is structure rather than art direction —
          05 §7 keeps the public site's treatment off the dashboard, and this
          is the same hairline-on-surface the admin editors already use. It
          gives the fields an edge to sit against; without it the inputs were
          dark boxes on a dark page with nothing to say where one ended.
        -->
        <form class="mt-6 rounded-md border border-fg/12 bg-surface p-6" (ngSubmit)="signIn()">
          <label class="block">
            <span class="font-mono text-label text-fg-muted uppercase">Email</span>
            <input
              name="email"
              type="email"
              autocomplete="username"
              required
              [(ngModel)]="email"
              class="mt-2 min-h-11 w-full rounded-sm border border-fg/40 bg-bg px-3 py-2.5
                     text-body text-fg"
            />
          </label>

          <label class="mt-4 block">
            <span class="font-mono text-label text-fg-muted uppercase">Password</span>
            <input
              name="password"
              type="password"
              autocomplete="current-password"
              required
              [(ngModel)]="password"
              class="mt-2 min-h-11 w-full rounded-sm border border-fg/40 bg-bg px-3 py-2.5
                     text-body text-fg"
            />
          </label>

          @if (error(); as message) {
            <p class="mt-4 text-caption text-action" role="alert">{{ message }}</p>
          }

          <button
            type="submit"
            [disabled]="busy()"
            class="mt-6 min-h-11 w-full rounded-sm bg-action px-6 py-3 text-body font-medium
                   text-bg transition-colors duration-(--duration-base) ease-out-strong
                   hover:bg-action-hover disabled:pointer-events-none disabled:opacity-50"
          >
            {{ busy() ? 'Signing in…' : 'Sign in' }}
          </button>

          <!--
            Separated from the primary action by a rule and a label, so the two
            are not read as a pair of equal buttons. They are one action and
            one alternative route to it.
          -->
          <p
            class="mt-6 flex items-center gap-3 font-mono text-label text-fg-muted uppercase
                   before:h-px before:flex-1 before:bg-fg/12 before:content-['']
                   after:h-px after:flex-1 after:bg-fg/12 after:content-['']"
          >
            or
          </p>

                    <button
            type="button"
            [disabled]="busy()"
            (click)="signInWithGoogle()"
            class="mt-6 min-h-11 w-full rounded-sm border border-fg/40 px-6 py-3 text-body text-fg
                   transition-colors duration-(--duration-base) ease-out-strong hover:border-action
                   hover:text-action disabled:pointer-events-none disabled:opacity-50"
          >
            Continue with Google
          </button>
        </form>

      </div>
    </div>
  `,
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected async signIn(): Promise<void> {
    await this.attempt(() => this.auth.signInWithPassword(this.email, this.password));
  }

  protected async signInWithGoogle(): Promise<void> {
    await this.attempt(() => this.auth.signInWithGoogle());
  }

  private async attempt(run: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await run();
      /** Returns to whatever the guard interrupted, defaulting to the overview. */
      const next = this.route.snapshot.queryParamMap.get('next') ?? '/admin';
      await this.router.navigateByUrl(next);
    } catch {
      this.error.set('Sign-in failed. Check the email and password and try again.');
    } finally {
      this.busy.set(false);
    }
  }
}
