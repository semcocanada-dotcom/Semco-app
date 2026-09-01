export const XBOND_TOOL_PROMOTION_MINIMUM_SQFT = 1_000;

export const XBOND_TOOL_PROMOTION = {
  eyebrow: 'PRO INSTALLER PROMOTION',
  title: 'Free 14-tool CO.ME kit',
  value: 'Valued at $1,000+',
  qualifyingTerm: 'Qualifying complete SEMCO X-Bond system order of 1,000 sq. ft. or more.',
  terms: [
    'Full payment required.',
    'One kit per approved order.',
    'Subject to availability and written promotion terms.',
    'No cash value.',
  ],
} as const;

export function isXBondToolPromotionAreaEligible(areaSqft?: number | null): boolean {
  return Number.isFinite(areaSqft) && (areaSqft ?? 0) >= XBOND_TOOL_PROMOTION_MINIMUM_SQFT;
}

export function buildXBondToolPromotionReviewLines(areaSqft?: number | null): string[] {
  if (!isXBondToolPromotionAreaEligible(areaSqft)) return [];

  return [
    'CO.ME pro installer promotion — eligible for review:',
    `- Calculator project area: ${formatArea(areaSqft as number)} sq. ft.`,
    `- ${XBOND_TOOL_PROMOTION.qualifyingTerm}`,
    `- ${XBOND_TOOL_PROMOTION.title} ${XBOND_TOOL_PROMOTION.value.toLowerCase()}.`,
    `- ${XBOND_TOOL_PROMOTION.terms.join(' ')}`,
    '- Please review and confirm promotion eligibility. Calculator area alone does not guarantee approval.',
  ];
}

function formatArea(areaSqft: number): string {
  return areaSqft.toLocaleString('en-CA', {
    minimumFractionDigits: Number.isInteger(areaSqft) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}
