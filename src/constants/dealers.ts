export type DealerRegion = 'east' | 'west' | 'unknown';
export type DealerId = 'modern-arc' | 'diamond-arc-west';

export type DealerContext = {
  region: DealerRegion;
  dealerId: DealerId | null;
  dealerName: string;
  orderEmail: string | null;
  pricingSourceLabel: string;
  pricingAvailable: boolean;
  orderRoutingLabel: string;
};

export type DealerProfileInput = {
  companyPostalCode?: string | null;
  companyProvince?: string | null;
  companyAddress?: string | null;
  projectPostalCode?: string | null;
  projectAddress?: string | null;
};

const EAST_PROVINCES = [
  'ON',
  'ONTARIO',
  'QC',
  'QUEBEC',
  'NB',
  'NEW BRUNSWICK',
  'NS',
  'NOVA SCOTIA',
  'PE',
  'PEI',
  'PRINCE EDWARD ISLAND',
  'NL',
  'NEWFOUNDLAND',
  'LABRADOR',
];

const WEST_PROVINCES = [
  'BC',
  'BRITISH COLUMBIA',
  'AB',
  'ALBERTA',
  'SK',
  'SASKATCHEWAN',
  'MB',
  'MANITOBA',
];

const MODERN_ARC_POSTAL_PREFIXES = new Set([
  'A', // Newfoundland and Labrador
  'B', // Nova Scotia
  'C', // Prince Edward Island
  'E', // New Brunswick
  'G', // Quebec East
  'H', // Montreal
  'J', // Quebec West
  'K', // Eastern Ontario
  'L', // Central Ontario
  'M', // Toronto
  'N', // Southwestern Ontario
  'P', // Northern Ontario
]);

const WEST_POSTAL_PREFIXES = new Set([
  'R', // Manitoba
  'S', // Saskatchewan
  'T', // Alberta
  'V', // British Columbia
]);

export const MODERN_ARC_DEALER: DealerContext = {
  region: 'east',
  dealerId: 'modern-arc',
  dealerName: 'Modern Arc',
  orderEmail: 'order@modernarc.ca',
  pricingSourceLabel: 'Modern Arc Ontario retail pricing 2026',
  pricingAvailable: true,
  orderRoutingLabel: 'Orders currently route to Modern Arc at order@modernarc.ca.',
};

export const DIAMOND_ARC_WEST_DEALER: DealerContext = {
  region: 'west',
  dealerId: 'modern-arc',
  dealerName: 'Modern Arc',
  orderEmail: 'order@modernarc.ca',
  pricingSourceLabel: 'Modern Arc Ontario retail pricing 2026',
  pricingAvailable: true,
  orderRoutingLabel: 'Western dealer routing is not active yet. Orders currently default to Modern Arc at order@modernarc.ca.',
};

export const UNASSIGNED_DEALER_CONTEXT: DealerContext = {
  region: 'unknown',
  dealerId: 'modern-arc',
  dealerName: 'Modern Arc',
  orderEmail: 'order@modernarc.ca',
  pricingSourceLabel: 'Modern Arc Ontario retail pricing 2026',
  pricingAvailable: true,
  orderRoutingLabel: 'Company profile is still recommended, but orders currently default to Modern Arc at order@modernarc.ca.',
};

export function resolveDealerContext(input?: string | DealerProfileInput | null): DealerContext {
  const text = typeof input === 'string'
    ? input
    : [
        input?.companyPostalCode,
        input?.companyProvince,
        input?.companyAddress,
        input?.projectPostalCode,
        input?.projectAddress,
      ].filter(Boolean).join(' ');
  const normalized = text.toUpperCase();
  if (!normalized.trim()) return UNASSIGNED_DEALER_CONTEXT;

  const postalPrefix = getCanadianPostalPrefix(normalized);
  if (postalPrefix && MODERN_ARC_POSTAL_PREFIXES.has(postalPrefix)) {
    return MODERN_ARC_DEALER;
  }

  if (postalPrefix && WEST_POSTAL_PREFIXES.has(postalPrefix)) {
    return DIAMOND_ARC_WEST_DEALER;
  }

  if (WEST_PROVINCES.some((term) => containsRegionTerm(normalized, term))) {
    return DIAMOND_ARC_WEST_DEALER;
  }

  if (EAST_PROVINCES.some((term) => containsRegionTerm(normalized, term))) {
    return MODERN_ARC_DEALER;
  }

  return UNASSIGNED_DEALER_CONTEXT;
}

function getCanadianPostalPrefix(value: string): string | null {
  const match = value.match(/\b([ABCEGHJ-NPRSTVXY])\d[ABCEGHJ-NPRSTV-Z][\s-]?\d[ABCEGHJ-NPRSTV-Z]\d\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function containsRegionTerm(value: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^A-Z])${escaped}([^A-Z]|$)`).test(value);
}
