import type { MaterialLayer } from '@/database/schema/calculations';

export type MaterialPrice = {
  sku: string;
  product: string;
  category: string;
  size: string;
  coverageRate: string;
  retailPriceCad: number;
  minimumQty: number;
  source: string;
};

export type PricedMaterialLine = {
  layer: MaterialLayer;
  price?: MaterialPrice;
  priceSku?: string;
  quantity: number;
  lineTotalCad?: number;
};

export type CleanerPackageLine = {
  price: MaterialPrice;
  priceSku: string;
  quantity: number;
  packageGallons: 1 | 5;
};

export const MATERIAL_PRICE_SOURCE = 'Modern Arc Ontario Dealer Pricing 2026';

const SKU_ALIASES: Record<string, string> = {
  'XBOND-STONE': 'XBT50',
  'XBOND-LIQUID': 'XB805',
  'SEMCO-LIQUID-MEMBRANE': 'XME805',
  'MICROBOND-STONE': 'XBM50',
  'SATIN-STONE': 'XTS100',
  'TITAN-SHIELD': 'TSG705',
  'MATTE-SEALER': 'MS605',
  'STONE-SOAP': 'SS101',
  'POWER-CLEANER': 'PC 201',
  'NU-LIFT': 'NL 101',
};

export const MATERIAL_PRICES: MaterialPrice[] = [
  { sku: 'XBT50', product: 'X-Bond Stone', category: 'X-Bond Microcement System', size: '50 lb bag', coverageRate: 'Concrete 120-150; Painted Surface 120-150; Ceramic Tile 110-175; Vinyl Tile 120-150; Natural Stone 100-200; Metal 120-150', retailPriceCad: 137.36, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.1' },
  { sku: 'XME805', product: 'Liquid Membrane', category: 'X-Bond Microcement System', size: '5 gallon pail', coverageRate: 'Open pore 500-1000; Closed pore 700-1250; X-Bond Scratch Coat 1000-1500', retailPriceCad: 721.00, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.1' },
  { sku: 'XBAD801', product: 'X-Bond Additive Brown Coat Filler', category: 'X-Bond Microcement System', size: '4 lb bag', coverageRate: 'Can be applied from 1/4 in to 4 in thickness', retailPriceCad: 78.66, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.1' },
  { sku: 'XBAD805', product: 'X-Bond Additive Brown Coat Filler', category: 'X-Bond Microcement System', size: '20 lb bag', coverageRate: 'Can be applied from 1/4 in to 4 in thickness', retailPriceCad: 472.08, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.1' },
  { sku: 'XB805', product: 'X-Bond Liquid', category: 'X-Bond Microcement System', size: '5 gallon pail', coverageRate: 'Based on 2 x 50 lb X-Bond Stone and 5 gal liquid at 1/8 in thickness', retailPriceCad: 623.57, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.1' },
  { sku: 'XBM50', product: 'Microbond', category: 'X-Bond Microcement System', size: '5 gallon pail', coverageRate: 'Coverage 1000 sq ft', retailPriceCad: 455.18, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.2' },
  { sku: 'MS605', product: 'Semco Sealer Matte', category: 'Sealers and Stains', size: '5 gallon pail', coverageRate: 'Coverage 1000 sq ft, based on 2 coats', retailPriceCad: 1057.97, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.2' },
  { sku: 'TSG705', product: 'Titan Shield Gloss', category: 'Sealers and Stains', size: '5 gallon pail', coverageRate: 'Coverage 1000 sq ft, based on 3 coats', retailPriceCad: 957.68, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.2' },
  { sku: 'XTS100', product: 'Satin Stone Sealer', category: 'Sealers and Stains', size: '1.5 gallon kit', coverageRate: 'X-Bond 300-375 sq ft; Semco ADA Finish 150-250 sq ft', retailPriceCad: 733.79, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.2' },
  { sku: 'PSB301', product: 'Pre Stain Base', category: 'Sealers and Stains', size: '1 gallon pail', coverageRate: 'Coverage 200-250 sq ft', retailPriceCad: 266.63, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.3' },
  { sku: 'PSB305', product: 'Pre Stain Base', category: 'Sealers and Stains', size: '5 gallon pail', coverageRate: 'Coverage 1000-1250 sq ft', retailPriceCad: 1073.49, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.3' },
  { sku: 'CC601', product: 'Crystal Coat', category: 'Sealers and Stains', size: '1 gallon pail', coverageRate: 'Coverage 300-450 sq ft', retailPriceCad: 167.19, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.3' },
  { sku: 'CC605', product: 'Crystal Coat', category: 'Sealers and Stains', size: '5 gallon pail', coverageRate: 'Coverage 300-450 sq ft', retailPriceCad: 867.09, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.3' },
  { sku: 'CG101', product: 'Colour Green', category: 'Sealers and Stains', size: '1 gallon pail', coverageRate: 'Not listed', retailPriceCad: 245.47, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.3' },
  { sku: 'CG105', product: 'Colour Green', category: 'Sealers and Stains', size: '5 gallon pail', coverageRate: 'Not listed', retailPriceCad: 1227.30, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.3' },
  { sku: 'PS301', product: 'Pre Stain Colour', category: 'Sealers and Stains', size: '1 gallon pail', coverageRate: 'Not listed', retailPriceCad: 214.70, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.3' },
  { sku: 'PS305', product: 'Pre Stain Colour', category: 'Sealers and Stains', size: '5 gallon pail', coverageRate: 'Not listed', retailPriceCad: 999.91, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.3' },
  { sku: 'SS101', product: 'Stone Soap', category: 'Cleaners', size: '1 gallon pail', coverageRate: 'Planning coverage 200-250 sq ft per gallon', retailPriceCad: 116.92, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.4' },
  { sku: 'SS105', product: 'Stone Soap', category: 'Cleaners', size: '5 gallon pail', coverageRate: 'Planning coverage 1000-1250 sq ft per pail', retailPriceCad: 584.51, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.4' },
  { sku: 'PC 201', product: 'Power Cleaner', category: 'Cleaners', size: '1 gallon pail', coverageRate: 'Planning coverage 300-450 sq ft per gallon', retailPriceCad: 117.60, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.4' },
  { sku: 'PC 205', product: 'Power Cleaner', category: 'Cleaners', size: '5 gallon pail', coverageRate: 'Planning coverage 1500-2250 sq ft per pail', retailPriceCad: 590.00, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.4' },
  { sku: 'NL 101', product: 'Nu Lift Cleaner', category: 'Cleaners', size: '1 gallon pail', coverageRate: 'Planning coverage 200-250 sq ft per gallon', retailPriceCad: 101.84, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.4' },
  { sku: 'NL 105', product: 'Nu Lift Cleaner', category: 'Cleaners', size: '5 gallon pail', coverageRate: 'Planning coverage 1000-1250 sq ft per pail', retailPriceCad: 508.98, minimumQty: 1, source: 'Modern Arc Ontario Dealer Pricing 2026 PDF p.4' },
];

const priceLookup = new Map(MATERIAL_PRICES.map((price) => [normalizeSku(price.sku), price]));

const CLEANER_PACKAGE_SKUS: Record<string, { oneGallon: string; fiveGallon: string }> = {
  STONESOAP: { oneGallon: 'SS101', fiveGallon: 'SS105' },
  POWERCLEANER: { oneGallon: 'PC 201', fiveGallon: 'PC 205' },
  NULIFT: { oneGallon: 'NL 101', fiveGallon: 'NL 105' },
};

export function getPriceSku(productSku: string): string {
  return SKU_ALIASES[productSku] ?? productSku;
}

export function getMaterialPrice(productSku: string): MaterialPrice | undefined {
  return priceLookup.get(normalizeSku(getPriceSku(productSku)));
}

export function priceMaterialLayers(layers: MaterialLayer[]): PricedMaterialLine[] {
  const cleanerGroups = getCleanerGroups(layers);

  return layers.flatMap((layer, index) => {
    const cleanerKey = getCleanerKey(layer.productSku);
    const cleanerGroup = cleanerKey ? cleanerGroups.get(cleanerKey) : undefined;
    if (cleanerGroup && cleanerGroup.firstIndex !== index) return [];

    const requiredCleanerGallons = cleanerGroup
      ? cleanerGroup.layers.reduce((total, cleanerLayer) => total + getRequiredCleanerGallons(cleanerLayer), 0)
      : getRequiredCleanerGallons(layer);
    const pricedLayer = cleanerGroup
      ? {
          ...layer,
          exactQuantity: requiredCleanerGallons,
          roundedQuantity: Math.ceil(requiredCleanerGallons),
          purchaseLabel: `Combined cleaner requirement: ${formatGallons(requiredCleanerGallons)} gal concentrate`,
        }
      : layer;
    const cleanerPackageLines = getCleanerPackagePlan(layer.productSku, requiredCleanerGallons);
    if (cleanerPackageLines) {
      if (cleanerPackageLines.length === 0) {
        return [createUnpurchasedLine(pricedLayer)];
      }

      return cleanerPackageLines.map(({ price, priceSku, quantity }) => ({
        layer: pricedLayer,
        price,
        priceSku,
        quantity,
        lineTotalCad: quantity * price.retailPriceCad,
      }));
    }

    const priceSku = getPriceSku(layer.productSku);
    const price = getMaterialPrice(layer.productSku);
    const quantity = getPricedQuantity(layer);
    const lineTotalCad = price && quantity > 0 ? quantity * price.retailPriceCad : undefined;

    return [{ layer, price, priceSku, quantity, lineTotalCad }];
  });
}

function getCleanerGroups(layers: MaterialLayer[]): Map<string, { firstIndex: number; layers: MaterialLayer[] }> {
  const groups = new Map<string, { firstIndex: number; layers: MaterialLayer[] }>();
  layers.forEach((layer, index) => {
    const key = getCleanerKey(layer.productSku);
    if (!key) return;
    const existing = groups.get(key);
    if (existing) {
      existing.layers.push(layer);
    } else {
      groups.set(key, { firstIndex: index, layers: [layer] });
    }
  });
  return groups;
}

function getCleanerKey(productSku: string): string | null {
  const normalized = normalizeSku(productSku);
  return CLEANER_PACKAGE_SKUS[normalized] ? normalized : null;
}

/**
 * Builds a purchase plan for the logical cleaner SKUs used by the calculator.
 * Required concentrate is rounded up to a whole gallon, then packed with as many
 * 5-gallon pails as possible and 1-gallon pails for the remainder. This covers
 * the requirement without rounding the purchase volume beyond the next gallon.
 *
 * Returns `null` for non-cleaner SKUs so their existing pricing behavior is kept.
 */
export function getCleanerPackagePlan(
  productSku: string,
  requiredGallons: number,
): CleanerPackageLine[] | null {
  const packageSkus = CLEANER_PACKAGE_SKUS[normalizeSku(productSku)];
  if (!packageSkus) return null;
  if (!Number.isFinite(requiredGallons) || requiredGallons <= 0) return [];

  const purchasedGallons = Math.ceil(requiredGallons);
  const fiveGallonQuantity = Math.floor(purchasedGallons / 5);
  const oneGallonQuantity = purchasedGallons % 5;
  const lines: CleanerPackageLine[] = [];

  if (fiveGallonQuantity > 0) {
    const price = priceLookup.get(normalizeSku(packageSkus.fiveGallon));
    if (price) {
      lines.push({
        price,
        priceSku: packageSkus.fiveGallon,
        quantity: fiveGallonQuantity,
        packageGallons: 5,
      });
    }
  }

  if (oneGallonQuantity > 0) {
    const price = priceLookup.get(normalizeSku(packageSkus.oneGallon));
    if (price) {
      lines.push({
        price,
        priceSku: packageSkus.oneGallon,
        quantity: oneGallonQuantity,
        packageGallons: 1,
      });
    }
  }

  return lines;
}

export function getMaterialPriceTotal(lines: PricedMaterialLine[]): number {
  return lines.reduce((sum, line) => sum + (line.lineTotalCad ?? 0), 0);
}

function getPricedQuantity(layer: MaterialLayer): number {
  if (!layer.roundedQuantity || layer.roundedQuantity <= 0) return 0;

  if (layer.productSku === 'XBOND-LIQUID' || layer.productSku === 'SEMCO-LIQUID-MEMBRANE' || layer.productSku === 'MATTE-SEALER' || layer.productSku === 'TITAN-SHIELD') {
    return Math.ceil(layer.roundedQuantity / 5);
  }

  return Math.ceil(layer.roundedQuantity);
}

function getRequiredCleanerGallons(layer: MaterialLayer): number {
  const candidates = [layer.exactQuantity, layer.roundedQuantity, layer.quantityPacks];
  return candidates.find((quantity) => Number.isFinite(quantity) && (quantity ?? 0) > 0) ?? 0;
}

function createUnpurchasedLine(layer: MaterialLayer): PricedMaterialLine {
  const priceSku = getPriceSku(layer.productSku);
  return {
    layer,
    price: getMaterialPrice(layer.productSku),
    priceSku,
    quantity: 0,
  };
}

function formatGallons(value: number): string {
  if (value < 1) return value.toFixed(2);
  if (value < 10) return value.toFixed(1);
  return value.toFixed(0);
}

function normalizeSku(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, '');
}
