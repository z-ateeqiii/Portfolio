import { Editable } from './content-status';

/**
 * Experience (04 §4). One record per role/engagement.
 *
 * `summary` is deliberately prose, not a bullet list — the CV carries the
 * bullet form (brief §11); this is what was actually done.
 */
export interface Experience extends Editable {
  readonly id: string;
  readonly organization: string;
  readonly role: string;
  readonly timeframe: string;
  readonly summary: string;
  /** Links to a Project where the work produced one, e.g. Smart Technology →
   *  ST Employees Portal (04 §4). */
  readonly linkedProjectSlug?: string;
}
