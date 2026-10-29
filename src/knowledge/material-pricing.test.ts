import type { MaterialLayer } from '@/database/schema/calculations';
import { STOCKED_SEALERS } from '@/constants/stocked-sealers';
import {
  getCleanerPackagePlan,
  getMaterialPrice,
  getMaterialPriceTotal,
  priceMaterialLayers,
} from '@/knowledge/material-pricing';
import { calculate } from '@/services/calculator';

function cleanerLayer(productSku: string, exactGallons?: number, roundedGallons?: number): MaterialLayer {
  return {
    productId: productSku.toLowerCase(),
    productSku,
    productName: productSku,
    category: 'prep',
    coats: 0,
    quantityKg: 0,
    quantityPacks: 0,
    packSizeKg: 0,
    coverageRateSqmPerKg: 0,
    exactQuantity: exactGallons,
    roundedQuantity: roundedGallons,
  };
}

describe('cleaner package pricing', () => {
  it('buys one 1-gallon pail for a sub-gallon requirement', () => {
    const lines = priceMaterialLayers([cleanerLayer('STONE-SOAP', 0.2)]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ priceSku: 'SS101', quantity: 1, lineTotalCad: 116.92 });
    expect(lines[0].price?.size).toBe('1 gallon pail');
  });

  it('uses 1-gallon pails when they exactly cover a 1-to-5 gallon requirement', () => {
    const lines = priceMaterialLayers([cleanerLayer('POWER-CLEANER', 3)]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ priceSku: 'PC 201', quantity: 3 });
    expect(lines[0].lineTotalCad).toBeCloseTo(352.8, 2);
  });

  it('uses one 5-gallon pail when the rounded requirement is five gallons', () => {
    const lines = priceMaterialLayers([cleanerLayer('STONE-SOAP', 4.2)]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ priceSku: 'SS105', quantity: 1, lineTotalCad: 584.51 });
    expect(lines[0].price?.size).toBe('5 gallon pail');
  });

  it('combines 5-gallon and 1-gallon packages above five gallons', () => {
    const lines = priceMaterialLayers([cleanerLayer('STONE-SOAP', 6.2)]);

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ priceSku: 'SS105', quantity: 1, lineTotalCad: 584.51 });
    expect(lines[1]).toMatchObject({ priceSku: 'SS101', quantity: 2, lineTotalCad: 233.84 });
    expect(getMaterialPriceTotal(lines)).toBeCloseTo(818.35, 2);
  });

  it('combines repeated cleaner passes before choosing packages', () => {
    const lines = priceMaterialLayers([
      cleanerLayer('POWER-CLEANER', 0.55),
      cleanerLayer('NU-LIFT', 0.8),
      cleanerLayer('POWER-CLEANER', 0.35),
    ]);

    const powerLines = lines.filter((line) => line.layer.productSku === 'POWER-CLEANER');
    expect(powerLines).toHaveLength(1);
    expect(powerLines[0]).toMatchObject({ priceSku: 'PC 201', quantity: 1, lineTotalCad: 117.6 });
    expect(powerLines[0].layer.exactQuantity).toBeCloseTo(0.9, 4);
  });

  it('uses multiple 5-gallon pails plus the remaining 1-gallon quantity', () => {
    const plan = getCleanerPackagePlan('NU-LIFT', 12.1);

    expect(plan).toMatchObject([
      { priceSku: 'NL 105', quantity: 2, packageGallons: 5 },
      { priceSku: 'NL 101', quantity: 3, packageGallons: 1 },
    ]);
    expect(plan?.[0].price.retailPriceCad).toBe(508.98);
    expect(plan?.[1].price.retailPriceCad).toBe(101.84);
  });

  it('prices a cleaner when only exact gallons are supplied', () => {
    const [line] = priceMaterialLayers([cleanerLayer('NU-LIFT', 0.5)]);

    expect(line.quantity).toBe(1);
    expect(line.lineTotalCad).toBe(101.84);
  });

  it('falls back to rounded gallons when exact gallons are absent', () => {
    const [line] = priceMaterialLayers([cleanerLayer('POWER-CLEANER', undefined, 5)]);

    expect(line).toMatchObject({ priceSku: 'PC 205', quantity: 1, lineTotalCad: 590 });
  });

  it('uses the priced 5-gallon and 1-gallon Liquid Membrane SKUs together', () => {
    const membrane = {
      ...cleanerLayer('SEMCO-LIQUID-MEMBRANE', 5.1, 6),
      productName: 'Liquid Membrane',
      category: 'membrane',
    };

    const lines = priceMaterialLayers([membrane]);

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({
      priceSku: 'XME805',
      packageLabel: '5 gallon pail',
      quantity: 1,
      lineTotalCad: 721,
    });
    expect(lines[1]).toMatchObject({
      priceSku: 'XME801',
      packageLabel: '1 gallon pail',
      quantity: 1,
      lineTotalCad: 189.61,
    });
    expect(lines[1].price?.retailPriceCad).toBe(189.61);
  });

  it('does not create a purchase for zero or invalid cleaner quantities', () => {
    expect(getCleanerPackagePlan('STONE-SOAP', 0)).toEqual([]);
    expect(getCleanerPackagePlan('STONE-SOAP', Number.NaN)).toEqual([]);
    expect(getCleanerPackagePlan('XBOND-STONE', 2)).toBeNull();
    expect(priceMaterialLayers([cleanerLayer('STONE-SOAP')])[0].quantity).toBe(0);
  });
});

describe('Liquid Membrane package pricing', () => {
  it('keeps a two-gallon requirement as two XME801 pails', () => {
    const membrane = {
      ...cleanerLayer('SEMCO-LIQUID-MEMBRANE', 1.9, 2),
      productName: 'Liquid Membrane',
      category: 'membrane',
    };

    const lines = priceMaterialLayers([membrane]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      priceSku: 'XME801',
      packageLabel: '1 gallon pail',
      quantity: 2,
      lineTotalCad: 379.22,
    });
    expect(lines[0].price?.retailPriceCad).toBe(189.61);
  });

  it('retains the authoritative XME805 price for an exact five-gallon purchase', () => {
    const membrane = {
      ...cleanerLayer('SEMCO-LIQUID-MEMBRANE', 5, 5),
      productName: 'Liquid Membrane',
      category: 'membrane',
    };

    const [line] = priceMaterialLayers([membrane]);

    expect(line).toMatchObject({
      priceSku: 'XME805',
      packageLabel: '5 gallon pail',
      quantity: 1,
      lineTotalCad: 721,
    });
    expect(line.price?.retailPriceCad).toBe(721);
  });
});

describe('Fabric Reinforcement pricing', () => {
  it('prices the 6 in x 75 ft wet-area roll at the confirmed Canadian price', () => {
    const result = calculate({
      areaSqft: 150,
      substrateType: 'plywood',
      wastePct: 10,
      installationScope: 'wet_area',
    });
    const fabric = result.layers.find((layer) => layer.productSku === 'FR675');
    const [line] = priceMaterialLayers([fabric!]);

    expect(line).toMatchObject({ priceSku: 'FR675', quantity: 1, lineTotalCad: 92.14 });
    expect(line.price).toMatchObject({
      product: 'Fabric Reinforcement',
      size: '6 in x 75 ft roll',
      retailPriceCad: 92.14,
    });
  });

  it('prices every manually selected fabric roll at $92.14', () => {
    const result = calculate({
      areaSqft: 150,
      substrateType: 'plywood',
      wastePct: 10,
      installationScope: 'wet_area',
      fabricRolls: 3,
    });
    const fabric = result.layers.find((layer) => layer.productSku === 'FR675');
    const [line] = priceMaterialLayers([fabric!]);

    expect(line).toMatchObject({ priceSku: 'FR675', quantity: 3, lineTotalCad: 276.42 });
  });
});

describe('X-Bond Liquid package pricing', () => {
  it('uses one priced 5-gallon pail and one priced 1-gallon pail for six gallons', () => {
    const liquid = {
      ...cleanerLayer('XBOND-LIQUID', 5.25, 6),
      productName: 'X-Bond Liquid',
      category: 'x_bond_liquid',
    };

    const lines = priceMaterialLayers([liquid]);

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({
      priceSku: 'XB805',
      packageLabel: '5 gallon pail',
      quantity: 1,
      lineTotalCad: 623.57,
    });
    expect(lines[1]).toMatchObject({
      priceSku: 'XB801',
      packageLabel: '1 gallon pail',
      quantity: 1,
      lineTotalCad: 154.82,
    });
    expect(lines[1].price?.retailPriceCad).toBe(154.82);
    expect(getMaterialPriceTotal(lines)).toBeCloseTo(778.39, 2);
  });
});

describe('Matte sealer package pricing', () => {
  it('prices the recommended 1-gallon pail for a 100 sq ft Matte calculation', () => {
    const result = calculate({
      areaSqft: 100,
      substrateType: 'gypsum_board',
      installationScope: 'non_wet_wall',
      wastePct: 10,
      sealerSku: 'MATTE-SEALER',
    });
    const matte = result.layers.find((layer) => layer.productSku === 'MATTE-SEALER');

    expect(matte).toMatchObject({
      roundedQuantity: 1,
      purchaseLabel: 'Buy 1 x 1 gal pail',
    });

    const [line] = priceMaterialLayers([matte!]);

    expect(line).toMatchObject({ priceSku: 'MS601', quantity: 1, lineTotalCad: 266 });
    expect(line.price).toMatchObject({ size: '1 gallon pail', retailPriceCad: 266 });
  });

  it('keeps the 5-gallon Matte SKU when the calculation genuinely needs that package', () => {
    const result = calculate({
      areaSqft: 1000,
      substrateType: 'concrete',
      wastePct: 10,
      sealerSku: 'MATTE-SEALER',
    });
    const matte = result.layers.find((layer) => layer.productSku === 'MATTE-SEALER');

    expect(matte).toMatchObject({
      roundedQuantity: 5,
      purchaseLabel: 'Buy 1 x 5 gal pail',
    });

    const [line] = priceMaterialLayers([matte!]);

    expect(line).toMatchObject({ priceSku: 'MS605', quantity: 1, lineTotalCad: 1057.97 });
    expect(line.price?.size).toBe('5 gallon pail');
  });
});

describe('Natural Shield package pricing', () => {
  it('prices the screenshot pool as twelve 5-gallon pails, not sixty pails', () => {
    const result = calculate({
      areaSqft: 9800,
      substrateType: 'pool',
      wastePct: 0,
      fabricRolls: 5,
    });
    const naturalShield = result.layers.find((layer) => layer.productSku === 'NATURAL-SHIELD');
    const lines = priceMaterialLayers(result.layers);
    const naturalShieldLines = lines.filter((line) => line.layer.productSku === 'NATURAL-SHIELD');

    expect(naturalShield).toMatchObject({
      exactQuantity: 56,
      roundedQuantity: 60,
      quantityLabel: '56 gal',
      purchaseLabel: 'Buy 12 x 5 gal pails (60 gal)',
    });
    expect(naturalShieldLines).toHaveLength(1);
    expect(naturalShieldLines[0]).toMatchObject({
      priceSku: 'NAS505',
      packageLabel: '5 gallon pail',
      quantity: 12,
      price: { size: '5 gallon pail', retailPriceCad: 838.55 },
    });
    expect(naturalShieldLines[0].lineTotalCad).toBeCloseTo(10062.60, 2);

    // Pricing this previously missing sealer must not change the other screenshot rows.
    expect(lines.filter((line) => line.layer.productSku !== 'NATURAL-SHIELD').map((line) => ({
      priceSku: line.priceSku,
      quantity: line.quantity,
      total: Number(line.lineTotalCad?.toFixed(2)),
    }))).toEqual([
      { priceSku: 'PC 205', quantity: 13, total: 7670 },
      { priceSku: 'PC 201', quantity: 1, total: 117.60 },
      { priceSku: 'NL 105', quantity: 9, total: 4580.82 },
      { priceSku: 'NL 101', quantity: 4, total: 407.36 },
      { priceSku: 'FR675', quantity: 5, total: 460.70 },
      { priceSku: 'XBT50', quantity: 131, total: 17994.16 },
      { priceSku: 'XB805', quantity: 53, total: 33049.21 },
      { priceSku: 'XME805', quantity: 31, total: 22351 },
      { priceSku: 'XME801', quantity: 2, total: 379.22 },
    ]);
    expect(lines.every((line) => line.quantity === 0 || line.price)).toBe(true);
  });

  it('prices one 1-gallon pail for a small Natural Shield calculation', () => {
    const result = calculate({
      areaSqft: 100,
      substrateType: 'concrete',
      wastePct: 0,
      sealerSku: 'NATURAL-SHIELD',
    });
    const naturalShield = result.layers.find((layer) => layer.productSku === 'NATURAL-SHIELD');
    const lines = priceMaterialLayers([naturalShield!]);

    expect(naturalShield).toMatchObject({
      roundedQuantity: 1,
      purchaseLabel: 'Buy 1 x 1 gal pail',
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      priceSku: 'NAS501',
      packageLabel: '1 gallon pail',
      quantity: 1,
      lineTotalCad: 211.70,
      price: { size: '1 gallon pail', retailPriceCad: 211.70 },
    });
  });

  it('prices an exact five-gallon requirement as one 5-gallon pail', () => {
    const result = calculate({
      areaSqft: 1125,
      substrateType: 'concrete',
      wastePct: 0,
      sealerSku: 'NATURAL-SHIELD',
    });
    const naturalShield = result.layers.find((layer) => layer.productSku === 'NATURAL-SHIELD');
    const lines = priceMaterialLayers([naturalShield!]);

    expect(naturalShield).toMatchObject({ exactQuantity: 5, roundedQuantity: 5 });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ priceSku: 'NAS505', quantity: 1, lineTotalCad: 838.55 });
  });

  it('preserves a saved six-gallon purchase as one 5-gallon plus one 1-gallon pail', () => {
    const layer = {
      ...cleanerLayer('NATURAL-SHIELD', 5.1, 6),
      productName: 'SEMCO Natural Shield',
      category: 'sealer',
    };
    const lines = priceMaterialLayers([layer]);

    expect(lines).toMatchObject([
      { priceSku: 'NAS505', quantity: 1, packageLabel: '5 gallon pail', lineTotalCad: 838.55 },
      { priceSku: 'NAS501', quantity: 1, packageLabel: '1 gallon pail', lineTotalCad: 211.70 },
    ]);
    expect(getMaterialPriceTotal(lines)).toBeCloseTo(1050.25, 2);
  });

  it('does not create a Natural Shield purchase for a zero quantity', () => {
    const lines = priceMaterialLayers([cleanerLayer('NATURAL-SHIELD', 0, 0)]);

    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ priceSku: 'NAS501', quantity: 0 });
    expect(lines[0].lineTotalCad).toBeUndefined();
    expect(getMaterialPriceTotal(lines)).toBe(0);
  });

  it('has an approved price for every current stocked sealer alias', () => {
    for (const sealer of STOCKED_SEALERS) {
      expect(getMaterialPrice(sealer.sku)?.retailPriceCad).toBeGreaterThan(0);
    }
    expect(getMaterialPrice('NAS501')).toMatchObject({
      retailPriceCad: 211.70,
      source: 'Semco Canada approved derived pricing 2026-09-10',
    });
    expect(getMaterialPrice('NAS505')).toMatchObject({
      retailPriceCad: 838.55,
      source: 'Semco Canada approved derived pricing 2026-09-10',
    });
  });
});
