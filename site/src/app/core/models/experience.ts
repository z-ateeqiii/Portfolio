import { Editable } from './content-status';

/**
 * Experience (04 §4). One record per role/engagement.
 *
 * `summary` is deliberately prose, not a bullet list — the CV carries the
 * bullet form (brief §11); this is what was actually done.
 *
 * `timeframe` is free text, like Project's, so an ongoing role can say
 * "Apr 2026 – Present" rather than being forced into an end date it does not
 * have. An ongoing role must never render as past or resigned.
 */
export interface Experience extends Editable {
  readonly id: string;
  readonly organization: string;
  readonly role: string;
  readonly timeframe: string;

  /**
   * Display order (added 2026-08-30 — a third 04 §4 schema change, flagged).
   *
   * 02 §7 asks for roles in reverse-chronological order, but `timeframe` is
   * deliberately free text ("Apr 2026 – Present", "Sep 2023 – Dec 2023"), so
   * nothing can sort it reliably — parsing dates out of prose is exactly the
   * kind of guessing that breaks the first time a format varies. Firestore also
   * returns documents in no guaranteed order without an explicit `orderBy`.
   *
   * So the intended order is stored, the same way Project stores `order` for
   * the same reason (04 §3). Lower sorts first.
   */
  readonly order: number;
  /** e.g. "Part-time", "Apprenticeship · On-site, Cairo". Optional. */
  readonly engagement?: string;
  readonly summary: string;

  /**
   * Technologies used in this role (added 2026-08-30, a 04 §4 schema change).
   *
   * 04 §4 modelled Experience without any tech field. Added deliberately rather
   * than silently (09 §2.3): the roles genuinely name their stack, and pulling
   * those names out of the prose makes them consistent with how Project renders
   * `stack` — same monospace tags, same meaning.
   *
   * Only tech the source actually names goes here. A role whose source names no
   * concrete stack gets an empty list rather than an inferred one.
   */
  readonly tech?: readonly string[];

  /**
   * The "What I Did" bullet list, shown when a role expands (04 §4, added
   * 2026-09-19).
   *
   * Deliberately separate from `summary` rather than replacing it. They answer
   * different questions and the accordion shows them at different moments:
   * `summary` is the prose a visitor reads while scanning, visible on every
   * collapsed row; this is the CV-style detail they opened the row to get.
   * Collapsing the two into one field would force a choice between a scannable
   * page and a complete one.
   *
   * Sourced verbatim from Muhammed's CV, never paraphrased — these are claims
   * about what he actually did, so rewording them for rhythm would be
   * inventing content (brief §22, 09 §3).
   *
   * Optional: a role with no bullets simply has no expandable section, the
   * same way a role with no `tech` renders no tags.
   */
  readonly highlights?: readonly string[];

  /**
   * Projects this role produced (added 2026-08-30, a 04 §4 schema change).
   *
   * 04 §4 had a singular `linkedProjectSlug` and used "Smart Technology → ST
   * Employees Portal" as its example. That role produced TWO of the seeded
   * projects, so a single link would have to drop one — losing a real fact to
   * fit the schema. Widened to an array; a role with one project simply has a
   * one-element list.
   */
  readonly linkedProjectSlugs?: readonly string[];
}
