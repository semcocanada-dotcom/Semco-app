import type { MaterialLayer } from '@/database/schema/calculations';
import {
  getCleanerPackagePlan,
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
