import type { CalculationResult, MaterialLayer } from '@/database/schema/calculations';
import {
  buildColourTintPlan,
  buildTintBatchCounts,
  ensureXBondLiquidPurchaseCoversTintPlan,
  getTintableXBondLiquidGallons,
  hasLegacyQuartTintBatch,
  hasLegacySamplePricing,
} from '@/services/tint-planning';

describe('tint batch sizing', () => {
  it.each([
    [0.25, ['1xgallon']],
    [0.2500001, ['1xgallon']],
    [1, ['1xgallon']],
    [1 + 1e-12, ['1xgallon']],
    [1.0001, ['2xgallon']],
    [1.25, ['2xgallon']],
    [1.2501, ['2xgallon']],
    [4.75, ['1xfive_gallon']],
    [5, ['1xfive_gallon']],
    [5.25, ['1xfive_gallon', '1xgallon']],
    [6.25, ['1xfive_gallon', '2xgallon']],
    [9, ['1xfive_gallon', '4xgallon']],
    [9.2, ['2xfive_gallon']],
    [10.01, ['2xfive_gallon', '1xgallon']],
  ])('packs %s gallons into project-size formulas without quarts', (gallons, expected) => {
    const batches = buildTintBatchCounts(gallons as number);
    expect(batches.map((line) => `${line.quantity}x${line.batchSize}`)).toEqual(expected);
    expect(batches.every((line) => line.batchSize !== 'quart')).toBe(true);
  });

  it('returns no project tint batches for invalid or empty amounts', () => {
    expect(buildTintBatchCounts(0)).toEqual([]);
    expect(buildTintBatchCounts(-1)).toEqual([]);
    expect(buildTintBatchCounts(Number.NaN)).toEqual([]);
  });
});

describe('colour tint allocation', () => {
  it('detects stored sample plans from older pricing or liquid-source rules', () => {
    const currentPlan = buildColourTintPlan(
      fixtureResult(75, [liquidLayer(2, 2)]),
      [{ colourId: 'col-xbond-2053t', areaSqft: 75 }],
      { includeSamples: true },
    );

    expect(currentPlan.ok).toBe(true);
    if (!currentPlan.ok) return;
    expect(currentPlan.plan.samplePlan).toMatchObject({
      pricingPolicyVersion: '2026-08-30-v2',
      liquidSource: 'ordered_project_material',
    });
    expect(hasLegacySamplePricing(currentPlan.plan)).toBe(false);
    expect(hasLegacySamplePricing({ samplePlan: undefined })).toBe(false);
    expect(hasLegacySamplePricing({
      samplePlan: {
        ...currentPlan.plan.samplePlan!,
        pricingPolicyVersion: undefined,
      },
    })).toBe(true);
    expect(hasLegacySamplePricing({
      samplePlan: {
        ...currentPlan.plan.samplePlan!,
        pricingPolicyVersion: '2026-08-30-v1',
      },
    })).toBe(true);
    expect(hasLegacySamplePricing({
      samplePlan: {
        ...currentPlan.plan.samplePlan!,
        liquidSource: undefined,
      },
    })).toBe(true);
    expect(hasLegacySamplePricing({
      samplePlan: {
        ...currentPlan.plan.samplePlan!,
        liquidSource: 'extra_sample_material' as never,
      },
    })).toBe(true);
  });

  it('prepares one five-gallon Aaron’s Rod batch for a one-colour job', () => {
    const result = fixtureResult(187.5, [liquidLayer(5, 5)]);
    const planned = buildColourTintPlan(result, [{ colourId: 'col-xbond-2053t', areaSqft: 187.5 }]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0]).toMatchObject({
      colourCode: '2053T',
      swatchHex: '#FFD077',
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
    const [fiveGallon, gallon] = planned.plan.allocations[0].batches;
    expect(fiveGallon).toMatchObject({
      batchSize: 'five_gallon',
      quantity: 1,
      pigments: expect.arrayContaining([
        expect.objectContaining({ pigmentCode: 'R S SS', dispenserY48: 20 }),
      ]),
    });
    expect(gallon).toMatchObject({
      batchSize: 'gallon',
      quantity: 1,
      pigments: expect.arrayContaining([
        expect.objectContaining({ pigmentCode: 'R S SS', dispenserY48: 4 }),
      ]),
    });
    expect(planned.plan.allocations[0].pigments).toEqual(
      expect.arrayContaining([expect.objectContaining({ pigmentCode: 'R S SS', dispenserY48: 24 })]),
    );
  });

  it('uses a direct gallon batch for a partial-gallon project volume', () => {
    const result = fixtureResult(9.375, [liquidLayer(0.25, 5)]);
    const planned = buildColourTintPlan(result, [{ colourId: 'col-xbond-2162p', areaSqft: 9.375 }]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0]).toMatchObject({
      preparedLiquidGallons: 1,
      totalChargeCad: 15.19,
      batches: [{ batchSize: 'gallon', quantity: 1, formulaBasis: 'direct_source' }],
    });
    expect(planned.plan.allocations[0].preparationNote).toBeUndefined();
  });

  it('reserves a published quart formula for samples and uses a gallon for the job', () => {
    const result = fixtureResult(9.375, [liquidLayer(0.25, 1)]);
    const planned = buildColourTintPlan(result, [{ colourId: 'col-xbond-2053t', areaSqft: 9.375 }]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0]).toMatchObject({
      exactLiquidGallons: 0.25,
      preparedLiquidGallons: 1,
      totalChargeCad: 10.83,
      batches: [{ batchSize: 'gallon', quantity: 1, formulaBasis: 'direct_source' }],
    });
    expect(planned.plan.allocations[0].batches.some((batch) => batch.batchSize === 'quart')).toBe(false);
  });

  it('adds a verified one-quart sample separately from project batches and pricing', () => {
    const result = fixtureResult(75, [liquidLayer(2, 5)]);
    const planned = buildColourTintPlan(
      result,
      [{ colourId: 'col-xbond-2053t', areaSqft: 75 }],
      { includeSamples: true },
    );

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0].batches).toEqual([
      expect.objectContaining({ batchSize: 'gallon', quantity: 2 }),
    ]);
    expect(planned.plan.samplePlan).toMatchObject({
      sampleSize: 'quart',
      sampleLabel: '1-quart sample (946 mL)',
      liquidSource: 'ordered_project_material',
      totalLiquidGallons: 0.25,
      totalPigmentChargeCad: 2.71,
      totalPreparationFeeCad: 30,
      subtotalChargeCad: 32.71,
      totalDiscountCad: 0,
      totalChargeCad: 32.71,
      isComplimentary: false,
      complimentaryThresholdSqft: 300,
      isFullyPriced: true,
      samples: [{
        colourCode: '2053T',
        sampleSize: 'quart',
        liquidGallons: 0.25,
        pigmentChargeCad: 2.71,
        preparationFeeCad: 30,
        subtotalChargeCad: 32.71,
        discountCad: 0,
        totalChargeCad: 32.71,
        isComplimentary: false,
        batch: { batchSize: 'quart', batchLabel: '1 quart sample', quantity: 1 },
      }],
    });
    expect(planned.plan.totalChargeCad).toBe(54.37);
    expect(hasLegacyQuartTintBatch(planned.plan)).toBe(false);
  });

  it('charges samples at 299.99 sq ft and waives both fees at exactly 300 sq ft', () => {
    const belowThreshold = buildColourTintPlan(
      fixtureResult(299.99, [liquidLayer(1, 1)]),
      [{ colourId: 'col-xbond-2053t', areaSqft: 299.99 }],
      { includeSamples: true },
    );
    const atThreshold = buildColourTintPlan(
      fixtureResult(300, [liquidLayer(1, 1)]),
      [{ colourId: 'col-xbond-2053t', areaSqft: 300 }],
      { includeSamples: true },
    );

    expect(belowThreshold.ok).toBe(true);
    expect(atThreshold.ok).toBe(true);
    if (!belowThreshold.ok || !atThreshold.ok) return;

    expect(belowThreshold.plan.samplePlan).toMatchObject({
      totalPigmentChargeCad: 2.71,
      totalPreparationFeeCad: 30,
      subtotalChargeCad: 32.71,
      totalDiscountCad: 0,
      totalChargeCad: 32.71,
      isComplimentary: false,
      samples: [{
        pigmentChargeCad: 2.71,
        preparationFeeCad: 30,
        subtotalChargeCad: 32.71,
        discountCad: 0,
        totalChargeCad: 32.71,
        isComplimentary: false,
      }],
    });
    expect(atThreshold.plan.samplePlan).toMatchObject({
      totalPigmentChargeCad: 2.71,
      totalPreparationFeeCad: 30,
      subtotalChargeCad: 32.71,
      totalDiscountCad: 32.71,
      totalChargeCad: 0,
      isComplimentary: true,
      samples: [{
        pigmentChargeCad: 2.71,
        preparationFeeCad: 30,
        subtotalChargeCad: 32.71,
        discountCad: 32.71,
        totalChargeCad: 0,
        isComplimentary: true,
      }],
    });
    expect(belowThreshold.plan.allocations[0].totalChargeCad).toBe(10.83);
    expect(atThreshold.plan.allocations[0].totalChargeCad).toBe(10.83);
    expect(belowThreshold.plan.totalChargeCad).toBe(43.54);
    expect(atThreshold.plan.totalChargeCad).toBe(10.83);
    expect(atThreshold.plan.samplePlan?.totalLiquidGallons).toBe(0.25);
    expect(atThreshold.plan.samplePlan?.liquidSource).toBe('ordered_project_material');
    expect(atThreshold.plan.baseLiquidPurchaseGallons).toBe(1);
  });

  it('requires dealer review when a published quart sample formula is unavailable', () => {
    const result = fixtureResult(37.5, [liquidLayer(1, 1)]);
    const planned = buildColourTintPlan(
      result,
      [{ colourId: 'col-xbond-2162p', areaSqft: 37.5 }],
      { includeSamples: true },
    );

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.allocations[0]).toMatchObject({ pricingStatus: 'priced' });
    expect(planned.plan.samplePlan?.samples[0]).toMatchObject({
      sampleSize: 'quart',
      pricingStatus: 'dealer_review',
      preparationFeeCad: 30,
      discountCad: 0,
      totalChargeCad: undefined,
      isComplimentary: false,
    });
    expect(planned.plan.samplePlan?.samples[0].batch).toBeUndefined();
    expect(planned.plan.samplePlan?.samples[0].reviewReason).toContain('published 1-quart sample formula');
    expect(planned.plan.samplePlan).toMatchObject({
      totalPigmentChargeCad: undefined,
      totalPreparationFeeCad: 30,
      subtotalChargeCad: undefined,
      totalDiscountCad: 0,
      totalChargeCad: undefined,
      isComplimentary: false,
    });
    expect(planned.plan.isFullyPriced).toBe(false);
    expect(planned.plan.totalChargeCad).toBeUndefined();
  });

  it('keeps a complimentary dealer-review sample flagged while making its final charge zero', () => {
    const planned = buildColourTintPlan(
      fixtureResult(300, [liquidLayer(1, 2)]),
      [{ colourId: 'col-xbond-2162p', areaSqft: 300 }],
      { includeSamples: true },
    );

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.samplePlan?.samples[0]).toMatchObject({
      pricingStatus: 'dealer_review',
      preparationFeeCad: 30,
      discountCad: undefined,
      totalChargeCad: 0,
      isComplimentary: true,
    });
    expect(planned.plan.samplePlan).toMatchObject({
      totalPigmentChargeCad: undefined,
      totalPreparationFeeCad: 30,
      subtotalChargeCad: undefined,
      totalDiscountCad: undefined,
      totalChargeCad: 0,
      isComplimentary: true,
      isFullyPriced: false,
    });
    expect(planned.plan.isFullyPriced).toBe(false);
    expect(planned.plan.allocations[0].totalChargeCad).toBe(15.19);
    expect(planned.plan.totalChargeCad).toBe(15.19);
  });

  it('creates one separate quart sample for every selected project colour', () => {
    const result = fixtureResult(187.5, [liquidLayer(5, 5)]);
    const planned = buildColourTintPlan(
      result,
      [
        { colourId: 'col-xbond-2053t', areaSqft: 75 },
        { colourId: 'col-xbond-2383d', areaSqft: 112.5 },
      ],
      { includeSamples: true },
    );

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.samplePlan).toMatchObject({
      liquidSource: 'ordered_project_material',
      totalLiquidGallons: 0.5,
      totalPigmentChargeCad: 4.13,
      totalPreparationFeeCad: 60,
      subtotalChargeCad: 64.13,
      totalDiscountCad: 0,
      totalChargeCad: 64.13,
      samples: [
        { colourCode: '2053T', preparationFeeCad: 30, totalChargeCad: 32.71 },
        { colourCode: '2383D', preparationFeeCad: 30, totalChargeCad: 31.42 },
      ],
    });
    expect(planned.plan.preparedLiquidGallons).toBe(5);
    expect(planned.plan.baseLiquidPurchaseGallons).toBe(5);
    expect(planned.plan.totalChargeCad).toBe(104.3);
  });

  it('does not add sample liquid or charges when samples are not requested', () => {
    const planned = buildColourTintPlan(
      fixtureResult(75, [liquidLayer(2, 2)]),
      [{ colourId: 'col-xbond-2053t', areaSqft: 75 }],
    );

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.samplePlan).toBeUndefined();
    expect(planned.plan.baseLiquidPurchaseGallons).toBe(2);
    expect(planned.plan.allocations[0].totalChargeCad).toBe(21.66);
    expect(planned.plan.totalChargeCad).toBe(21.66);
  });

  it('uses the direct five-gallon formula when a project amount rounds to five gallons', () => {
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

  it('rounds each project colour independently to whole gallons', () => {
    const result = fixtureResult(100, [liquidLayer(4.9, 5)]);
    const planned = buildColourTintPlan(result, [
      { colourId: 'col-xbond-2053t', areaSqft: 33.33 },
      { colourId: 'col-xbond-2383d', areaSqft: 33.33 },
      { colourId: 'col-xbond-2397d', areaSqft: 33.34 },
    ]);

    expect(planned.ok).toBe(true);
    if (!planned.ok) return;
    expect(planned.plan.preparedLiquidGallons).toBe(6);
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
