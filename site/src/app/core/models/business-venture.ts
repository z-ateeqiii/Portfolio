/**
 * Business Venture (04 §9). Models "Ateeqi Tech" — never "عتيقتك" (02, 04,
 * 09 §2.1, and an explicit correction logged in 10 §6).
 */

/**
 * Metrics are labeled pairs, not prose. Storing "80+ laptops sold, ~80,000 EGP
 * net" as a sentence would make each number un-editable and un-attributable;
 * as pairs they stay individually verifiable (04 §9).
 */
export interface MetricPair {
  readonly label: string;
  readonly value: string;
}

export interface BusinessVenture {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly metrics: readonly MetricPair[];
}
