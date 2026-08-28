/**
 * Media (04 §6, updated 2026-08-28 for the Cloudinary migration in 06 §3.2).
 *
 * Firestore holds only the METADATA. The bytes live in Cloudinary; Firebase
 * Storage is no longer part of the architecture at all.
 *
 * Subcollection at /projects/{slug}/media/{mediaId} (06 §3.1) — mirroring the
 * per-project folder structure used locally and in Cloudinary, which keeps
 * queries naturally scoped.
 *
 * Not `Editable`: media inherits its parent project's publish state. A separate
 * status here would let a published project reference a draft screenshot — and
 * conversely, a draft project's images are unreachable because the project that
 * would yield their slug is never returned by a public query (05 §6).
 */

/**
 * Images only (04 §6, narrowed 2026-08-28).
 *
 * The original `image | video | thumbnail` union is gone: hosting video inside
 * the portfolio is a locked non-goal, and `SocialVideo` (04 §8) already covers
 * video by storing an external platform URL and never a file. `thumbnail` was
 * redundant besides — `isFeatured` already marks the card image, and Cloudinary
 * derives sizes from one source asset via transformation URLs rather than
 * needing a separately uploaded thumbnail.
 *
 * Kept as a single-member union rather than dropped entirely so that the field
 * survives in the stored documents; widening it later is additive, whereas
 * removing and re-adding a field is a migration.
 */
export type MediaType = 'image';

export interface Media {
  readonly id: string;
  /** Parent reference (04 §6). Redundant inside the subcollection, but kept so
   *  a media item stays self-describing once it is out of its query context. */
  readonly projectSlug: string;
  readonly type: MediaType;
  /** Cloudinary `secure_url` — the delivery URL as returned at upload time. */
  readonly url: string;
  /**
   * Cloudinary asset identifier. REQUIRED (04 §6).
   *
   * Upload time is the only moment this is available, and without it the asset
   * can never be deleted from Cloudinary or re-derived at another size. Storing
   * it is what keeps the accepted orphaned-asset gap (04 §6) recoverable rather
   * than permanent — see core/cloudinary/cloudinary.config.ts.
   */
  readonly publicId: string;
  /**
   * Alternative text. REQUIRED, not optional (04 §6, 07 §8).
   *
   * Required in the type so the Dashboard cannot save an image without one.
   * Accessibility that depends on remembering is accessibility that decays; a
   * screenshot with no alt text is invisible to a screen reader, and case
   * studies are largely carried by their screenshots.
   */
  readonly alt: string;
  /** Optional visible caption — distinct from `alt`, which is not shown. */
  readonly caption?: string;
  readonly order: number;
  /** The card/preview image. At most one per project. */
  readonly isFeatured: boolean;
}
