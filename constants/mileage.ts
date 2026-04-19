// ─── Mileage rate constants ───────────────────────────────────────────────────
// Update these values here when the government changes the rates.

export const SOUTHERN_RATE_PER_KM = 0.6410; // $/km — addresses south of 54th parallel
export const NORTHERN_RATE_PER_KM = 0.6910; // $/km — addresses north of 54th parallel
export const PARALLEL_54_LATITUDE  = 54.0;   // degrees N latitude

/** Returns the per-km rate based on the provider's geocoded latitude. */
export function getRateForLatitude(providerLatitude: number): number {
  return providerLatitude >= PARALLEL_54_LATITUDE
    ? NORTHERN_RATE_PER_KM
    : SOUTHERN_RATE_PER_KM;
}
