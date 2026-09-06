import { Editable } from './content-status';

/**
 * A real personal photo used full-bleed in the Hero (04 §2's `heroImage`,
 * added 2026-09-06 — reverses brief §26's original "no portrait" rule; see
 * §26 itself for why). Same shape as `Media` (§6): a Cloudinary reference,
 * not the file itself.
 */
export interface HeroImage {
  readonly url: string;
  readonly publicId: string;
  readonly alt: string;
}

/**
 * Profile — singleton (04 §2). Edited, never created or deleted.
 *
 * NOTE ON THE MISSING AVAILABILITY FIELD (10 §1):
 * The design-mockup pass invented "Kuwait — remote friendly". 04 §2's schema
 * has no location/availability field at all, and 10 §1 records that adding one
 * is a schema change to raise deliberately (09 §2.3) rather than slip in.
 * The shape has since been confirmed as "remote availability only, no city or
 * country", but the exact wording is still outstanding — so no field is added
 * here yet.
 *
 * This no longer blocks the Hero: the locked 01 §5 copy carries no availability
 * line, so the Hero renders complete without one. If an availability line is
 * wanted later — 07 §6 suggests pairing it with the status dot — it is a
 * deliberate field addition, not a gap to fill in with a plausible line.
 *
 * Excluded on purpose (04 §2, brief §27): WhatsApp and Calendly.
 */
export interface Profile extends Editable {
  readonly name: string;
  /** Hero headline — the one-line identity statement (01 §5, locked 2026-08-27). */
  readonly heroStatement: string;
  /**
   * Hero subline (04 §2, field added 2026-08-27).
   *
   * Separate from `heroStatement` rather than concatenated into it: the two
   * are different display roles — headline in the display face, subline in the
   * body face (07 §3) — and merging them would make the Hero component split a
   * string back apart on a separator to render it. Optional, so the Hero still
   * renders on the headline alone (04 §1.2).
   */
  readonly heroSubline?: string;
  /**
   * Rotating role titles cycled in the Hero's oversized display type (04 §2,
   * added 2026-09-06 for the visual-identity redesign) — separate from
   * `heroStatement`, which stays fixed and unaffected by the rotation.
   *
   * Optional, and treated as absent-or-empty the same way: until this is
   * actually seeded, the Hero renders in its simpler, non-rotating form
   * rather than assuming a field a fresh Firestore read may not have yet
   * (the exact hydrate() lesson from the admin dashboard's `publishedAt` bug
   * — a field new to the schema is not retroactively present on old reads).
   */
  readonly heroTitles?: readonly string[];
  /**
   * A real photo, full-bleed in the Hero (04 §2, added 2026-09-06). Optional
   * so the Hero still renders — in its simpler form — before one is uploaded
   * (04 §1.2: an unset field must never break a page).
   */
  readonly heroImage?: HeroImage;
  readonly positioning: string;
  /** Short bio for meta tags and link previews. */
  readonly bioShort: string;
  /** Full About/Story narrative. */
  readonly bioLong: string;
  /**
   * Cloudinary URL for the current resume PDF (04 §2, 06 §3.2).
   *
   * Cloudinary, not Firebase Storage — Storage was dropped from the
   * architecture on 2026-08-28. The file can still be replaced without a
   * redeploy, which is the property 04 §2 actually asks for.
   *
   * Optional: the site must render with the resume link absent rather than
   * break, or offer a link that 404s (04 §1.2).
   */
  readonly resumeFile?: string;
  readonly contactEmail: string;
  readonly contactLinkedIn: string;
  readonly contactGitHub: string;
  readonly socialInstagram?: string;
  readonly socialFacebook?: string;
}
