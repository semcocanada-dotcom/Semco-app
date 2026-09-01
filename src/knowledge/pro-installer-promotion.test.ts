import {
  buildXBondToolPromotionReviewLines,
  isXBondToolPromotionAreaEligible,
  XBOND_TOOL_PROMOTION,
  XBOND_TOOL_PROMOTION_MINIMUM_SQFT,
} from '@/knowledge/pro-installer-promotion';

describe('SEMCO X-Bond CO.ME tool promotion', () => {
  it('starts area eligibility at exactly 1,000 square feet', () => {
    expect(XBOND_TOOL_PROMOTION_MINIMUM_SQFT).toBe(1_000);
    expect(isXBondToolPromotionAreaEligible(999.9)).toBe(false);
    expect(isXBondToolPromotionAreaEligible(1_000)).toBe(true);
    expect(isXBondToolPromotionAreaEligible(1_250)).toBe(true);
    expect(isXBondToolPromotionAreaEligible(undefined)).toBe(false);
    expect(isXBondToolPromotionAreaEligible(Number.NaN)).toBe(false);
  });

  it('adds no dealer-email promotion note below the threshold', () => {
    expect(buildXBondToolPromotionReviewLines(999)).toEqual([]);
  });

  it('adds the complete promotion-review terms to qualifying dealer emails', () => {
    const body = buildXBondToolPromotionReviewLines(1_000).join('\n');

    expect(body).toContain('eligible for review');
    expect(body).toContain('Calculator project area: 1,000 sq. ft.');
    expect(body).toContain('Free 14-tool CO.ME kit valued at $1,000+.');
    expect(body).toContain(XBOND_TOOL_PROMOTION.qualifyingTerm);
    for (const term of XBOND_TOOL_PROMOTION.terms) expect(body).toContain(term);
    expect(body).toContain('does not guarantee approval');
  });
});
