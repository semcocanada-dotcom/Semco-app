import type { ColourTintPlan } from '@/database/schema/calculations';
import {
  buildTintRequestSummaryLines,
  canSaveMaterialRequest,
} from '@/services/material-request-summary';

describe('dealer material request tint summary', () => {
  it('includes colour codes, batch counts, pigment formula, pricing, and disclaimer', () => {
    const lines = buildTintRequestSummaryLines(planFixture());
    const body = lines.join('\n');

    expect(body).toContain("Aaron's Rod (2053T)");
    expect(body).toContain('2 x 1 gallon tint batches');
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
});

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
