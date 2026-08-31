/**
 * Customer price for one prepared quart sample. This includes X-Bond Liquid
 * from dealer sample stock and all pigment required by the verified formula.
 */
export const COLOUR_SAMPLE_FLAT_RATE_CAD = 40;
export const COLOUR_SAMPLE_COMPLIMENTARY_THRESHOLD_SQFT = 500;
export const COLOUR_SAMPLE_PRICING_POLICY_VERSION = '2026-08-30-v3';
export const COLOUR_SAMPLE_PRICING_EFFECTIVE_DATE = '2026-08-30';
export const COLOUR_SAMPLE_PRICING_SOURCE = 'SEMCO Canada pricing decision dated 2026-08-30';

const AREA_COMPARISON_EPSILON_SQFT = 0.000001;

export function isColourSampleComplimentaryProject(projectAreaSqft: number): boolean {
  if (!Number.isFinite(projectAreaSqft)) return false;
  return projectAreaSqft + AREA_COMPARISON_EPSILON_SQFT
    >= COLOUR_SAMPLE_COMPLIMENTARY_THRESHOLD_SQFT;
}
