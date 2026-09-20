import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

/**
 * Formspree's endpoint for this site.
 *
 * Public by design — a Formspree form ID is meant to live in client HTML, and
 * it grants nothing except the ability to post a message to the inbox behind
 * it. It is not a credential and is deliberately not hidden or proxied.
 *
 * Formspree rather than a Cloud Function: Functions require the Blaze plan,
 * which this project has already decided against once (see the Storage note in
 * 10). A form that needs a billing upgrade to send an email is not a simpler
 * form.
 */
const ENDPOINT = 'https://formspree.io/f/xppwpwrn';

/**
 * The contact form (02 §9, decided 2026-09-20).
 *
 * 02 §9 left this open — "no contact form complexity required unless later
 * decided" — and it has now been decided, so this ships ALONGSIDE the mailto
 * button rather than replacing it. Both are wanted: a recruiter reading on a
 * work laptop with no mail client configured cannot use mailto at all, and
 * someone who lives in their mail client should not have to retype an address
 * into a web form. The button stays first because it is the one that costs
 * nothing to trust.
 *
 * ─── Why the submit is a fetch and not a plain form POST ─────────────────────
 * A native POST to Formspree navigates away to Formspree's own thank-you page,
 * which ends the visit on someone else's domain. Posting JSON and handling the
 * response keeps the visitor here and lets the confirmation be written in this
 * site's own voice. The cost is that it needs JavaScript — acceptable only
 * because the mailto route beside it does not.
 *
 * ─── What the recipient sees ─────────────────────────────────────────────────
 * `_subject` is Formspree's own field for the email subject line, and it names
 * both the site and the sender, so a message from here is identifiable in an
 * inbox before it is opened rather than arriving as "New submission". `_gotcha`
 * is Formspree's honeypot: hidden from people, filled in by the kind of bot
 * that submits every field it finds, and silently discarded when it is.
 */
@Component({
  selector: 'app-contact-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <form
      #form="ngForm"
      (ngSubmit)="submit(form)"
      class="rounded-md border border-fg/12 bg-surface p-6 sm:p-8"
      novalidate
    >
      <!--
        Formspree's honeypot. Hidden from sighted visitors with the same
        utility the skip link uses, and taken out of the tab order and the
        accessibility tree so that nobody using a keyboard or a screen reader
        can land in a field that would silently discard their message.
      -->
      <input
        type="text"
        name="_gotcha"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        class="sr-only"
        [(ngModel)]="honeypot"
      />

      <label class="block">
        <span class="mono-label text-fg-muted">Name</span>
        <input
          #nameCtl="ngModel"
          name="name"
          type="text"
          autocomplete="name"
          required
          [(ngModel)]="name"
          [class]="fieldClasses(nameCtl.invalid && nameCtl.touched)"
        />
        @if (nameCtl.invalid && nameCtl.touched) {
          <span class="mt-2 block text-caption text-action">Please add your name.</span>
        }
      </label>

      <label class="mt-6 block">
        <span class="mono-label text-fg-muted">Email</span>
        <input
          #emailCtl="ngModel"
          name="email"
          type="email"
          autocomplete="email"
          required
          email
          [(ngModel)]="email"
          [class]="fieldClasses(emailCtl.invalid && emailCtl.touched)"
        />
        @if (emailCtl.invalid && emailCtl.touched) {
          <span class="mt-2 block text-caption text-action">
            Please use an address I can reply to.
          </span>
        }
      </label>

      <label class="mt-6 block">
        <span class="mono-label text-fg-muted">Message</span>
        <textarea
          #messageCtl="ngModel"
          name="message"
          rows="5"
          required
          [(ngModel)]="message"
          [class]="fieldClasses(messageCtl.invalid && messageCtl.touched)"
        ></textarea>
        @if (messageCtl.invalid && messageCtl.touched) {
          <span class="mt-2 block text-caption text-action">Please write a message.</span>
        }
      </label>

      <button
        type="submit"
        [disabled]="busy()"
        class="mt-8 inline-flex min-h-11 items-center justify-center rounded-sm bg-action px-6
               py-3 text-body font-medium text-bg transition-colors duration-(--duration-base)
               ease-out-strong hover:bg-action-hover disabled:pointer-events-none
               disabled:opacity-50"
      >
        {{ busy() ? 'Sending…' : 'Send message' }}
      </button>

      <!--
        One live region for both outcomes, so a screen reader is told what
        happened without the focus moving out from under anyone mid-typing.
        polite rather than assertive: the result matters, but not enough to cut
        across whatever is being read at the time.
      -->
      <p class="mt-6 text-body" aria-live="polite">
        @if (sent()) {
          <!-- Confirms delivery and stops there. A reply time would be an
               invented commitment on Muhammed's behalf. -->
          <span class="text-fg">Thanks — your message has been sent.</span>
        } @else if (error(); as problem) {
          <span class="text-action">{{ problem }}</span>
        }
      </p>
    </form>
  `,
})
export class ContactForm {
  /**
   * Plain properties, not signals: `[(ngModel)]` writes straight into them and
   * the resulting event marks this OnPush component for check on its own. It
   * matches the admin sign-in form, which is the only other place on the site
   * with typed fields in it.
   */
  protected name = '';
  protected email = '';
  protected message = '';
  protected honeypot = '';

  protected readonly busy = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);

  /**
   * Invalid fields are outlined in orange rather than only described in text
   * below them, so the field itself carries the state — and the text below
   * still says what is wrong, because colour on its own is not a message.
   */
  protected fieldClasses(invalid: boolean | null): string {
    const base =
      'mt-2 min-h-11 w-full rounded-sm border bg-bg px-3 py-2.5 text-body text-fg ' +
      'transition-colors duration-(--duration-base) ease-out-strong focus:border-action';
    return invalid ? `${base} border-action` : `${base} border-fg/25`;
  }

  protected async submit(form: NgForm): Promise<void> {
    /**
     * Marking the whole form touched is what makes a blind submit useful: an
     * untouched invalid field shows nothing, so without this the button would
     * appear to do nothing at all.
     */
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.error.set('Please fill in every field before sending.');
      return;
    }

    this.busy.set(true);
    this.error.set(null);

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          message: this.message,
          _gotcha: this.honeypot,
          _subject: `Portfolio site — new message from ${this.name}`,
        }),
      });

      if (response.ok) {
        this.sent.set(true);
        /** resetForm() pushes null into every bound model, so the fields are
         *  put back to empty strings explicitly rather than left as null. */
        form.resetForm();
        this.name = this.email = this.message = this.honeypot = '';
        return;
      }

      /**
       * Formspree returns its own reason (a disabled form, a blocked address,
       * a monthly limit), and it is more use than anything this could invent.
       * The status code is the fallback for a response with no body to read.
       */
      const body = await response.json().catch(() => null);
      const reported = body?.errors?.[0]?.message as string | undefined;
      this.error.set(
        reported ??
          `That did not send (error ${response.status}). Use the email address above instead.`,
      );
    } catch {
      /** Offline, or the request never reached Formspree at all. */
      this.error.set('That did not send. Check your connection, or use the email address above.');
    } finally {
      this.busy.set(false);
    }
  }
}
