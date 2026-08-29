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
