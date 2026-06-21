import type { SubstrateId } from '@/constants/substrates';
import { SUBSTRATE_MAP } from '@/constants/substrates';
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

interface CalculatorInput {
  areaSqft?: number;
  areaSqm?: number;
  substrateType: SubstrateId;
  wastePct: number;
  sealerSku?: string;
  waterproofingMode?: WaterproofingMode;
  finishSku?: XBondFinishSku;
}

export function calculate(input: CalculatorInput): CalculationResult {
  const {
    substrateType,
    wastePct,
    sealerSku,
    waterproofingMode = 'above_grade',
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

  const sealerProduct = getSealerProduct(getSealerSkuForSubstrate(substrateType, sealerSku));
  const estimates: CoverageEstimate[] = [
    estimateCoverage(COVERAGE_PRODUCTS.XBOND, getXBondRange(substrateType), areaSqft, wastePct),
    estimateCoverage(COVERAGE_PRODUCTS.XBOND_LIQUID, getXBondLiquidRange(), areaSqft, wastePct),
  ];

  const membraneMode = substrateType === 'pool' ? 'submerged' : waterproofingMode;
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
    layers: [...getPrepLayers(substrateType), ...estimates.map(toMaterialLayer)],
    totalKg: 0,
    wastePct,
    areaSqm,
    areaSqft,
    sourceSummary: 'Material quantities include Liquid Membrane by default because the checked Semco X-Bond, shower, pool, tile, wood, cove, and drain details show it inside the assembly. Cleaner prep rows follow SIP prep types and should be staged only when the substrate condition calls for them.',
  };
}

function getPrepLayers(substrateType: SubstrateId): MaterialLayer[] {
  const base: MaterialLayer[] = [];

  if (substrateType === 'plywood') {
    base.push(createPrepLayer({
      sku: 'PREP-WOOD',
      name: 'Wood substrate prep',
      label: 'Sweep, secure, membrane, fabric',
      note: 'SIP Preparation Type E: wood surfaces start with Liquid Membrane and anti-fracture fabric before X-Bond.',
      sourcePage: 24,
      purchaseLabel: 'No cleaner quantity; stage membrane/fabric in material rows',
    }));
    return base;
  }

  if (substrateType === 'metal') {
    base.push(createPrepLayer({
      sku: 'POWER-CLEANER',
      name: 'SEMCO Power Cleaner',
      label: 'Degrease metal before adhesion test',
      note: 'Use when oil, wax, grease, or other bond-breaking residue is present. Confirm metal profile and adhesion before coating.',
      sourcePage: 14,
      purchaseLabel: 'Stage if surface has oil, grease, or shop residue',
    }));
    return base;
  }

  if (substrateType === 'existing_tile' || substrateType === 'pool') {
    base.push(
      createPrepLayer({
        sku: 'NU-LIFT',
        name: 'SEMCO Nu-Lift Cleaner',
        label: 'Mineral / efflorescence prep',
        note: 'SIP Type D uses Nu-Lift for tile, magnesium, efflorescence, exterior block/stucco, and below-grade plaster conditions.',
        sourcePage: 23,
        purchaseLabel: 'Stage if mineral, calcium, efflorescence, or pool residue is present',
      }),
      createPrepLayer({
        sku: 'STONE-SOAP',
        name: 'SEMCO Stone Soap',
        label: 'Final clean after Nu-Lift',
        note: 'SIP Type D follows Nu-Lift with Stone Soap solution 1:4 to clean chemical residue.',
        sourcePage: 23,
        purchaseLabel: 'Stage Stone Soap for final wash',
      }),
    );
    return base;
  }

  if (substrateType === 'icf') {
    base.push(
      createPrepLayer({
        sku: 'STONE-SOAP',
        name: 'SEMCO Stone Soap',
        label: 'Standard wash',
        note: 'SIP Type A uses Stone Soap solution 1:4 for standard surface preparation.',
        sourcePage: 15,
        purchaseLabel: 'Stage Stone Soap for standard wash',
      }),
      createPrepLayer({
        sku: 'NU-LIFT',
        name: 'SEMCO Nu-Lift Cleaner',
        label: 'Use only for mineral deposits',
        note: 'Use Nu-Lift when the surface has calcium, magnesium, mineral residue, alkali, or efflorescence.',
        sourcePage: 23,
        purchaseLabel: 'Add only if mineral contamination is visible',
      }),
    );
    return base;
  }

  base.push(createPrepLayer({
    sku: 'STONE-SOAP',
    name: 'SEMCO Stone Soap',
    label: 'Standard wash',
    note: 'SIP Type A uses Stone Soap solution 1:4. Use Power Cleaner first if grease, oil, wax, glue, paint, or topical coatings are present.',
    sourcePage: 15,
    purchaseLabel: 'Stage Stone Soap; add Power Cleaner only if contamination is present',
  }));

  return base;
}

function createPrepLayer({
  sku,
  name,
  label,
  note,
  sourcePage,
  purchaseLabel,
}: {
  sku: string;
  name: string;
  label: string;
  note: string;
  sourcePage: number;
  purchaseLabel: string;
}): MaterialLayer {
  return {
    productId: sku.toLowerCase(),
    productSku: sku,
    productName: name,
    category: 'prep',
    coats: 0,
    quantityKg: 0,
    quantityPacks: 0,
    packSizeKg: 0,
    coverageRateSqmPerKg: 0,
    quantityLabel: 'As needed',
    purchaseLabel,
    coverageLabel: label,
    sourceDocument: 'Open SIP manual - master copy v2019-3 2.pdf',
    sourcePage,
    sourceNote: note,
  };
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
    return `${layer.productName}: ${layer.quantityLabel} (${layer.packLabel ?? layer.productSku}) - ${layer.coats} coat${layer.coats > 1 ? 's' : ''}`;
  }

  return `${layer.productName}: ${layer.quantityKg.toFixed(1)} kg (${layer.quantityPacks} x ${layer.packSizeKg} kg pack) - ${layer.coats} coat${layer.coats > 1 ? 's' : ''}`;
}
