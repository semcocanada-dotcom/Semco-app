import type { SubstrateId } from '@/constants/substrates';

export type CoverageUnit = 'kit' | 'gal';
export type CoverageCategory = 'microcement' | 'waterproofing' | 'sealer';

export interface CoverageRange {
  label: string;
  minSqftPerUnit: number;
  maxSqftPerUnit: number;
  unit: CoverageUnit;
  coats: number;
  sourceDocument: string;
  sourcePage: number;
  basis: string;
  note?: string;
}

export interface CoverageProduct {
  sku: string;
  name: string;
  category: CoverageCategory;
  packLabel: string;
  ranges: Record<string, CoverageRange>;
  defaultRange: string;
}

export interface CoverageEstimate {
  product: CoverageProduct;
  range: CoverageRange;
  exactUnits: number;
  roundedUnits: number;
  adjustedSqft: number;
  coverageLabel: string;
  quantityLabel: string;
  purchaseLabel: string;
}

export const SQFT_PER_SQM = 10.7639104167;

export const SEALER_OPTIONS = [
  { sku: 'NATURAL-SHIELD', label: 'Natural', productName: 'Natural Shield' },
  { sku: 'SATIN-STONE', label: 'Satin', productName: 'Satin Stone' },
  { sku: 'TITAN-SHIELD', label: 'Gloss', productName: 'Titan Shield Gloss' },
] as const;

const XBOND: CoverageProduct = {
  sku: 'XBOND-MICROCEMENT',
  name: 'SEMCO X-Bond Microcement',
  category: 'microcement',
  packLabel: '2 gal X-Bond Liquid + 1 x 50 lb X-Bond Stone',
  defaultRange: 'concrete',
  ranges: {
    concrete: {
      label: 'Existing concrete',
      minSqftPerUnit: 60,
      maxSqftPerUnit: 75,
      unit: 'kit',
      coats: 1,
      sourceDocument: 'X-BondMicrocementDataSheet2024.pdf',
      sourcePage: 2,
      basis: 'Coverage per 2 gal X-Bond Liquid and 1 x 50 lb X-Bond Stone at 1/8 inch application.',
    },
    painted: {
      label: 'Painted surface',
      minSqftPerUnit: 60,
      maxSqftPerUnit: 75,
      unit: 'kit',
      coats: 1,
      sourceDocument: 'X-BondMicrocementDataSheet2024.pdf',
      sourcePage: 2,
      basis: 'Coverage per 2 gal X-Bond Liquid and 1 x 50 lb X-Bond Stone at 1/8 inch application.',
    },
    tile: {
      label: 'Ceramic tile',
      minSqftPerUnit: 55,
      maxSqftPerUnit: 75,
      unit: 'kit',
      coats: 1,
      sourceDocument: 'X-BondMicrocementDataSheet2024.pdf',
      sourcePage: 2,
      basis: 'Coverage per 2 gal X-Bond Liquid and 1 x 50 lb X-Bond Stone at 1/8 inch application.',
    },
    naturalStone: {
      label: 'Natural stone',
      minSqftPerUnit: 50,
      maxSqftPerUnit: 100,
      unit: 'kit',
      coats: 1,
      sourceDocument: 'X-BondMicrocementDataSheet2024.pdf',
      sourcePage: 2,
      basis: 'Coverage per 2 gal X-Bond Liquid and 1 x 50 lb X-Bond Stone at 1/8 inch application.',
    },
  },
};

const LIQUID_MEMBRANE: CoverageProduct = {
  sku: 'SEMCO-LIQUID-MEMBRANE',
  name: 'SEMCO Liquid Membrane',
  category: 'waterproofing',
  packLabel: '1 gal, 5 gal, and 55 gal pails',
  defaultRange: 'openPore',
  ranges: {
    openPore: {
      label: 'Open pore substrates',
      minSqftPerUnit: 100,
      maxSqftPerUnit: 200,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'LM-Tech-Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / gallon at 2 coats.',
    },
    closedPore: {
      label: 'Closed pore substrates',
      minSqftPerUnit: 140,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'LM-Tech-Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / gallon at 2 coats.',
    },
    xbondScratch: {
      label: 'X-Bond scratch coat',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 300,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'LM-Tech-Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / gallon at 2 coats.',
    },
  },
};

const NATURAL_SHIELD: CoverageProduct = {
  sku: 'NATURAL-SHIELD',
  name: 'SEMCO Natural Shield',
  category: 'sealer',
  packLabel: '1 gal, 5 gal, and 55 gal pails',
  defaultRange: 'polishedConcrete',
  ranges: {
    artificialStone: {
      label: 'Artificial stone',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 3,
      sourceDocument: 'Natural-Shield-Tech-Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1 gal at 3 coats.',
    },
    polishedConcrete: {
      label: 'Polished concrete',
      minSqftPerUnit: 150,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 3,
      sourceDocument: 'Natural-Shield-Tech-Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1 gal at 3 coats.',
      note: 'Used as the default Natural Shield row for X-Bond system estimating.',
    },
    stampedConcrete: {
      label: 'Stamped Concrete',
      minSqftPerUnit: 300,
      maxSqftPerUnit: 350,
      unit: 'gal',
      coats: 3,
      sourceDocument: 'Natural-Shield-Tech-Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1 gal at 3 coats.',
    },
  },
};

const SATIN_STONE: CoverageProduct = {
  sku: 'SATIN-STONE',
  name: 'SEMCO Satin Stone',
  category: 'sealer',
  packLabel: '1.5 gal kit: Part A 1 gal + Part B 0.5 gal',
  defaultRange: 'concrete',
  ranges: {
    concrete: {
      label: 'Concrete',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'kit',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1.5 gal kit at minimum 2 coats and 20 mil total thickness.',
    },
    polishedConcrete: {
      label: 'Polished concrete',
      minSqftPerUnit: 250,
      maxSqftPerUnit: 300,
      unit: 'kit',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1.5 gal kit at minimum 2 coats and 20 mil total thickness.',
    },
    artificialStone: {
      label: 'Artificial stone',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'kit',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1.5 gal kit at minimum 2 coats and 20 mil total thickness.',
    },
    stampedConcrete: {
      label: 'Stamped Concrete',
      minSqftPerUnit: 150,
      maxSqftPerUnit: 250,
      unit: 'kit',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1.5 gal kit at minimum 2 coats and 20 mil total thickness.',
    },
    semcoAda: {
      label: 'SEMCO ADA',
      minSqftPerUnit: 150,
      maxSqftPerUnit: 250,
      unit: 'kit',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1.5 gal kit at minimum 2 coats and 20 mil total thickness.',
    },
  },
};

const TITAN_SHIELD: CoverageProduct = {
  sku: 'TITAN-SHIELD',
  name: 'SEMCO Titan Shield Gloss',
  category: 'sealer',
  packLabel: '1 gal and 5 gal pails',
  defaultRange: 'xbond',
  ranges: {
    polishedConcrete: {
      label: 'Polished concrete',
      minSqftPerUnit: 150,
      maxSqftPerUnit: 200,
      unit: 'gal',
      coats: 3,
      sourceDocument: 'Tech_Sheet_TitanShield-v8.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1 gal at minimum 3 coats and 6-8 mil total thickness.',
    },
    artificialStone: {
      label: 'Artificial Stone',
      minSqftPerUnit: 150,
      maxSqftPerUnit: 200,
      unit: 'gal',
      coats: 3,
      sourceDocument: 'Tech_Sheet_TitanShield-v8.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1 gal at minimum 3 coats and 6-8 mil total thickness.',
    },
    stampedConcrete: {
      label: 'Stamped Concrete',
      minSqftPerUnit: 250,
      maxSqftPerUnit: 300,
      unit: 'gal',
      coats: 3,
      sourceDocument: 'Tech_Sheet_TitanShield-v8.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1 gal at minimum 3 coats and 6-8 mil total thickness.',
    },
    xbond: {
      label: 'X-Bond',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 3,
      sourceDocument: 'Tech_Sheet_TitanShield-v8.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / 1 gal at minimum 3 coats and 6-8 mil total thickness.',
    },
  },
};

export const COVERAGE_PRODUCTS = {
  XBOND,
  LIQUID_MEMBRANE,
  NATURAL_SHIELD,
  SATIN_STONE,
  TITAN_SHIELD,
};

export function getXBondRange(substrate: SubstrateId): CoverageRange {
  if (substrate === 'existing_tile') return XBOND.ranges.tile;
  if (substrate === 'existing_paint' || substrate === 'gypsum_board') return XBOND.ranges.painted;
  return XBOND.ranges.concrete;
}

export function getLiquidMembraneRange(substrate: SubstrateId): CoverageRange {
  if (substrate === 'existing_tile' || substrate === 'existing_paint') return LIQUID_MEMBRANE.ranges.closedPore;
  return LIQUID_MEMBRANE.ranges.openPore;
}

export function getSealerProduct(sku?: string): CoverageProduct {
  if (sku === NATURAL_SHIELD.sku) return NATURAL_SHIELD;
  if (sku === TITAN_SHIELD.sku) return TITAN_SHIELD;
  return SATIN_STONE;
}

export function getSealerRange(product: CoverageProduct): CoverageRange {
  return product.ranges[product.defaultRange];
}

export function estimateCoverage(product: CoverageProduct, range: CoverageRange, areaSqm: number, wastePct: number): CoverageEstimate {
  const adjustedSqft = areaSqm * SQFT_PER_SQM * (1 + wastePct / 100);
  const avgCoverage = (range.minSqftPerUnit + range.maxSqftPerUnit) / 2;
  const exactUnits = adjustedSqft / avgCoverage;
  const roundedUnits = Math.max(1, Math.ceil(exactUnits));
  const unitLabel = range.unit === 'kit' ? 'kit' : 'gal';
  const plural = roundedUnits === 1 ? unitLabel : `${unitLabel}s`;
  const quantityLabel = `${formatQuantity(range.unit === 'kit' ? roundedUnits : exactUnits)} ${range.unit === 'kit' ? plural : unitLabel}`;
  const purchaseLabel =
    range.unit === 'kit'
      ? `${roundedUnits} ${plural} to stage`
      : `Round up to ${roundedUnits} ${roundedUnits === 1 ? 'gal' : 'gals'} for ordering`;

  return {
    product,
    range,
    exactUnits,
    roundedUnits,
    adjustedSqft,
    coverageLabel: `${range.label}: ${range.minSqftPerUnit}-${range.maxSqftPerUnit} sq ft/${unitLabel}`,
    quantityLabel,
    purchaseLabel,
  };
}

function formatQuantity(value: number): string {
  if (value >= 10 || Number.isInteger(value)) return String(Math.ceil(value));
  return value.toFixed(1);
}
