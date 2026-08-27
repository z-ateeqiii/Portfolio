/**
 * Draft / Publish state (04 §12).
 *
 * Every editable entity carries this so the Draft → Preview → Publish workflow
 * (05) has something to hang off. The public site NEVER reads a `draft`
 * document: that exclusion happens in the Firestore query itself, not in a
 * template `@if` (06 §3.1, 09 §3). A UI-level filter would still ship the
 * content to the browser, which is precisely what 05 §6 forbids.
 */
export type ContentStatus = 'draft' | 'published';

/**
 * Timestamps are plain `Date` here, not Firestore `Timestamp`.
 *
 * Domain models stay free of any Firebase import so that components, tests and
 * the future SSR/SEO layer can use them without dragging the SDK in. Conversion
 * happens once, in the data layer's converters.
 */
export interface Timestamped {
  readonly updatedAt: Date;
  /** Absent until the record has been published at least once. */
  readonly publishedAt?: Date;
}

/** Fields shared by every editable entity (04 §12). */
export interface Editable extends Timestamped {
  readonly status: ContentStatus;
}

/**
 * An entity as the public site sees it. Modelled separately from `Editable`
 * because a document that reached a public component is, by construction,
 * already published — carrying a `status` field past that boundary invites
 * exactly the kind of "check it again in the template" logic that 05 §6 is
 * trying to make impossible.
 */
export interface Published extends Timestamped {
  readonly publishedAt: Date;
}
