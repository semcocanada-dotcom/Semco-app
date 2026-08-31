/**
 * Dealer fee for one prepared quart sample. This includes the quart of
 * X-Bond Liquid drawn from the customer's project order, but excludes pigment.
 */
export const COLOUR_SAMPLE_PREPARATION_FEE_CAD = 30;
export const COMPLIMENTARY_COLOUR_SAMPLE_THRESHOLD_SQFT = 300;
export const COLOUR_SAMPLE_PRICING_POLICY_VERSION = '2026-08-30-v2';
export const COLOUR_SAMPLE_PRICING_EFFECTIVE_DATE = '2026-08-30';
export const COLOUR_SAMPLE_PRICING_SOURCE = 'Modern Arc confirmation dated 2026-08-30';

const AREA_COMPARISON_EPSILON_SQFT = 0.000001;

export function isComplimentaryColourSampleProject(projectAreaSqft: number): boolean {
  if (!Number.isFinite(projectAreaSqft)) return false;
  return projectAreaSqft + AREA_COMPARISON_EPSILON_SQFT
    >= COMPLIMENTARY_COLOUR_SAMPLE_THRESHOLD_SQFT;
}
