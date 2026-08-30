import type { ColourTintPlan } from '@/database/schema/calculations';
import {
  buildTintRequestSummaryLines,
  canSaveMaterialRequest,
  requiresWholeGallonTintRecalculation,
} from '@/services/material-request-summary';

describe('dealer material request tint summary', () => {
  it('includes colour codes, batch counts, pigment formula, pricing, and disclaimer', () => {
    const lines = buildTintRequestSummaryLines(planFixture());
    const body = lines.join('\n');

    expect(body).toContain("Aaron's Rod (2053T)");
    expect(body).toContain('Project orders use 1-gallon and 5-gallon tint batches; quart formulas are reserved for samples.');
    expect(body).toContain('2 x 1 gallon tint batches');
    expect(body).not.toContain('1 quart tint batch');
    expect(body).toContain('formula below is per batch');
    expect(body).toContain('R S SS Exterior Red: 4/48 Y');
    expect(body).toContain('$21.66 tint charge');
    expect(body).toContain('Tint charge only; X-Bond Liquid, labour, freight, tax, and other material charges are separate.');
  });

  it('returns no section for older calculations without a tint plan', () => {
    expect(buildTintRequestSummaryLines()).toEqual([]);
  });

  it('blocks calculator-backed requests without a colour but keeps odd-item-only requests available', () => {
    const uncolouredResult = {
      layers: [],
      totalKg: 0,
      wastePct: 0,
      areaSqm: 10,
    };
    const colouredResult = { ...uncolouredResult, colourTintPlan: planFixture() };

    expect(canSaveMaterialRequest(uncolouredResult, '')).toBe(false);
    expect(canSaveMaterialRequest(uncolouredResult, 'extra trowel')).toBe(false);
    expect(canSaveMaterialRequest(colouredResult, '')).toBe(true);
    expect(canSaveMaterialRequest(undefined, 'extra trowel')).toBe(true);
  });

  it('blocks old quart job plans until they are recalculated', () => {
    const legacyPlan = legacyQuartPlanFixture();
    const result = {
      layers: [],
      totalKg: 0,
      wastePct: 0,
      areaSqm: 10,
      colourTintPlan: legacyPlan,
    };

    expect(requiresWholeGallonTintRecalculation(result)).toBe(true);
    expect(canSaveMaterialRequest(result, '')).toBe(false);
    expect(buildTintRequestSummaryLines(legacyPlan).join('\n')).toContain('RECALCULATION REQUIRED');
    expect(buildTintRequestSummaryLines(legacyPlan).join('\n')).not.toContain('formula below is per batch');
  });

  it('includes selected one-quart samples separately from project batches', () => {
    const lines = buildTintRequestSummaryLines(planWithSampleFixture());
    const body = lines.join('\n');

    expect(body).toContain('Colour samples — 1-quart sample (946 mL) each:');
    expect(body).toContain("Aaron's Rod (2053T): 1-quart sample (946 mL); $2.71 tint charge");
    expect(body).toContain('Quart sample tint-machine formula:');
    expect(body).toContain('0.25 gal for colour samples');
    expect(body).toContain('Total tint charge: $24.37');
  });
});

function planWithSampleFixture(): ColourTintPlan {
  const plan = planFixture();
  const projectBatch = plan.allocations[0].batches[0];
  const samplePigments = [{
    ...(projectBatch.pigments ?? [])[0],
    pigmentCode: 'R S SS',
    pigmentName: 'Exterior Red',
    dispenserY48: 1,
    dispenserAmount: '1/48 Y',
    tintOunces: 1 / 48,
  }];
  return {
    ...plan,
    totalTintOunces: 12.18750001,
    totalChargeCad: 24.37,
    samplePlan: {
      samples: [{
        colourId: 'col-xbond-2053t',
        colourCode: '2053T',
        colourName: "Aaron's Rod",
        formulaCode: '2053T',
        sampleSize: 'quart',
        sampleLabel: '1-quart sample (946 mL)',
        liquidGallons: 0.25,
        batch: {
          ...projectBatch,
          batchSize: 'quart',
          batchLabel: '1 quart sample',
          batchGallons: 0.25,
          quantity: 1,
          preparedGallons: 0.25,
          tintOuncesPerBatch: 1.35416667,
          totalTintOunces: 1.35416667,
          chargeCadPerBatch: 2.71,
          lineTotalCad: 2.71,
          pigments: samplePigments,
        },
        pigments: samplePigments,
        totalTintOunces: 1.35416667,
        totalChargeCad: 2.71,
        pricingStatus: 'priced',
      }],
      sampleSize: 'quart',
      sampleLabel: '1-quart sample (946 mL)',
      totalLiquidGallons: 0.25,
      totalTintOunces: 1.35416667,
      totalChargeCad: 2.71,
      isFullyPriced: true,
    },
  };
}

function legacyQuartPlanFixture(): ColourTintPlan {
  const plan = planFixture();
  const allocation = plan.allocations[0];
  return {
    ...plan,
    preparedLiquidGallons: 0.25,
    allocations: [{
      ...allocation,
      preparedLiquidGallons: 0.25,
      batches: [{
        ...allocation.batches[0],
        batchSize: 'quart',
        batchLabel: '1 quart',
        batchGallons: 0.25,
        quantity: 1,
        preparedGallons: 0.25,
      }],
    }],
  };
}

function planFixture(): ColourTintPlan {
  return {
    allocations: [{
      colourId: 'col-xbond-2053t',
      colourCode: '2053T',
      colourName: "Aaron's Rod",
      formulaCode: '2053T',
      areaSqft: 75,
      exactLiquidGallons: 2,
      preparedLiquidGallons: 2,
      batches: [{
        batchSize: 'gallon',
        batchLabel: '1 gallon',
        batchGallons: 1,
        quantity: 2,
        preparedGallons: 2,
        tintOuncesPerBatch: 5.41666667,
        totalTintOunces: 10.83333334,
        chargeCadPerBatch: 10.83,
        lineTotalCad: 21.66,
        formulaBasis: 'direct_source',
        pigments: [{
          pigmentCode: 'R S SS',
          pigmentName: 'Exterior Red',
          dispenserY48: 4,
          dispenserAmount: '4/48 Y',
          tintOunces: 4 / 48,
        }],
      }],
      pigments: [{
        pigmentCode: 'R S SS',
        pigmentName: 'Exterior Red',
        dispenserY48: 8,
        dispenserAmount: '8/48 Y',
        tintOunces: 8 / 48,
      }],
      totalTintOunces: 10.83333334,
      totalChargeCad: 21.66,
      pricingStatus: 'priced',
    }],
    exactLiquidGallons: 2,
    preparedLiquidGallons: 2,
    baseLiquidPurchaseGallons: 5,
    totalTintOunces: 10.83333334,
    totalChargeCad: 21.66,
    ratePerTintOunceCad: 2,
    pricingUnit: 'SEMCO tint-machine ounce',
    isFullyPriced: true,
  };
}
