import {
  COLOUR_SAMPLE_PREPARATION_FEE_CAD,
  COLOUR_SAMPLE_PRICING_EFFECTIVE_DATE,
  COLOUR_SAMPLE_PRICING_POLICY_VERSION,
  COLOUR_SAMPLE_PRICING_SOURCE,
  COMPLIMENTARY_COLOUR_SAMPLE_THRESHOLD_SQFT,
  isComplimentaryColourSampleProject,
} from '@/knowledge/sample-pricing';

describe('colour sample pricing policy', () => {
  it('records the confirmed fee, threshold, source, and effective date', () => {
    expect(COLOUR_SAMPLE_PREPARATION_FEE_CAD).toBe(30);
    expect(COMPLIMENTARY_COLOUR_SAMPLE_THRESHOLD_SQFT).toBe(300);
    expect(COLOUR_SAMPLE_PRICING_POLICY_VERSION).toBe('2026-08-30-v2');
    expect(COLOUR_SAMPLE_PRICING_EFFECTIVE_DATE).toBe('2026-08-30');
    expect(COLOUR_SAMPLE_PRICING_SOURCE).toBe('Modern Arc confirmation dated 2026-08-30');
  });

  it.each([
    [299.99, false],
    [299.995, false],
    [299.999999, true],
    [300, true],
    [300.01, true],
    [Number.NaN, false],
    [Number.POSITIVE_INFINITY, false],
  ])('evaluates %s sq ft as complimentary=%s', (areaSqft, expected) => {
    expect(isComplimentaryColourSampleProject(areaSqft)).toBe(expected);
  });
});
