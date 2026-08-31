import {
  COLOUR_SAMPLE_COMPLIMENTARY_THRESHOLD_SQFT,
  COLOUR_SAMPLE_FLAT_RATE_CAD,
  COLOUR_SAMPLE_PRICING_EFFECTIVE_DATE,
  COLOUR_SAMPLE_PRICING_POLICY_VERSION,
  COLOUR_SAMPLE_PRICING_SOURCE,
  isColourSampleComplimentaryProject,
} from '@/knowledge/sample-pricing';

describe('colour sample pricing policy', () => {
  it('records the confirmed fee, threshold, source, and effective date', () => {
    expect(COLOUR_SAMPLE_FLAT_RATE_CAD).toBe(40);
    expect(COLOUR_SAMPLE_COMPLIMENTARY_THRESHOLD_SQFT).toBe(500);
    expect(COLOUR_SAMPLE_PRICING_POLICY_VERSION).toBe('2026-08-30-v3');
    expect(COLOUR_SAMPLE_PRICING_EFFECTIVE_DATE).toBe('2026-08-30');
    expect(COLOUR_SAMPLE_PRICING_SOURCE).toBe('SEMCO Canada pricing decision dated 2026-08-30');
  });

  it.each([
    [499.99, false],
    [499.995, false],
    [499.999999, true],
    [500, true],
    [500.01, true],
    [Number.NaN, false],
    [Number.POSITIVE_INFINITY, false],
  ])('evaluates %s sq ft as sample-complimentary=%s', (areaSqft, expected) => {
    expect(isColourSampleComplimentaryProject(areaSqft)).toBe(expected);
  });
});
