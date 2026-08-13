import type { SubstrateId } from '@/constants/substrates';
import { SUBSTRATE_MAP } from '@/constants/substrates';
import {
  CLEANER_COVERAGE_CAVEAT,
  CLEANER_COVERAGE_SOURCE,
  SIP_PREP_SOURCE,
  getPrepSystem,
  isLiquidMembraneRequired,
  resolvePrepCondition,
} from '@/constants/prep-systems';
import type {
  InstallationScope,
  PrepCleanerStep,
  PrepConditionId,
  PrepSystem,
} from '@/constants/prep-systems';
import {
  COVERAGE_PRODUCTS,
  SQFT_PER_SQM,
  estimateCoverage,
  getLiquidMembraneRange,
  getMicroBondLiquidRange,
  getMicroBondRange,
  getSealerProduct,
  getSealerRange,
  getSealerSkuForSubstrate,
  getXBondLiquidRange,
  getXBondRange,
} from '@/constants/product-coverage';
import type { CoverageEstimate, WaterproofingMode, XBondFinishSku } from '@/constants/product-coverage';
import type { CalculationResult, MaterialLayer } from '@/database/schema/calculations';

export interface CalculatorInput {
  areaSqft?: number;
  areaSqm?: number;
  substrateType: SubstrateId;
  wastePct: number;
  sealerSku?: string;
  waterproofingMode?: WaterproofingMode;
  finishSku?: XBondFinishSku;
  prepCondition?: PrepConditionId;
  installationScope?: InstallationScope;
}

export function calculate(input: CalculatorInput): CalculationResult {
  const {
    substrateType,
    wastePct,
    sealerSku,
    waterproofingMode = 'none',
    finishSku = 'XBOND-STANDARD',
  } = input;
  const areaSqft = input.areaSqft ?? (input.areaSqm ? input.areaSqm * SQFT_PER_SQM : 0);
  const areaSqm = areaSqft / SQFT_PER_SQM;

  if (!SUBSTRATE_MAP[substrateType]) {
    throw new Error(`No substrate found: ${substrateType}`);
  }
  if (!areaSqft || areaSqft <= 0) {
    throw new Error('Please enter a valid area greater than 0');
  }

  const prepCondition = resolvePrepCondition(substrateType, input.prepCondition);
  const prepSystem = getPrepSystem(prepCondition);
  const installationScope: InstallationScope = substrateType === 'pool'
    ? 'submerged'
    : input.installationScope ?? 'floor_or_other';

  if (substrateType === 'gypsum_board' && installationScope === 'wet_area') {
    throw new Error(
      'Regular drywall/gypsum board is not supported in wet areas. Select a wet-area board or cement board substrate.',
    );
  }

  const membraneRequired = isLiquidMembraneRequired(
    substrateType,
    prepCondition,
    installationScope,
  );

  const sealerProduct = getSealerProduct(getSealerSkuForSubstrate(substrateType, sealerSku));
  const estimates: CoverageEstimate[] = [
    estimateCoverage(COVERAGE_PRODUCTS.XBOND, getXBondRange(substrateType), areaSqft, wastePct),
    estimateCoverage(COVERAGE_PRODUCTS.XBOND_LIQUID, getXBondLiquidRange(), areaSqft, wastePct),
  ];

  const membraneMode: WaterproofingMode = installationScope === 'submerged'
    ? 'submerged'
    : installationScope === 'wet_area'
      ? 'above_grade'
      : membraneRequired && waterproofingMode === 'none'
        ? 'above_grade'
        : waterproofingMode;
  const membraneRange = getLiquidMembraneRange(membraneMode);
  if (membraneRange) {
    estimates.push(estimateCoverage(COVERAGE_PRODUCTS.LIQUID_MEMBRANE, membraneRange, areaSqft, wastePct));
  }

  if (finishSku === 'MICROBOND-SMOOTH') {
    estimates.push(
      estimateCoverage(COVERAGE_PRODUCTS.MICROBOND_STONE, getMicroBondRange(), areaSqft, wastePct),
      estimateCoverage(COVERAGE_PRODUCTS.XBOND_LIQUID, getMicroBondLiquidRange(), areaSqft, wastePct),
    );
  }

  estimates.push(estimateCoverage(sealerProduct, getSealerRange(sealerProduct, substrateType), areaSqft, wastePct));

  return {
    layers: [...getPrepLayers(prepSystem, areaSqft, wastePct), ...estimates.map(toMaterialLayer)],
    totalKg: 0,
    wastePct,
    areaSqm,
    areaSqft,
    prepCondition,
    prepSystemLabel: prepSystem.sipType ? `SIP Type ${prepSystem.sipType}: ${prepSystem.label}` : prepSystem.label,
    liquidMembraneRequired: membraneRequired,
    installationScope,
    sourceSummary: buildSourceSummary(
      prepSystem,
      membraneMode,
      membraneRequired,
      installationScope,
    ),
  };
}

function getPrepLayers(prepSystem: PrepSystem, areaSqft: number, wastePct: number): MaterialLayer[] {
  if (prepSystem.cleanerSteps.length > 0) {
    return prepSystem.cleanerSteps.map((step) => createCleanerLayer(step, areaSqft, wastePct));
  }

  if (!prepSystem.assemblyNote) return [];
  return [createAssemblyPrepLayer(prepSystem)];
}

function createCleanerLayer(step: PrepCleanerStep, areaSqft: number, wastePct: number): MaterialLayer {
  const adjustedSqft = areaSqft * (1 + wastePct / 100);
  const minimumCleanerGallons = adjustedSqft / step.maxSqftPerConcentrateGallon;
  const maximumCleanerGallons = adjustedSqft / step.minSqftPerConcentrateGallon;
  const roundedCleanerGallons = Math.max(1, Math.ceil(maximumCleanerGallons));

  return {
    productId: `${step.productSku.toLowerCase()}-step-${step.order}`,
    productSku: step.productSku,
    productName: step.productName,
    category: 'prep',
    coats: 0,
    quantityKg: 0,
    quantityPacks: roundedCleanerGallons,
    packSizeKg: 0,
    coverageRateSqmPerKg: 0,
    quantityLabel: `${formatGallonRange(minimumCleanerGallons, maximumCleanerGallons)} gal concentrate`,
    purchaseLabel: `Allow up to ${formatGallons(maximumCleanerGallons)} gal for this pass; repeated passes are combined into the package plan below`,
    packLabel: 'Available in 1 gal and 5 gal pails',
    coverageLabel: `Step ${step.order} - ${step.dilutionLabel} - ${step.minSqftPerConcentrateGallon}-${step.maxSqftPerConcentrateGallon} sq ft/gal concentrate`,
    sourceDocument: SIP_PREP_SOURCE,
    sourcePage: step.sourcePage,
    sourceNote: `${step.purpose} Coverage source: ${CLEANER_COVERAGE_SOURCE}. ${CLEANER_COVERAGE_CAVEAT}`,
    exactQuantity: maximumCleanerGallons,
    roundedQuantity: roundedCleanerGallons,
    quantityRangeMin: minimumCleanerGallons,
    quantityRangeMax: maximumCleanerGallons,
    prepStep: step.order,
    dilutionLabel: step.dilutionLabel,
  };
}

function createAssemblyPrepLayer(prepSystem: PrepSystem): MaterialLayer {
  const isWood = prepSystem.id === 'type_e';
  return {
    productId: isWood ? 'prep-wood' : 'prep-surface-ready',
    productSku: isWood ? 'PREP-WOOD' : 'PREP-SURFACE-READY',
    productName: isWood ? 'Wood substrate prep' : 'Surface readiness check',
    category: 'prep',
    coats: 0,
    quantityKg: 0,
    quantityPacks: 0,
    packSizeKg: 0,
    coverageRateSqmPerKg: 0,
    quantityLabel: 'No cleaner quantity',
    purchaseLabel: isWood ? 'Liquid Membrane is included in the material rows' : 'Verify the actual top surface before coating',
    coverageLabel: prepSystem.label,
    sourceDocument: SIP_PREP_SOURCE,
    sourcePage: prepSystem.sourcePage,
    sourceNote: prepSystem.assemblyNote,
  };
}

function buildSourceSummary(
  prepSystem: PrepSystem,
  membraneMode: WaterproofingMode,
  membraneRequired: boolean,
  installationScope: InstallationScope,
): string {
  const prepLabel = prepSystem.sipType ? `SIP Type ${prepSystem.sipType}` : 'surface-readiness check';
  const cleanerBasis = prepSystem.cleanerSteps.length > 0
    ? ` Cleaner amounts use ${CLEANER_COVERAGE_SOURCE} per concentrate gallon for each required pass and are planning estimates; actual site use may vary.`
    : '';
  const membraneSummary = installationScope === 'submerged'
    ? 'Liquid Membrane is required for submerged exposure and is included automatically using the 4-coat submerged system.'
    : installationScope === 'wet_area'
      ? 'Liquid Membrane is required for this wet area and is included automatically using the 2-coat above-grade system.'
      : membraneRequired
        ? 'Liquid Membrane is required by the selected substrate/system detail and is included automatically.'
        : membraneMode === 'none'
          ? installationScope === 'non_wet_wall'
            ? 'Liquid Membrane is optional for this wall in a non-wet area and is not included.'
            : 'Liquid Membrane is optional for this floor or other non-wet calculation and is not included.'
          : 'Liquid Membrane was included by selection.';

  return `Preparation follows ${prepLabel}: ${prepSystem.label}.${cleanerBasis} ${membraneSummary}`;
}

function formatGallons(value: number): string {
  if (value < 1) return value.toFixed(2);
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatGallonRange(minimum: number, maximum: number): string {
  const minLabel = formatGallons(minimum);
  const maxLabel = formatGallons(maximum);
  return minLabel === maxLabel ? minLabel : `${minLabel}-${maxLabel}`;
}

function toMaterialLayer(estimate: CoverageEstimate): MaterialLayer {
  const { product, range } = estimate;
  const avgSqftPerUnit = (range.minSqftPerUnit + range.maxSqftPerUnit) / 2;

  return {
    productId: product.sku.toLowerCase(),
    productSku: product.sku,
    productName: product.name,
    category: product.category,
    coats: range.coats,
    quantityKg: 0,
    quantityPacks: estimate.roundedUnits,
    packSizeKg: 0,
    coverageRateSqmPerKg: avgSqftPerUnit / SQFT_PER_SQM,
    quantityLabel: estimate.quantityLabel,
    purchaseLabel: estimate.purchaseLabel,
    packLabel: product.packLabel,
    coverageLabel: estimate.coverageLabel,
    sourceDocument: range.sourceDocument,
    sourcePage: range.sourcePage,
    sourceNote: range.note ?? range.basis,
    exactQuantity: estimate.exactUnits,
    roundedQuantity: estimate.roundedUnits,
  };
}

export function formatLayerSummary(layer: MaterialLayer): string {
  if (layer.quantityLabel) {
    if (layer.category === 'prep') {
      return `${layer.productName}: ${layer.quantityLabel} (${layer.packLabel ?? layer.productSku})`;
    }
    return `${layer.productName}: ${layer.quantityLabel} (${layer.packLabel ?? layer.productSku}) - ${layer.coats} coat${layer.coats > 1 ? 's' : ''}`;
  }

  return `${layer.productName}: ${layer.quantityKg.toFixed(1)} kg (${layer.quantityPacks} x ${layer.packSizeKg} kg pack) - ${layer.coats} coat${layer.coats > 1 ? 's' : ''}`;
}
