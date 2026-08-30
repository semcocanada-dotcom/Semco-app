import type { CalculationResult, MaterialLayer } from '@/database/schema/calculations';
import {
  buildColourTintPlan,
  buildTintBatchCounts,
  ensureXBondLiquidPurchaseCoversTintPlan,
  getTintableXBondLiquidGallons,
} from '@/services/tint-planning';

describe('tint batch sizing', () => {
  it.each([
    [0.25, ['1xquart']],
    [0.2500001, ['2xquart']],
    [1.25 + 1e-12, ['1xgallon', '1xquart']],
    [1.2501, ['1xgallon', '2xquart']],
    [4.75, ['4xgallon', '3xquart']],
    [5, ['1xfive_gallon']],
    [5.25, ['1xfive_gallon', '1xquart']],
    [6.25, ['1xfive_gallon', '1xgallon', '1xquart']],
  ])('packs %s gallons into exact formula sizes', (gallons, expected) => {
    expect(buildTintBatchCounts(gallons as number).map((line) => `${line.quantity}x${line.batchSize}`)).toEqual(expected);
  });
});

describe('colour tint allocation', () => {
  it('prepares one five-gallon Aaron’s Rod batch for a one-colour job', () => {
    const result = fixtureResult(187.5, [liquidLayer(5, 5)]);
    const planned = buildColourTintPlan(result, [{ colourId: 'col-xbond-2053t', areaSqft: 187.5 }]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0]).toMatchObject({
      colourCode: '2053T',
      exactLiquidGallons: 5,
      preparedLiquidGallons: 5,
      totalChargeCad: 54.17,
      batches: [{ batchSize: 'five_gallon', quantity: 1, lineTotalCad: 54.17 }],
    });
    expect(planned.plan.totalChargeCad).toBe(54.17);
  });

  it('splits liquid and tint charges by each colour area', () => {
    const result = fixtureResult(187.5, [liquidLayer(5, 5)]);
    const planned = buildColourTintPlan(result, [
      { colourId: 'col-xbond-2053t', areaSqft: 75 },
      { colourId: 'col-xbond-2383d', areaSqft: 112.5 },
    ]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0]).toMatchObject({
      exactLiquidGallons: 2,
      batches: [{ batchSize: 'gallon', quantity: 2 }],
      totalChargeCad: 21.66,
    });
    expect(planned.plan.allocations[1]).toMatchObject({
      exactLiquidGallons: 3,
      batches: [{ batchSize: 'gallon', quantity: 3 }],
      totalChargeCad: 18.51,
    });
    expect(planned.plan.totalChargeCad).toBe(40.17);
  });

  it('keeps machine formulas separate for each direct batch size', () => {
    const result = fixtureResult(196.875, [liquidLayer(5.25, 6)]);
    const planned = buildColourTintPlan(result, [{ colourId: 'col-xbond-2053t', areaSqft: 196.875 }]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    const [fiveGallon, quart] = planned.plan.allocations[0].batches;
    expect(fiveGallon).toMatchObject({
      batchSize: 'five_gallon',
      quantity: 1,
      pigments: expect.arrayContaining([
        expect.objectContaining({ pigmentCode: 'R S SS', dispenserY48: 20 }),
      ]),
    });
    expect(quart).toMatchObject({
      batchSize: 'quart',
      quantity: 1,
      pigments: expect.arrayContaining([
        expect.objectContaining({ pigmentCode: 'R S SS', dispenserY48: 1 }),
      ]),
    });
    expect(planned.plan.allocations[0].pigments).toEqual(
      expect.arrayContaining([expect.objectContaining({ pigmentCode: 'R S SS', dispenserY48: 21 })]),
    );
  });

  it('uses a direct gallon batch when the source quart formula is unpublished', () => {
    const result = fixtureResult(9.375, [liquidLayer(0.25, 5)]);
    const planned = buildColourTintPlan(result, [{ colourId: 'col-xbond-2162p', areaSqft: 9.375 }]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0]).toMatchObject({
      preparedLiquidGallons: 1,
      totalChargeCad: 15.19,
      batches: [{ batchSize: 'gallon', quantity: 1, formulaBasis: 'direct_source' }],
    });
    expect(planned.plan.allocations[0].preparationNote).toContain('does not publish a quart dispenser formula');
  });

  it('uses the direct five-gallon formula when an unpublished quart remainder rounds the batch to five gallons', () => {
    const result = fixtureResult(178.125, [liquidLayer(4.75, 5)]);
    const planned = buildColourTintPlan(result, [{ colourId: 'col-xbond-2162p', areaSqft: 178.125 }]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0]).toMatchObject({
      preparedLiquidGallons: 5,
      totalChargeCad: 75.75,
      batches: [{ batchSize: 'five_gallon', quantity: 1, formulaBasis: 'direct_source' }],
    });
  });

  it('sums multiple X-Bond Liquid layers before allocating tint', () => {
    const result = fixtureResult(187.5, [liquidLayer(4, 5), liquidLayer(1, 5)]);

    expect(getTintableXBondLiquidGallons(result)).toBe(5);
    const planned = buildColourTintPlan(result, [{ colourId: 'col-xbond-2053t', areaSqft: 187.5 }]);
    expect(planned.ok && planned.plan.exactLiquidGallons).toBe(5);
  });

  it('merges duplicate colour rows before rounding to tint batches', () => {
    const result = fixtureResult(100, [liquidLayer(2, 5)]);
    const planned = buildColourTintPlan(result, [
      { colourId: 'col-xbond-2053t', areaSqft: 25 },
      { colourId: 'col-xbond-2053t', areaSqft: 75 },
    ]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations).toHaveLength(1);
    expect(planned.plan.allocations[0]).toMatchObject({ areaSqft: 100, preparedLiquidGallons: 2 });
  });

  it('rejects under-allocated, over-allocated, and invalid colour areas', () => {
    const result = fixtureResult(100, [liquidLayer(2, 5)]);

    expect(buildColourTintPlan(result, [{ colourId: 'col-xbond-2053t', areaSqft: 90 }])).toMatchObject({ ok: false });
    expect(buildColourTintPlan(result, [{ colourId: 'col-xbond-2053t', areaSqft: 110 }])).toMatchObject({ ok: false });
    expect(buildColourTintPlan(result, [{ colourId: 'col-xbond-2053t', areaSqft: 0 }])).toMatchObject({ ok: false });
  });

  it('marks an unknown/custom colour for dealer review rather than pricing it at zero', () => {
    const result = fixtureResult(100, [liquidLayer(2, 5)]);
    const planned = buildColourTintPlan(result, [{ colourId: 'custom-colour', areaSqft: 100 }]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan).toMatchObject({ isFullyPriced: false, totalChargeCad: undefined });
    expect(planned.plan.allocations[0]).toMatchObject({ pricingStatus: 'dealer_review' });
    expect(planned.plan.allocations[0].totalChargeCad).toBeUndefined();
  });

  it('uses a 1-gallon pail for the remainder when per-colour rounding exceeds five gallons', () => {
    const result = fixtureResult(100, [liquidLayer(4.9, 5)]);
    const planned = buildColourTintPlan(result, [
      { colourId: 'col-xbond-2053t', areaSqft: 33.33 },
      { colourId: 'col-xbond-2383d', areaSqft: 33.33 },
      { colourId: 'col-xbond-2397d', areaSqft: 33.34 },
    ]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.preparedLiquidGallons).toBe(5.25);
    expect(planned.plan.baseLiquidPurchaseGallons).toBe(6);
    const adjusted = ensureXBondLiquidPurchaseCoversTintPlan(result.layers, planned.plan.preparedLiquidGallons);
    expect(adjusted[0]).toMatchObject({
      roundedQuantity: 6,
      purchaseLabel: 'Buy 1 x 5 gal pail + 1 x 1 gal pail (6 gal)',
    });
  });

  it('keeps display colour and source formula codes in the snapshot', () => {
    const planned = buildColourTintPlan(
      fixtureResult(100, [liquidLayer(2, 5)]),
      [{ colourId: 'col-xbond-2664d', areaSqft: 100 }],
    );

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0]).toMatchObject({ colourCode: '2664D', formulaCode: '2464D' });
  });
});

function fixtureResult(areaSqft: number, layers: MaterialLayer[]): CalculationResult {
  return {
    layers,
    totalKg: 0,
    wastePct: 0,
    areaSqm: areaSqft / 10.7639104167,
    areaSqft,
  };
}

function liquidLayer(exactQuantity: number, roundedQuantity: number): MaterialLayer {
  return {
    productId: 'xbond-liquid',
    productSku: 'XBOND-LIQUID',
    productName: 'SEMCO X-Bond Liquid',
    category: 'x_bond_liquid',
    coats: 1,
    quantityKg: 0,
    quantityPacks: roundedQuantity,
    packSizeKg: 0,
    coverageRateSqmPerKg: 0,
    exactQuantity,
    roundedQuantity,
  };
}
