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
    <div class="container-content flex min-h-screen items-center py-20">
      <div class="w-full max-w-sm">
        <h1 class="font-display text-display-3 text-fg">Dashboard</h1>
        <p class="mt-2 text-caption text-fg-muted">Sign in to manage site content.</p>

        <form class="mt-8 space-y-4" (ngSubmit)="signIn()">
          <label class="block">
            <span class="font-mono text-label text-fg-muted uppercase">Email</span>
            <input
              name="email"
              type="email"
              autocomplete="username"
              required
              [(ngModel)]="email"
              class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
            />
          </label>

          <label class="block">
            <span class="font-mono text-label text-fg-muted uppercase">Password</span>
            <input
              name="password"
              type="password"
              autocomplete="current-password"
              required
              [(ngModel)]="password"
              class="mt-2 w-full rounded-sm border border-fg/40 bg-surface px-3 py-2 text-body text-fg"
            />
          </label>

          @if (error(); as message) {
            <p class="text-caption text-action" role="alert">{{ message }}</p>
          }

          <button
            type="submit"
            [disabled]="busy()"
            class="w-full rounded-sm bg-action px-6 py-3 text-body font-medium text-bg disabled:opacity-50"
          >
            {{ busy() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <button
          type="button"
          [disabled]="busy()"
          (click)="signInWithGoogle()"
          class="mt-3 w-full rounded-sm border border-fg/40 px-6 py-3 text-body text-fg disabled:opacity-50"
        >
          Continue with Google
        </button>
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
