import { Editable } from './content-status';

/**
 * Profile — singleton (04 §2). Edited, never created or deleted.
 *
 * NOTE ON THE MISSING AVAILABILITY FIELD (10 §1):
 * The design-mockup pass invented "Kuwait — remote friendly". 04 §2's schema
 * has no location/availability field at all, and 10 §1 records that adding one
 * is a schema change to raise deliberately (09 §2.3) rather than slip in.
 * The shape has since been confirmed as "remote availability only, no city or
 * country", but the exact wording is still outstanding — so no field is added
 * here yet. It blocks the Hero in Phase 3, not this model.
 *
 * Excluded on purpose (04 §2, brief §27): WhatsApp and Calendly.
 */
export interface Profile extends Editable {
  readonly name: string;
  /** The one-line identity statement (01 §5). Still unlocked — see 10 §2. */
  readonly heroStatement: string;
  readonly positioning: string;
  /** Short bio for meta tags and link previews. */
  readonly bioShort: string;
  /** Full About/Story narrative. */
  readonly bioLong: string;
  /**
   * Storage path (not a download URL) for the current resume PDF, so the file
   * can be replaced without a redeploy (04 §2, 06 §3.2). Optional: the site
   * must render with the resume link absent rather than break (04 §1.2).
   */
  readonly resumeFile?: string;
  readonly contactEmail: string;
  readonly contactLinkedIn: string;
  readonly contactGitHub: string;
  readonly socialInstagram?: string;
  readonly socialFacebook?: string;
}
