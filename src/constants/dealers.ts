export type DealerRegion = 'east' | 'west' | 'unknown';
export type DealerId = 'modern-arc' | 'innovative-finishes-west';
export type CanadianProvinceCode =
  | 'BC'
  | 'AB'
  | 'SK'
  | 'MB'
  | 'ON'
  | 'QC'
  | 'NB'
  | 'NS'
  | 'PE'
  | 'NL'
  | 'YT'
  | 'NT'
  | 'NU';

export type DealerContext = {
  region: DealerRegion;
  dealerId: DealerId | null;
  dealerName: string;
  orderEmail: string | null;
  priceCatalogId: typeof SHARED_CANADIAN_PRICE_CATALOG_ID;
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

type ProvinceDefinition = {
  dealerId: DealerId;
  aliases: readonly string[];
};

export const SHARED_CANADIAN_PRICE_CATALOG_ID = 'semco-canada-retail-2026' as const;
export const SHARED_CANADIAN_PRICING_LABEL = 'Semco Canada retail pricing 2026 - same prices nationwide';

/**
 * Manitoba and every province/territory west of it use Innovative Finishes.
 * Ontario and every province/territory east of it use Modern Arc. The two
 * northern territories are assigned explicitly: NT west and NU east.
 */
export const CANADIAN_DEALER_BY_PROVINCE: Readonly<Record<CanadianProvinceCode, DealerId>> = {
  BC: 'innovative-finishes-west',
  AB: 'innovative-finishes-west',
  SK: 'innovative-finishes-west',
  MB: 'innovative-finishes-west',
  YT: 'innovative-finishes-west',
  NT: 'innovative-finishes-west',
  ON: 'modern-arc',
  QC: 'modern-arc',
  NB: 'modern-arc',
  NS: 'modern-arc',
  PE: 'modern-arc',
  NL: 'modern-arc',
  NU: 'modern-arc',
};

const CANADIAN_PROVINCES: Readonly<Record<CanadianProvinceCode, ProvinceDefinition>> = {
  BC: { dealerId: CANADIAN_DEALER_BY_PROVINCE.BC, aliases: ['BC', 'B.C.', 'British Columbia'] },
  AB: { dealerId: CANADIAN_DEALER_BY_PROVINCE.AB, aliases: ['AB', 'Alta', 'Alberta'] },
  SK: { dealerId: CANADIAN_DEALER_BY_PROVINCE.SK, aliases: ['SK', 'Sask', 'Saskatchewan'] },
  MB: { dealerId: CANADIAN_DEALER_BY_PROVINCE.MB, aliases: ['MB', 'Man', 'Manitoba'] },
  ON: { dealerId: CANADIAN_DEALER_BY_PROVINCE.ON, aliases: ['ON', 'Ont', 'Ontario'] },
  QC: { dealerId: CANADIAN_DEALER_BY_PROVINCE.QC, aliases: ['QC', 'PQ', 'Quebec', 'Québec'] },
  NB: { dealerId: CANADIAN_DEALER_BY_PROVINCE.NB, aliases: ['NB', 'N.B.', 'New Brunswick', 'Nouveau-Brunswick'] },
  NS: { dealerId: CANADIAN_DEALER_BY_PROVINCE.NS, aliases: ['NS', 'N.S.', 'Nova Scotia', 'Nouvelle-Écosse'] },
  PE: { dealerId: CANADIAN_DEALER_BY_PROVINCE.PE, aliases: ['PE', 'PEI', 'P.E.I.', 'Prince Edward Island', 'Île-du-Prince-Édouard'] },
  NL: { dealerId: CANADIAN_DEALER_BY_PROVINCE.NL, aliases: ['NL', 'N.L.', 'NFLD', 'Newfoundland', 'Labrador', 'Newfoundland and Labrador'] },
  YT: { dealerId: CANADIAN_DEALER_BY_PROVINCE.YT, aliases: ['YT', 'Y.T.', 'Yukon'] },
  NT: { dealerId: CANADIAN_DEALER_BY_PROVINCE.NT, aliases: ['NT', 'N.T.', 'NWT', 'N.W.T.', 'Northwest Territories'] },
  NU: { dealerId: CANADIAN_DEALER_BY_PROVINCE.NU, aliases: ['NU', 'Nunavut'] },
};

const PROVINCE_ALIAS_LOOKUP = new Map<string, CanadianProvinceCode>();
const PROVINCE_ALIAS_ENTRIES: { alias: string; provinceCode: CanadianProvinceCode }[] = [];

(Object.entries(CANADIAN_PROVINCES) as [CanadianProvinceCode, ProvinceDefinition][]).forEach(([provinceCode, definition]) => {
  definition.aliases.forEach((alias) => {
    const normalizedAlias = normalizeLocationText(alias);
    PROVINCE_ALIAS_LOOKUP.set(normalizedAlias, provinceCode);
    PROVINCE_ALIAS_ENTRIES.push({ alias: normalizedAlias, provinceCode });
  });
});

// Prefer full province names over abbreviations when scanning a full address.
PROVINCE_ALIAS_ENTRIES.sort((left, right) => right.alias.length - left.alias.length);

const PROVINCE_BY_POSTAL_PREFIX: Readonly<Record<string, CanadianProvinceCode>> = {
  A: 'NL',
  B: 'NS',
  C: 'PE',
  E: 'NB',
  G: 'QC',
  H: 'QC',
  J: 'QC',
  K: 'ON',
  L: 'ON',
  M: 'ON',
  N: 'ON',
  P: 'ON',
  R: 'MB',
  S: 'SK',
  T: 'AB',
  V: 'BC',
  Y: 'YT',
};

const NUNAVUT_POSTAL_FSAS = new Set(['X0A', 'X0B', 'X0C']);
const NORTHWEST_TERRITORIES_POSTAL_FSAS = new Set(['X0E', 'X0G', 'X1A']);

export const MODERN_ARC_DEALER: DealerContext = {
  region: 'east',
  dealerId: 'modern-arc',
  dealerName: 'Modern Arc',
  orderEmail: 'order@modernarc.ca',
  priceCatalogId: SHARED_CANADIAN_PRICE_CATALOG_ID,
  pricingSourceLabel: SHARED_CANADIAN_PRICING_LABEL,
  pricingAvailable: true,
  orderRoutingLabel: 'Ontario and eastern orders are supplied by Modern Arc at order@modernarc.ca.',
};

export const INNOVATIVE_FINISHES_WEST_DEALER: DealerContext = {
  region: 'west',
  dealerId: 'innovative-finishes-west',
  dealerName: 'Innovative Finishes',
  orderEmail: 'info@semcocanada.ca',
  priceCatalogId: SHARED_CANADIAN_PRICE_CATALOG_ID,
  pricingSourceLabel: SHARED_CANADIAN_PRICING_LABEL,
  pricingAvailable: true,
  orderRoutingLabel: 'Manitoba and western orders are supplied by Innovative Finishes at info@semcocanada.ca.',
};

export const UNASSIGNED_DEALER_CONTEXT: DealerContext = {
  region: 'unknown',
  dealerId: null,
  dealerName: 'Semco Canada',
  orderEmail: 'info@semcocanada.ca',
  priceCatalogId: SHARED_CANADIAN_PRICE_CATALOG_ID,
  pricingSourceLabel: SHARED_CANADIAN_PRICING_LABEL,
  pricingAvailable: true,
  orderRoutingLabel: 'Add the company postal code or province for automatic supplier routing. Unassigned requests go to info@semcocanada.ca.',
};

export function resolveDealerContext(input?: string | DealerProfileInput | null): DealerContext {
  const provinceCode = typeof input === 'string'
    ? resolveLocationGroup([input], [input])
    : resolveLocationGroup(
        [input?.companyPostalCode, input?.companyAddress],
        [input?.companyProvince, input?.companyAddress],
      ) ?? resolveLocationGroup(
        [input?.projectPostalCode, input?.projectAddress],
        [input?.projectAddress],
      );

  if (!provinceCode) return UNASSIGNED_DEALER_CONTEXT;
  return CANADIAN_PROVINCES[provinceCode].dealerId === 'modern-arc'
    ? MODERN_ARC_DEALER
    : INNOVATIVE_FINISHES_WEST_DEALER;
}

/** Returns the canonical two-letter code for a province name, abbreviation, or address. */
export function normalizeCanadianProvince(value?: string | null): CanadianProvinceCode | null {
  const normalized = normalizeLocationText(value);
  if (!normalized) return null;

  const exact = PROVINCE_ALIAS_LOOKUP.get(normalized);
  if (exact) return exact;

  const padded = ` ${normalized} `;
  return PROVINCE_ALIAS_ENTRIES.find(({ alias }) => padded.includes(` ${alias} `))?.provinceCode ?? null;
}

/** Resolves all Canadian postal regions, including Nunavut vs. Northwest Territories. */
export function resolveCanadianProvinceFromPostalCode(value?: string | null): CanadianProvinceCode | null {
  if (!value) return null;
  const match = value.toUpperCase().match(
    /(?:^|[^A-Z0-9])([ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z])[\s-]?(\d[ABCEGHJ-NPRSTV-Z]\d)(?=$|[^A-Z0-9])/,
  );
  const fsa = match?.[1];
  if (!fsa) return null;

  if (NUNAVUT_POSTAL_FSAS.has(fsa)) return 'NU';
  if (NORTHWEST_TERRITORIES_POSTAL_FSAS.has(fsa)) return 'NT';
  return PROVINCE_BY_POSTAL_PREFIX[fsa[0]] ?? null;
}

function resolveLocationGroup(
  postalValues: (string | null | undefined)[],
  provinceValues: (string | null | undefined)[],
): CanadianProvinceCode | null {
  for (const value of postalValues) {
    const postalProvince = resolveCanadianProvinceFromPostalCode(value);
    if (postalProvince) return postalProvince;
  }

  for (const value of provinceValues) {
    const normalizedProvince = normalizeCanadianProvince(value);
    if (normalizedProvince) return normalizedProvince;
  }

  return null;
}

function normalizeLocationText(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}
