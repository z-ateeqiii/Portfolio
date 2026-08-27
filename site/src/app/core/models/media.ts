/**
 * Media (04 §6). Subcollection at /projects/{slug}/media/{mediaId} (06 §3.1) —
 * mirroring the per-project folder structure already used locally, which keeps
 * queries naturally scoped and makes migrating existing assets a near-copy.
 *
 * Not `Editable`: media inherits its parent project's publish state. A separate
 * status here would let a published project reference a draft screenshot.
 */
export type MediaType = 'image' | 'video' | 'thumbnail';

export interface Media {
  readonly id: string;
  /** Parent reference (04 §6). Redundant inside the subcollection, but kept so
   *  a media item stays self-describing once it is out of its query context. */
  readonly projectSlug: string;
  readonly type: MediaType;
  readonly url: string;
  readonly caption?: string;
  readonly order: number;
  /** The card/preview image. At most one per project. */
  readonly isFeatured: boolean;
}
