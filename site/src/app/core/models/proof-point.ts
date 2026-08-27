/**
 * Proof Point (04 §11) — the curated numbers on Home's Proof Strip (02 §4.2).
 *
 * Deliberately separate from where the numbers live substantively
 * (SocialPlatform, BusinessVenture) so Home can show a short curated subset
 * without duplicating data entry.
 *
 * `value` is a string, not a number, because these are display figures with
 * honest qualifiers baked in — "80+", "~986K", "nearing 1M". Typing it as a
 * number would force those qualifiers out and turn a careful claim into an
 * overstated one (03 §8).
 */
export interface ProofPoint {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  /** Which underlying record this traces back to, so it can be re-verified
   *  rather than going stale silently (04 §11). */
  readonly sourceRef?: string;
}
