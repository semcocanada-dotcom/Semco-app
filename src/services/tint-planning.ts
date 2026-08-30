import type {
  CalculationResult,
  ColourTintAllocation,
  ColourTintPlan,
  MaterialLayer,
  TintBatchPlanLine,
  TintBatchSize,
  TintPigmentPlanLine,
} from '@/database/schema/calculations';
import {
  getColourChargeRecord,
  getPigmentY48ForBatch,
  TINT_PRICING_UNIT,
  TINT_RATE_PER_MACHINE_OUNCE_CAD,
  type TintPigmentDefinition,
} from '@/knowledge/colour-charges';
import { formatDispenser } from '@/services/color-scaler';

export interface ColourAllocationInput {
  colourId: string;
  areaSqft: number;
}

export type ColourTintPlanResult =
  | { ok: true; plan: ColourTintPlan }
  | { ok: false; errors: string[] };

const AREA_TOLERANCE_SQFT = 0.05;
const FLOATING_POINT_EPSILON = 1e-9;

const BATCHES: readonly {
  batchSize: TintBatchSize;
  batchLabel: string;
  gallons: 0.25 | 1 | 5;
  quarterUnits: number;
}[] = [
  { batchSize: 'five_gallon', batchLabel: '5 gallon', gallons: 5, quarterUnits: 20 },
  { batchSize: 'gallon', batchLabel: '1 gallon', gallons: 1, quarterUnits: 4 },
  { batchSize: 'quart', batchLabel: '1 quart', gallons: 0.25, quarterUnits: 1 },
];

export function getTintableXBondLiquidGallons(result: Pick<CalculationResult, 'layers'>): number {
  return result.layers
    .filter((layer) => layer.productSku === 'XBOND-LIQUID')
    .reduce((total, layer) => total + getExactLayerQuantity(layer), 0);
}

export function getPurchasedXBondLiquidGallons(layers: MaterialLayer[]): number {
  return layers
    .filter((layer) => layer.productSku === 'XBOND-LIQUID')
    .reduce((total, layer) => total + Math.max(0, layer.roundedQuantity ?? 0), 0);
}

export function buildTintBatchCounts(exactGallons: number): {
  batchSize: TintBatchSize;
  batchLabel: string;
  batchGallons: 0.25 | 1 | 5;
  quantity: number;
  preparedGallons: number;
}[] {
  if (!Number.isFinite(exactGallons) || exactGallons <= 0) return [];

  let remainingQuarterUnits = Math.ceil(exactGallons * 4 - FLOATING_POINT_EPSILON);
  return BATCHES.flatMap((batch) => {
    const quantity = Math.floor(remainingQuarterUnits / batch.quarterUnits);
    remainingQuarterUnits -= quantity * batch.quarterUnits;
    if (quantity <= 0) return [];
    return [{
      batchSize: batch.batchSize,
      batchLabel: batch.batchLabel,
      batchGallons: batch.gallons,
      quantity,
      preparedGallons: quantity * batch.gallons,
    }];
  });
}

export function buildColourTintPlan(
  result: Pick<CalculationResult, 'layers' | 'areaSqft' | 'areaSqm'>,
  requestedAllocations: ColourAllocationInput[],
): ColourTintPlanResult {
  const projectAreaSqft = result.areaSqft ?? result.areaSqm * 10.7639104167;
  const errors: string[] = [];

  if (!Number.isFinite(projectAreaSqft) || projectAreaSqft <= 0) {
    errors.push('A valid project area is required before colours can be allocated.');
  }
  if (!requestedAllocations.length) {
    errors.push('Choose at least one colour for the X-Bond tint.');
  }

  requestedAllocations.forEach((allocation, index) => {
    if (!allocation.colourId) errors.push(`Choose colour ${index + 1}.`);
    if (!Number.isFinite(allocation.areaSqft) || allocation.areaSqft <= 0) {
      errors.push(`Enter a valid area for colour ${index + 1}.`);
    }
  });
  if (errors.length > 0) return { ok: false, errors };

  const merged = mergeDuplicateAllocations(requestedAllocations);
  const allocatedAreaSqft = merged.reduce((total, allocation) => total + allocation.areaSqft, 0);
  if (Math.abs(allocatedAreaSqft - projectAreaSqft) > AREA_TOLERANCE_SQFT) {
    errors.push(
      `Colour areas must total ${formatNumber(projectAreaSqft)} sq ft; currently allocated ${formatNumber(allocatedAreaSqft)} sq ft.`,
    );
  }

  const exactLiquidGallons = getTintableXBondLiquidGallons(result as Pick<CalculationResult, 'layers'>);
  if (!Number.isFinite(exactLiquidGallons) || exactLiquidGallons <= 0) {
    errors.push('The calculator did not produce an X-Bond Liquid quantity to tint.');
  }
  if (errors.length > 0) return { ok: false, errors };

  const allocations = merged.map((allocation) => buildAllocation(
    allocation,
    projectAreaSqft,
    exactLiquidGallons,
  ));
  const isFullyPriced = allocations.every((allocation) => allocation.pricingStatus === 'priced');
  const preparedLiquidGallons = allocations.reduce(
    (total, allocation) => total + allocation.preparedLiquidGallons,
    0,
  );
  const purchasedLiquidGallons = getPurchasedXBondLiquidGallons(result.layers);

  return {
    ok: true,
    plan: {
      allocations,
      exactLiquidGallons,
      preparedLiquidGallons,
      baseLiquidPurchaseGallons: Math.max(purchasedLiquidGallons, nextWholeGallonPurchase(preparedLiquidGallons)),
      totalTintOunces: isFullyPriced
        ? round8(allocations.reduce((total, allocation) => total + (allocation.totalTintOunces ?? 0), 0))
        : undefined,
      totalChargeCad: isFullyPriced
        ? round2(allocations.reduce((total, allocation) => total + (allocation.totalChargeCad ?? 0), 0))
        : undefined,
      ratePerTintOunceCad: TINT_RATE_PER_MACHINE_OUNCE_CAD,
      pricingUnit: TINT_PRICING_UNIT,
      isFullyPriced,
    },
  };
}

export function ensureXBondLiquidPurchaseCoversTintPlan(
  layers: MaterialLayer[],
  minimumGallons: number,
): MaterialLayer[] {
  const purchasedGallons = getPurchasedXBondLiquidGallons(layers);
  if (minimumGallons <= purchasedGallons + FLOATING_POINT_EPSILON) return layers;

  const targetGallons = nextWholeGallonPurchase(minimumGallons);
  const extraGallons = targetGallons - purchasedGallons;
  const liquidIndex = layers.findIndex((layer) => layer.productSku === 'XBOND-LIQUID');
  if (liquidIndex < 0) return layers;

  return layers.map((layer, index) => {
    if (index !== liquidIndex) return layer;
    const roundedQuantity = (layer.roundedQuantity ?? 0) + extraGallons;
    return {
      ...layer,
      roundedQuantity,
      quantityPacks: roundedQuantity,
      purchaseLabel: formatGallonPackagePurchase(roundedQuantity),
      sourceNote: [
        layer.sourceNote,
        'Base liquid was increased to cover colour-by-colour tint batches and their supported formula sizes.',
      ].filter(Boolean).join(' '),
    };
  });
}

function buildAllocation(
  allocation: ColourAllocationInput,
  projectAreaSqft: number,
  totalExactLiquidGallons: number,
): ColourTintAllocation {
  const colour = getColourChargeRecord(allocation.colourId);
  const exactLiquidGallons = totalExactLiquidGallons * (allocation.areaSqft / projectAreaSqft);
  const batchCounts = colour
    ? getOperationalBatchCounts(exactLiquidGallons, colour.batches.quart.formulaBasis)
    : buildTintBatchCounts(exactLiquidGallons);
  const preparedLiquidGallons = batchCounts.reduce((total, batch) => total + batch.preparedGallons, 0);
  const usesGallonForUnpublishedQuart = Boolean(
    colour?.batches.quart.formulaBasis === 'derived_from_gallon_div_4'
    && buildTintBatchCounts(exactLiquidGallons).some((batch) => batch.batchSize === 'quart'),
  );
  const preparationNote = [
    usesGallonForUnpublishedQuart
      ? 'The source does not publish a quart dispenser formula, so the tint quantity is rounded up to whole-gallon direct formula batches.'
      : null,
    colour?.associationNote,
    colour?.formulaCorrections.length
      ? `Verified source correction applied to the ${colour.formulaCorrections.join(', ')} formula; confirm the cured sample before production.`
      : null,
  ].filter(Boolean).join(' ');

  if (!colour || !colour.orderable) {
    return {
      colourId: allocation.colourId,
      colourCode: colour?.code ?? 'Custom',
      colourName: colour?.name ?? 'Custom colour',
      formulaCode: colour?.sourceFormulaCode ?? 'Dealer review',
      areaSqft: allocation.areaSqft,
      exactLiquidGallons,
      preparedLiquidGallons,
      batches: batchCounts,
      pigments: [],
      pricingStatus: 'dealer_review',
      reviewReason: colour?.reviewReason ?? 'This colour does not have a verified standard tint formula and charge.',
      preparationNote: preparationNote || undefined,
    };
  }

  const batches: TintBatchPlanLine[] = batchCounts.map((batch) => {
    const definition = colour.batches[batch.batchSize];
    return {
      ...batch,
      tintOuncesPerBatch: definition.tintOunces,
      totalTintOunces: round8(definition.tintOunces * batch.quantity),
      chargeCadPerBatch: definition.chargeCad,
      lineTotalCad: round2(definition.chargeCad * batch.quantity),
      formulaBasis: definition.formulaBasis,
      pigments: aggregatePigments(colour.pigments, [{
        batchSize: batch.batchSize,
        quantity: 1,
      }]),
    };
  });
  const pigments = aggregatePigments(colour.pigments, batchCounts);

  return {
    colourId: colour.id,
    colourCode: colour.code,
    colourName: colour.name,
    formulaCode: colour.sourceFormulaCode,
    areaSqft: allocation.areaSqft,
    exactLiquidGallons,
    preparedLiquidGallons,
    batches,
    pigments,
    totalTintOunces: round8(batches.reduce((total, batch) => total + (batch.totalTintOunces ?? 0), 0)),
    totalChargeCad: round2(batches.reduce((total, batch) => total + (batch.lineTotalCad ?? 0), 0)),
    pricingStatus: 'priced',
    preparationNote: preparationNote || undefined,
  };
}

function aggregatePigments(
  pigments: TintPigmentDefinition[],
  batches: { batchSize: TintBatchSize; quantity: number }[],
): TintPigmentPlanLine[] {
  const totals = new Map<string, { pigmentCode: string; pigmentName: string; dispenserY48: number }>();

  for (const pigment of pigments) {
    const dispenserY48 = batches.reduce(
      (total, batch) => total + getPigmentY48ForBatch(pigment, batch.batchSize) * batch.quantity,
      0,
    );
    if (dispenserY48 <= 0) continue;
    const key = pigment.pigmentCode.trim().toUpperCase();
    const existing = totals.get(key);
    if (existing) {
      existing.dispenserY48 += dispenserY48;
    } else {
      totals.set(key, {
        pigmentCode: pigment.pigmentCode,
        pigmentName: pigment.pigmentName,
        dispenserY48,
      });
    }
  }

  return [...totals.values()].map((pigment) => ({
    ...pigment,
    dispenserY48: round6(pigment.dispenserY48),
    dispenserAmount: formatDispenser(pigment.dispenserY48),
    tintOunces: round8(pigment.dispenserY48 / 48),
  }));
}

function getOperationalBatchCounts(
  exactGallons: number,
  quartFormulaBasis: 'direct_source' | 'derived_from_gallon_div_4',
): ReturnType<typeof buildTintBatchCounts> {
  const batches = buildTintBatchCounts(exactGallons);
  if (quartFormulaBasis === 'direct_source') return batches;

  const quart = batches.find((batch) => batch.batchSize === 'quart');
  if (!quart) return batches;

  // Derived quart values are useful for price review, but they are not a
  // published machine formula. Round the preparation volume to whole gallons,
  // then repack it so an exact 5-gallon direct formula is used instead of five
  // separate gallon formulas when the rounded volume reaches five gallons.
  return buildTintBatchCounts(Math.ceil(exactGallons - FLOATING_POINT_EPSILON));
}

function mergeDuplicateAllocations(allocations: ColourAllocationInput[]): ColourAllocationInput[] {
  const merged = new Map<string, ColourAllocationInput>();
  for (const allocation of allocations) {
    const existing = merged.get(allocation.colourId);
    if (existing) {
      existing.areaSqft += allocation.areaSqft;
    } else {
      merged.set(allocation.colourId, { ...allocation });
    }
  }
  return [...merged.values()];
}

function getExactLayerQuantity(layer: MaterialLayer): number {
  const value = layer.exactQuantity ?? layer.roundedQuantity ?? layer.quantityPacks ?? 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function nextWholeGallonPurchase(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value - FLOATING_POINT_EPSILON);
}

function formatGallonPackagePurchase(gallons: number): string {
  const wholeGallons = Math.ceil(gallons - FLOATING_POINT_EPSILON);
  const fiveGallonPails = Math.floor(wholeGallons / 5);
  const oneGallonPails = wholeGallons % 5;
  const packages = [
    fiveGallonPails > 0
      ? `${fiveGallonPails} x 5 gal pail${fiveGallonPails === 1 ? '' : 's'}`
      : null,
    oneGallonPails > 0
      ? `${oneGallonPails} x 1 gal pail${oneGallonPails === 1 ? '' : 's'}`
      : null,
  ].filter(Boolean).join(' + ');
  return `Buy ${packages} (${formatNumber(wholeGallons)} gal)`;
}

function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function round8(value: number): number {
  return Math.round(value * 100_000_000) / 100_000_000;
}
