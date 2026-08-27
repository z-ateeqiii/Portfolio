/**
 * Education / Certification (04 §10).
 *
 * `date` is free text, matching how these are actually recorded on the
 * certificates themselves. Some entries need a sanity check before going live
 * (10 §2 flags a 2026-dated Coursera certificate) — `visible` is what makes
 * that check possible without deleting the record.
 */
export type EducationType = 'degree' | 'certification' | 'workshop';

export interface Education {
  readonly id: string;
  readonly type: EducationType;
  readonly title: string;
  readonly issuer: string;
  readonly date: string;
  /** Not everything collected has to be shown (brief §9, 04 §10). */
  readonly visible: boolean;
}
