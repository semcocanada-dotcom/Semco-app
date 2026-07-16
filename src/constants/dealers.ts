export type DealerRegion = 'east' | 'west' | 'unknown';
export type DealerId = 'modern-arc' | 'innovative-finishes-west';

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
  'YT',
  'YUKON',
  'NT',
  'NORTHWEST TERRITORIES',
  'NU',
  'NUNAVUT',
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
  'X', // Northwest Territories and Nunavut
  'Y', // Yukon
]);

export const MODERN_ARC_DEALER: DealerContext = {
  region: 'east',
  dealerId: 'modern-arc',
  dealerName: 'Modern Arc',
  orderEmail: 'order@modernarc.ca',
  pricingSourceLabel: 'Modern Arc Ontario retail pricing 2026',
  pricingAvailable: true,
  orderRoutingLabel: 'Ontario and eastern orders route to Modern Arc at order@modernarc.ca.',
};

export const INNOVATIVE_FINISHES_WEST_DEALER: DealerContext = {
  region: 'west',
  dealerId: 'innovative-finishes-west',
  dealerName: 'Innovative Finishes',
  orderEmail: 'info@semcocanada.ca',
  pricingSourceLabel: 'Modern Arc Ontario retail pricing 2026',
  pricingAvailable: true,
  orderRoutingLabel: 'Manitoba and western orders route to Innovative Finishes at info@semcocanada.ca.',
};

export const UNASSIGNED_DEALER_CONTEXT: DealerContext = {
  region: 'unknown',
  dealerId: null,
  dealerName: 'Semco Canada',
  orderEmail: 'info@semcocanada.ca',
  pricingSourceLabel: 'Modern Arc Ontario retail pricing 2026',
  pricingAvailable: true,
  orderRoutingLabel: 'Add the company postal code for automatic dealer routing. Unassigned requests go to info@semcocanada.ca.',
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
    return INNOVATIVE_FINISHES_WEST_DEALER;
  }

  if (WEST_PROVINCES.some((term) => containsRegionTerm(normalized, term))) {
    return INNOVATIVE_FINISHES_WEST_DEALER;
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
