import type { SubstrateId } from '@/constants/substrates';
import type { CalculationResult, MaterialLayer } from '@/database/schema/calculations';
import applicationMatrix from '@/database/seed/application-matrix.json';
import productsData from '@/database/seed/products.json';

interface MatrixLayer {
  sku: string;
  coats: number;
  required: boolean;
  note?: string;
}

interface MatrixEntry {
  label: string;
  layers: MatrixLayer[];
}

interface CalculatorInput {
  areaSqm: number;
  substrateType: SubstrateId;
  wastePct: number;
  sealerSku?: string; // allows choosing gloss/satin/matte
}

export function calculate(input: CalculatorInput): CalculationResult {
  const { areaSqm, substrateType, wastePct, sealerSku } = input;
  const matrix = (applicationMatrix as Record<string, MatrixEntry>)[substrateType];

  if (!matrix) {
    throw new Error(`No application matrix found for substrate: ${substrateType}`);
  }

  const productMap = Object.fromEntries(
    (productsData as {
      id: string;
      sku: string;
      name: string;
      category: string;
      coverageMinSqmPerKg: number | null;
      coverageMaxSqmPerKg: number | null;
      packSizeKg: number;
    }[]).map((p) => [p.sku, p]),
  );

  const layers: MaterialLayer[] = [];

  for (const entry of matrix.layers) {
    // Allow caller to swap sealer SKU (gloss/satin/matte)
    const sku =
      entry.sku.startsWith('SEAL-') && sealerSku ? sealerSku : entry.sku;

    const product = productMap[sku];
    if (!product) continue;

    const minCov = product.coverageMinSqmPerKg ?? 5;
    const maxCov = product.coverageMaxSqmPerKg ?? 8;
    const avgCoverage = (minCov + maxCov) / 2;
    const packSize = product.packSizeKg ?? 1;
    const wasteMultiplier = 1 + wastePct / 100;

    const rawKgPerCoat = areaSqm / avgCoverage;
    const rawKgTotal = rawKgPerCoat * entry.coats * wasteMultiplier;
    const quantityPacks = Math.ceil(rawKgTotal / packSize);
    const quantityKg = quantityPacks * packSize;

    layers.push({
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      category: product.category,
      coats: entry.coats,
      quantityKg,
      quantityPacks,
      packSizeKg: packSize,
      coverageRateSqmPerKg: avgCoverage,
    });
  }

  const totalKg = layers.reduce((sum, l) => sum + l.quantityKg, 0);

  return {
    layers,
    totalKg,
    wastePct,
    areaSqm,
  };
}

export function formatLayerSummary(layer: MaterialLayer): string {
  return `${layer.productName}: ${layer.quantityKg.toFixed(1)} kg (${layer.quantityPacks} × ${layer.packSizeKg} kg pack) — ${layer.coats} coat${layer.coats > 1 ? 's' : ''}`;
}
