/**
 * Cloudinary configuration (06 §3.2, locked 2026-08-28).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTHING IN THIS FILE IS A SECRET, and that is a design constraint, not luck.
 *
 * Uploads go straight from the Dashboard's browser to Cloudinary using an
 * UNSIGNED upload preset. An unsigned preset is the whole point: the browser
 * needs no API secret to use it, so there is no secret to leak from a client
 * bundle. The preset itself is the restriction — what it allows is configured
 * in the Cloudinary console, not here.
 *
 * The API SECRET must never appear in this repo, in an environment variable
 * read by Angular, or in any client code. Operations that genuinely need it —
 * deletion being the realistic one — belong behind a server-side endpoint if
 * they are ever built (06 §3.2). See ORPHANED_ASSETS below for why that is not
 * being built now.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Firebase keeps Firestore + Auth only. Firebase Storage was dropped from the
 * architecture (06 §3.2) rather than left configured-but-unused.
 */

export const cloudinaryConfig = {
  cloudName: 'vox8f2rn',

  /**
   * Unsigned upload preset. Its asset folder is `ateeqi-portfolio`, configured
   * on the preset in the Cloudinary console.
   */
  uploadPreset: 'portfolio_images',

  /**
   * Public API key. Included because it identifies the account on upload
   * requests; it is not a credential on its own and is safe in client code.
   * The secret that pairs with it is deliberately absent — see the note above.
   */
  apiKey: '331978149316662',

  /** Root folder for everything this project uploads (06 §3.2). */
  rootFolder: 'ateeqi-portfolio',
} as const;

/**
 * Per-project image folder, e.g. `ateeqi-portfolio/projects/nutella-digital-menu`.
 *
 * Mirrors the per-project folder structure used locally and in Firestore's
 * `/projects/{slug}/media` subcollection (06 §3.1), so an asset's location in
 * Cloudinary can be derived from its project rather than looked up.
 */
export function projectFolder(slug: string): string {
  return `${cloudinaryConfig.rootFolder}/projects/${slug}`;
}

/** The unsigned upload endpoint for images (06 §3.2). */
export function uploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
}

/**
 * Builds a delivery URL with automatic format and quality.
 *
 * `f_auto,q_auto` lets Cloudinary serve AVIF/WebP to browsers that accept them
 * and pick a quality level per image, which is where most of the performance
 * win lives — and it costs nothing to opt into, since it is just a URL segment.
 * Passing an explicit width additionally caps the delivered pixels, so a card
 * thumbnail does not download a full-size screenshot.
 *
 * Takes a `publicId` rather than rewriting a stored URL: string-munging a URL
 * to inject transformations breaks the moment Cloudinary's URL shape changes,
 * whereas the publicId is the stable identifier (04 §6).
 */
export function imageUrl(publicId: string, width?: number): string {
  const transforms = ['f_auto', 'q_auto', ...(width ? [`w_${width}`, 'c_limit'] : [])].join(',');
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transforms}/${publicId}`;
}

/**
 * Known, accepted limitation (04 §6, 06 §3.2, approved 2026-08-28).
 *
 * Deleting a Media document from Firestore does NOT delete the underlying
 * Cloudinary asset, because unsigned uploads have no client-side delete
 * capability — by design, since granting one would mean shipping a secret.
 * Orphaned assets therefore accumulate slowly.
 *
 * Accepted rather than solved: for a five-project portfolio the volume is
 * negligible, and occasional manual cleanup in the Cloudinary console is
 * cheaper than building and maintaining a server-side delete endpoint. Revisit
 * only if the asset count actually becomes a problem — `publicId` is stored on
 * every Media document precisely so that cleanup stays possible later.
 */
export const ORPHANED_ASSETS_ARE_ACCEPTED = true;
