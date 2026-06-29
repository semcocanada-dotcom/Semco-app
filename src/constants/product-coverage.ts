import type { SubstrateId } from '@/constants/substrates';
import {
  CURRENT_POOL_SEALER_SKU,
  STOCKED_SEALER_POLICY_PAGE,
  STOCKED_SEALER_POLICY_SOURCE,
  STOCKED_SEALERS,
} from '@/constants/stocked-sealers';

export type CoverageUnit = 'bag' | 'kit' | 'gal' | 'qt' | 'pail';
export type CoverageCategory = 'prep' | 'microcement' | 'x_bond_liquid' | 'microbond_finish' | 'waterproofing' | 'sealer';
export type WaterproofingMode = 'none' | 'above_grade' | 'submerged';
export type XBondFinishSku = 'XBOND-STANDARD' | 'MICROBOND-SMOOTH';

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
  purchaseUnitLabel?: string;
  purchaseUnitSize?: number;
  purchaseSizes?: number[];
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

export const SEALER_OPTIONS = STOCKED_SEALERS;

export const WATERPROOFING_OPTIONS = [
  { mode: 'none', label: 'No membrane', description: 'Skip membrane for dry areas where it is not specified.' },
  { mode: 'above_grade', label: 'Add membrane', description: 'Adds Liquid Membrane. Pool substrate uses the wet-area rate automatically.' },
] as const satisfies readonly { mode: WaterproofingMode; label: string; description: string }[];

export const XBOND_FINISH_OPTIONS = [
  { sku: 'XBOND-STANDARD', label: 'X-Bond finish', description: 'Standard X-Bond Stone finish.' },
  { sku: 'MICROBOND-SMOOTH', label: 'MicroBond smooth', description: 'Adds optional MicroBond smooth finish coat.' },
] as const satisfies readonly { sku: XBondFinishSku; label: string; description: string }[];

const XBOND: CoverageProduct = {
  sku: 'XBOND-STONE',
  name: 'SEMCO X-Bond Stone',
  category: 'microcement',
  packLabel: '50 lb bag',
  defaultRange: 'concrete',
  ranges: {
    concrete: {
      label: 'X-Bond Stone at 1/8 inch',
      minSqftPerUnit: 75,
      maxSqftPerUnit: 75,
      unit: 'bag',
      coats: 1,
      sourceDocument: 'X-BondMicrocementDataSheet2024.pdf',
      sourcePage: 2,
      basis: 'Field rate: at least 75 sq ft finished per 50 lb bag. Data sheet coverage is per 2 gal X-Bond Liquid + 1 x 50 lb X-Bond Stone at 1/8 inch.',
    },
    painted: {
      label: 'X-Bond Stone at 1/8 inch',
      minSqftPerUnit: 75,
      maxSqftPerUnit: 75,
      unit: 'bag',
      coats: 1,
      sourceDocument: 'X-BondMicrocementDataSheet2024.pdf',
      sourcePage: 2,
      basis: 'Field rate: at least 75 sq ft finished per 50 lb bag. Data sheet coverage is per 2 gal X-Bond Liquid + 1 x 50 lb X-Bond Stone at 1/8 inch.',
    },
    tile: {
      label: 'X-Bond Stone at 1/8 inch',
      minSqftPerUnit: 75,
      maxSqftPerUnit: 75,
      unit: 'bag',
      coats: 1,
      sourceDocument: 'X-BondMicrocementDataSheet2024.pdf',
      sourcePage: 2,
      basis: 'Field rate: at least 75 sq ft finished per 50 lb bag. Data sheet coverage is per 2 gal X-Bond Liquid + 1 x 50 lb X-Bond Stone at 1/8 inch.',
    },
    naturalStone: {
      label: 'X-Bond Stone at 1/8 inch',
      minSqftPerUnit: 75,
      maxSqftPerUnit: 75,
      unit: 'bag',
      coats: 1,
      sourceDocument: 'X-BondMicrocementDataSheet2024.pdf',
      sourcePage: 2,
      basis: 'Field rate: at least 75 sq ft finished per 50 lb bag. Data sheet coverage is per 2 gal X-Bond Liquid + 1 x 50 lb X-Bond Stone at 1/8 inch.',
    },
  },
};

const XBOND_LIQUID: CoverageProduct = {
  sku: 'XBOND-LIQUID',
  name: 'SEMCO X-Bond Liquid',
  category: 'x_bond_liquid',
  packLabel: '1 gal and 5 gal pails',
  purchaseSizes: [1, 5],
  defaultRange: 'stoneMix',
  ranges: {
    stoneMix: {
      label: 'Liquid for X-Bond Stone mix',
      minSqftPerUnit: 37.5,
      maxSqftPerUnit: 37.5,
      unit: 'gal',
      coats: 1,
      sourceDocument: 'X-BondMicrocementDataSheet2024.pdf',
      sourcePage: 2,
      basis: '2 gal X-Bond Liquid is mixed with 1 x 50 lb X-Bond Stone bag for up to 75 sq ft at 1/8 inch.',
    },
    microbondMix: {
      label: 'Liquid for MicroBond finish mix',
      minSqftPerUnit: 400,
      maxSqftPerUnit: 400,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'Open SIP manual - master copy v2019-3 2.pdf',
      sourcePage: 33,
      basis: 'MicroBond mix ratio is 1 part X-Bond Liquid to 2 parts MicroBond Stone. Derived rate: 2.5 gal X-Bond Liquid per full 5 gal MicroBond pail, equal to 400 sq ft/gal at 1000 sq ft/pail.',
    },
  },
};

const MICROBOND_STONE: CoverageProduct = {
  sku: 'MICROBOND-STONE',
  name: 'SEMCO MicroBond Stone',
  category: 'microbond_finish',
  packLabel: '5 gal / 30 lb pail',
  defaultRange: 'smoothFinish',
  ranges: {
    smoothFinish: {
      label: 'MicroBond smooth finish',
      minSqftPerUnit: 1000,
      maxSqftPerUnit: 1000,
      unit: 'pail',
      coats: 2,
      sourceDocument: 'Semco West installer package rate',
      sourcePage: 0,
      basis: 'Installer pail rate: 1 x 5 gal / 30 lb MicroBond pail covers 1000 sq ft for smooth finish. SIP manual confirms MicroBond is optional for smoother texture and uses 1 part X-Bond Liquid to 2 parts MicroBond Stone.',
      note: 'Use for optional smooth MicroBond finish only; standard X-Bond finish does not add this row.',
    },
  },
};

const LIQUID_MEMBRANE: CoverageProduct = {
  sku: 'SEMCO-LIQUID-MEMBRANE',
  name: 'SEMCO Liquid Membrane',
  category: 'waterproofing',
  packLabel: '1 gal and 5 gal pails',
  purchaseSizes: [1, 5],
  defaultRange: 'aboveGrade',
  ranges: {
    aboveGrade: {
      label: 'Standard Liquid Membrane',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'Semco installer field rate',
      sourcePage: 0,
      basis: 'Field rate: standard non-submerged Liquid Membrane gets over 1000 sq ft per 5 gal pail, estimated at 200-250 sq ft/gal.',
    },
    submerged: {
      label: 'Pool / wet-area Liquid Membrane',
      minSqftPerUnit: 50,
      maxSqftPerUnit: 75,
      unit: 'gal',
      coats: 4,
      sourceDocument: 'Pool-Resurfacing-Detail-Interior-Below-Grade.pdf',
      sourcePage: 1,
      basis: 'Pool resurfacing detail calls for 4 coats at 15 mil each for 60 mil total. Rate is derived from the 100-150 sq ft/gal 2-coat X-Bond scratch coat rate.',
      note: 'Used automatically when Pool is selected.',
    },
  },
};

const NATURAL_SHIELD: CoverageProduct = {
  sku: 'NATURAL-SHIELD',
  name: 'SEMCO Natural Shield',
  category: 'sealer',
  packLabel: '1 gal and 5 gal pails',
  purchaseSizes: [1, 5],
  defaultRange: 'xbond',
  ranges: {
    xbond: {
      label: 'X-Bond / artificial stone',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 3,
      sourceDocument: 'Natural-Shield-Tech-Sheet.pdf',
      sourcePage: 1,
      basis: 'Natural Shield is recommended for X-Bond Microcement; current coverage table does not list X-Bond separately, so the Artificial Stone row is used for X-Bond estimating.',
    },
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
    belowGrade: {
      label: 'Pool / submerged / below grade',
      minSqftPerUnit: 150,
      maxSqftPerUnit: 200,
      unit: 'gal',
      coats: 3,
      sourceDocument: 'Natural-Shield-Tech-Sheet.pdf',
      sourcePage: 1,
      basis: 'Natural Shield is the current Semco Canada pool/submerged sealer. The Natural Shield data lists below-grade coverage at 150-200 sq ft / 1 gal at 3 coats, used as the conservative pool estimating rate.',
    },
  },
};

const SATIN_STONE: CoverageProduct = {
  sku: 'SATIN-STONE',
  name: 'SEMCO Satin Stone',
  category: 'sealer',
  packLabel: '1.5 gal kit: Part A 1 gal + Part B 0.5 gal',
  defaultRange: 'xbond',
  purchaseUnitLabel: 'kit',
  purchaseUnitSize: 1.5,
  ranges: {
    xbond: {
      label: 'X-Bond Microcement',
      minSqftPerUnit: 250,
      maxSqftPerUnit: 300,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'Satin Stone Sealer - semcosurfaces.com',
      sourcePage: 0,
      basis: 'Current SEMCO product page: X-Bond Microcement 250-300 sq ft/gal, minimum 2 coats at 20 mil total thickness.',
    },
    concrete: {
      label: 'Concrete',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / gallon at minimum 2 coats and 20 mil total thickness.',
    },
    polishedConcrete: {
      label: 'Polished concrete',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / gallon at minimum 2 coats and 20 mil total thickness.',
    },
    artificialStone: {
      label: 'Artificial stone',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / gallon at minimum 2 coats and 20 mil total thickness.',
    },
    stampedConcrete: {
      label: 'Stamped Concrete',
      minSqftPerUnit: 300,
      maxSqftPerUnit: 350,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / gallon at minimum 2 coats and 20 mil total thickness.',
    },
    semcoAda: {
      label: 'SEMCO ADA',
      minSqftPerUnit: 150,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 2,
      sourceDocument: 'Satin+Stone+Tech+Sheet.pdf',
      sourcePage: 1,
      basis: 'Coverage sq ft / gallon at minimum 2 coats and 20 mil total thickness.',
    },
  },
};

const TITAN_SHIELD: CoverageProduct = {
  sku: 'TITAN-SHIELD',
  name: 'SEMCO Titan Gloss',
  category: 'sealer',
  packLabel: '1 gal and 5 gal pails',
  purchaseSizes: [1, 5],
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

const MATTE_SEALER: CoverageProduct = {
  sku: 'MATTE-SEALER',
  name: 'SEMCO Matte',
  category: 'sealer',
  packLabel: '1 gal and 5 gal pails',
  purchaseSizes: [1, 5],
  defaultRange: 'xbond',
  ranges: {
    xbond: {
      label: 'X-Bond',
      minSqftPerUnit: 200,
      maxSqftPerUnit: 250,
      unit: 'gal',
      coats: 3,
      sourceDocument: STOCKED_SEALER_POLICY_SOURCE,
      sourcePage: STOCKED_SEALER_POLICY_PAGE,
      basis: 'Current Semco Canada stocked product rule: Matte is like Titan Gloss in a matte finish and is slightly harder than Titan. The calculator uses the Titan Gloss X-Bond coverage rate as the closest stocked technical basis until a Matte data sheet is loaded.',
    },
  },
};

export const COVERAGE_PRODUCTS = {
  XBOND,
  XBOND_LIQUID,
  MICROBOND_STONE,
  LIQUID_MEMBRANE,
  NATURAL_SHIELD,
  SATIN_STONE,
  TITAN_SHIELD,
  MATTE_SEALER,
};

export function getXBondRange(substrate: SubstrateId): CoverageRange {
  if (substrate === 'existing_tile') return XBOND.ranges.tile;
  if (substrate === 'existing_paint' || substrate === 'gypsum_board') return XBOND.ranges.painted;
  return XBOND.ranges.concrete;
}

export function getXBondLiquidRange(): CoverageRange {
  return XBOND_LIQUID.ranges.stoneMix;
}

export function getMicroBondRange(): CoverageRange {
  return MICROBOND_STONE.ranges.smoothFinish;
}

export function getMicroBondLiquidRange(): CoverageRange {
  return XBOND_LIQUID.ranges.microbondMix;
}

export function getLiquidMembraneRange(mode: WaterproofingMode): CoverageRange | null {
  if (mode === 'none') return null;
  if (mode === 'submerged') return LIQUID_MEMBRANE.ranges.submerged;
  return LIQUID_MEMBRANE.ranges.aboveGrade;
}

export function getSealerProduct(sku?: string): CoverageProduct {
  if (sku === NATURAL_SHIELD.sku) return NATURAL_SHIELD;
  if (sku === TITAN_SHIELD.sku) return TITAN_SHIELD;
  if (sku === MATTE_SEALER.sku) return MATTE_SEALER;
  return SATIN_STONE;
}

export function getSealerSkuForSubstrate(substrate: SubstrateId, selectedSku?: string): string | undefined {
  if (substrate === 'pool') return CURRENT_POOL_SEALER_SKU;
  return selectedSku;
}

export function getSealerRange(product: CoverageProduct, substrate?: SubstrateId): CoverageRange {
  if (product.sku === NATURAL_SHIELD.sku && substrate === 'pool') {
    return product.ranges.belowGrade;
  }

  return product.ranges[product.defaultRange];
}

export function estimateCoverage(product: CoverageProduct, range: CoverageRange, areaSqft: number, wastePct: number): CoverageEstimate {
  const adjustedSqft = areaSqft * (1 + wastePct / 100);
  const avgCoverage = (range.minSqftPerUnit + range.maxSqftPerUnit) / 2;
  const exactUnits = adjustedSqft / avgCoverage;
  const purchase = getPurchaseRecommendation(product, range.unit, exactUnits);
  const purchaseUnitSize = product.purchaseUnitSize ?? 1;
  const roundedUnits = purchase.roundedUnits ?? Math.max(1, Math.ceil(exactUnits / purchaseUnitSize));
  const unitLabel = range.unit;
  const plural = formatUnitLabel(unitLabel, roundedUnits);
  const exactLabel = range.minSqftPerUnit === range.maxSqftPerUnit
    ? `${range.minSqftPerUnit} sq ft/${unitLabel}`
    : `${range.minSqftPerUnit}-${range.maxSqftPerUnit} sq ft/${unitLabel}`;
  const isWholeUnit = range.unit === 'kit' || range.unit === 'bag' || range.unit === 'qt' || range.unit === 'pail';
  const displayQuantity = isWholeUnit ? roundedUnits : exactUnits;
  const quantityLabel = `${formatQuantity(displayQuantity)} ${isWholeUnit ? plural : unitLabel}`;
  const purchaseLabel = purchase.purchaseLabel ?? getDefaultPurchaseLabel(product, unitLabel, roundedUnits, isWholeUnit);

  return {
    product,
    range,
    exactUnits,
    roundedUnits,
    adjustedSqft,
    coverageLabel: `${range.label}: ${exactLabel}`,
    quantityLabel,
    purchaseLabel,
  };
}

function getDefaultPurchaseLabel(product: CoverageProduct, unitLabel: string, roundedUnits: number, isWholeUnit: boolean): string {
  const purchaseUnitLabel = product.purchaseUnitLabel ?? unitLabel;
  const purchasePlural = formatUnitLabel(purchaseUnitLabel, roundedUnits);
  const stagedQuantity = product.purchaseUnitSize ? roundedUnits * product.purchaseUnitSize : roundedUnits;

  if (product.purchaseUnitSize) {
    return `Buy ${roundedUnits} ${purchasePlural} (${formatQuantity(stagedQuantity)} ${unitLabel})`;
  }

  return isWholeUnit
    ? `Stage ${roundedUnits} ${formatUnitLabel(unitLabel, roundedUnits)}`
    : `Buy ${roundedUnits} ${formatUnitLabel(unitLabel, roundedUnits)}`;
}

function getPurchaseRecommendation(product: CoverageProduct, unit: CoverageUnit, exactUnits: number): { roundedUnits?: number; purchaseLabel?: string } {
  if (unit !== 'gal' || !product.purchaseSizes?.length) return {};

  const sizes = [...product.purchaseSizes].sort((a, b) => a - b);
  const smallSize = sizes[0] ?? 1;
  const pailSize = sizes.find((size) => size >= 5) ?? sizes[sizes.length - 1] ?? 1;

  if (exactUnits <= smallSize) {
    return { roundedUnits: smallSize, purchaseLabel: `Buy 1 x ${formatQuantity(smallSize)} gal pail` };
  }

  if (exactUnits <= pailSize) {
    return { roundedUnits: pailSize, purchaseLabel: `Buy 1 x ${formatQuantity(pailSize)} gal pail` };
  }

  const pailCount = Math.ceil(exactUnits / pailSize);
  const total = pailCount * pailSize;
  return {
    roundedUnits: total,
    purchaseLabel: `Buy ${pailCount} x ${formatQuantity(pailSize)} gal pail${pailCount === 1 ? '' : 's'} (${formatQuantity(total)} gal)`,
  };
}

function formatQuantity(value: number): string {
  if (value >= 10 || Number.isInteger(value)) return String(Math.ceil(value));
  return value.toFixed(1);
}

function formatUnitLabel(unit: string, quantity: number): string {
  if (unit === 'gal') return 'gal';
  if (unit === 'qt') return quantity === 1 ? 'qt' : 'qts';
  if (unit === 'pail') return quantity === 1 ? 'pail' : 'pails';
  return quantity === 1 ? unit : `${unit}s`;
}
