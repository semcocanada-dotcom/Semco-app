import type { SubstrateId } from '@/constants/substrates';
import { SUBSTRATE_MAP } from '@/constants/substrates';
import {
  COVERAGE_PRODUCTS,
  SQFT_PER_SQM,
  estimateCoverage,
  getLiquidMembraneRange,
  getSealerProduct,
  getSealerRange,
  getXBondRange,
} from '@/constants/product-coverage';
import type { CoverageEstimate } from '@/constants/product-coverage';
import type { CalculationResult, MaterialLayer } from '@/database/schema/calculations';

interface CalculatorInput {
  areaSqft?: number;
  areaSqm?: number;
  substrateType: SubstrateId;
  wastePct: number;
  sealerSku?: string;
}

export function calculate(input: CalculatorInput): CalculationResult {
  const { substrateType, wastePct, sealerSku } = input;
  const areaSqft = input.areaSqft ?? (input.areaSqm ? input.areaSqm * SQFT_PER_SQM : 0);
  const areaSqm = areaSqft / SQFT_PER_SQM;

  if (!SUBSTRATE_MAP[substrateType]) {
    throw new Error(`No substrate found: ${substrateType}`);
  }
  if (!areaSqft || areaSqft <= 0) {
    throw new Error('Please enter a valid area greater than 0');
  }

  const sealerProduct = getSealerProduct(sealerSku);
  const estimates = [
    estimateCoverage(COVERAGE_PRODUCTS.XBOND, getXBondRange(substrateType), areaSqft, wastePct),
    estimateCoverage(COVERAGE_PRODUCTS.LIQUID_MEMBRANE, getLiquidMembraneRange(substrateType), areaSqft, wastePct),
    estimateCoverage(sealerProduct, getSealerRange(sealerProduct), areaSqft, wastePct),
  ];

  return {
    layers: estimates.map(toMaterialLayer),
    totalKg: 0,
    wastePct,
    areaSqm,
    areaSqft,
    sourceSummary: 'Coverage is calculated from Semco technical sheets plus the configured X-Bond field bag rate. Quantities are internal estimates only.',
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
