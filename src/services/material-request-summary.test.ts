import type { ColourTintPlan } from '@/database/schema/calculations';
import { COLOUR_SAMPLE_PRICING_POLICY_VERSION } from '@/knowledge/sample-pricing';
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
    expect(body).toContain('Project orders use 1-gallon and 5-gallon tint batches.');
    expect(body).not.toContain('dealer sample stock');
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
    const lines = buildTintRequestSummaryLines(currentSamplePlanFixture(false));
    const body = lines.join('\n');

    expect(body).toContain('Colour samples — 1-quart sample (946 mL) each:');
    expect(body).toContain('Each sample is a $40 flat rate including a prepared X-Bond quart and pigment from dealer sample stock, so no extra project pail is added.');
    expect(body).toContain("Aaron's Rod (2053T): 1-quart sample (946 mL); $40 flat rate (prepared X-Bond + pigment included); sample total $40.00");
    expect(body).toContain('Quart sample tint-machine formula:');
    expect(body).toContain('5 gal staged for purchase. Sample quarts come from dealer sample stock; no additional X-Bond Liquid or pail is added to the project order.');
    expect(body).not.toContain('gal for colour samples');
    expect(body).toContain('Sample pricing: Flat rates $40.00; prepared X-Bond + pigment included; sample total $40.00.');
    expect(body).toContain('The $40 per-sample flat rate includes one prepared quart of X-Bond Liquid and its pigment.');
    expect(body).toContain('Production pigment charging is unchanged.');
    expect(body).toContain('Total colour charges: $61.66');
    expect(body).not.toContain('$42.71');
  });

  it('waives the full $40 sample fee at 500 square feet', () => {
    const body = buildTintRequestSummaryLines(currentSamplePlanFixture(true)).join('\n');

    expect(body).toContain('$40 flat rate (prepared X-Bond + pigment included); FREE — $40.00 sample fee waived; sample total $0.00');
    expect(body).toContain('$40.00 sample fees waived; FREE at 500 sq ft or more; sample total $0.00.');
    expect(body).toContain('Total colour charges: $21.66');
  });

  it('keeps formula review visible when the full sample fee is waived', () => {
    const body = buildTintRequestSummaryLines(complimentaryReviewSampleFixture()).join('\n');

    expect(body).toContain('$40 flat rate (prepared X-Bond + pigment included); FREE — $40.00 sample fee waived; sample total $0.00');
    expect(body).toContain('Review: Published quart formula requires dealer review.');
    expect(body).toContain('Total colour charges: $21.66');
  });

  it('charges $40 for every selected sample and waives every fee at the threshold', () => {
    const paidBody = buildTintRequestSummaryLines(multipleSamplePlanFixture(false)).join('\n');
    const freeBody = buildTintRequestSummaryLines(multipleSamplePlanFixture(true)).join('\n');

    expect(paidBody).toContain("Aaron's Rod (2053T): 1-quart sample (946 mL); $40 flat rate");
    expect(paidBody).toContain('Alexys (2383D): 1-quart sample (946 mL); $40 flat rate');
    expect(paidBody).toContain('Sample pricing: Flat rates $80.00');
    expect(paidBody).toContain('Total colour charges: $101.66');
    expect(freeBody.match(/FREE — \$40\.00 sample fee waived/g)).toHaveLength(2);
    expect(freeBody).toContain('$80.00 sample fees waived; FREE at 500 sq ft or more; sample total $0.00.');
    expect(freeBody).toContain('Total colour charges: $21.66');
  });

  it('blocks legacy pigment-only sample pricing without inventing the new fee', () => {
    const plan = legacySamplePlanFixture();
    const result = {
      layers: [],
      totalKg: 0,
      wastePct: 0,
      areaSqm: 10,
      colourTintPlan: plan,
    };
    const body = buildTintRequestSummaryLines(plan).join('\n');

    expect(requiresWholeGallonTintRecalculation(result)).toBe(true);
    expect(canSaveMaterialRequest(result, '')).toBe(false);
    expect(body).toContain('RECALCULATION REQUIRED');
    expect(body).not.toContain('$2.71');
    expect(body).not.toContain('$40 flat rate (prepared X-Bond + pigment included)');
  });

  it('blocks saved v2 sample plans so they cannot retain the superseded fee and liquid source', () => {
    const plan = currentSamplePlanFixture(false);
    plan.samplePlan = {
      ...plan.samplePlan!,
      pricingPolicyVersion: '2026-08-30-v2',
      liquidSource: 'ordered_project_material',
    };
    const result = {
      layers: [],
      totalKg: 0,
      wastePct: 0,
      areaSqm: 10,
      colourTintPlan: plan,
    };

    expect(requiresWholeGallonTintRecalculation(result)).toBe(true);
    expect(canSaveMaterialRequest(result, '')).toBe(false);
    expect(buildTintRequestSummaryLines(plan).join('\n')).toContain('RECALCULATION REQUIRED');
  });
});

function legacySamplePlanFixture(): ColourTintPlan {
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

function currentSamplePlanFixture(isSampleComplimentary: boolean): ColourTintPlan {
  const legacy = legacySamplePlanFixture();
  const legacySamplePlan = legacy.samplePlan!;
  const legacySample = legacySamplePlan.samples[0];
  const sampleTotalCad = isSampleComplimentary ? 0 : 40;
  return {
    ...legacy,
    totalChargeCad: 21.66 + sampleTotalCad,
    samplePlan: {
      ...legacySamplePlan,
      pricingPolicyVersion: COLOUR_SAMPLE_PRICING_POLICY_VERSION,
      liquidSource: 'dealer_sample_stock',
      totalFlatRateCad: 40,
      subtotalChargeCad: 40,
      totalDiscountCad: isSampleComplimentary ? 40 : 0,
      totalChargeCad: sampleTotalCad,
      isSampleComplimentary,
      sampleComplimentaryThresholdSqft: 500,
      samples: [{
        ...legacySample,
        flatRateCad: 40,
        subtotalChargeCad: 40,
        discountCad: isSampleComplimentary ? 40 : 0,
        totalChargeCad: sampleTotalCad,
        isSampleComplimentary,
      }],
    },
  };
}

function complimentaryReviewSampleFixture(): ColourTintPlan {
  const plan = currentSamplePlanFixture(true);
  const samplePlan = plan.samplePlan!;
  const sample = samplePlan.samples[0];
  return {
    ...plan,
    totalTintOunces: plan.allocations[0].totalTintOunces,
    totalChargeCad: 21.66,
    isFullyPriced: false,
    samplePlan: {
      ...samplePlan,
      totalTintOunces: undefined,
      subtotalChargeCad: 40,
      totalDiscountCad: 40,
      totalChargeCad: 0,
      isFullyPriced: false,
      samples: [{
        ...sample,
        batch: undefined,
        pigments: [],
        totalTintOunces: undefined,
        subtotalChargeCad: 40,
        discountCad: 40,
        totalChargeCad: 0,
        pricingStatus: 'dealer_review',
        reviewReason: 'Published quart formula requires dealer review.',
      }],
    },
  };
}

function multipleSamplePlanFixture(isSampleComplimentary: boolean): ColourTintPlan {
  const plan = currentSamplePlanFixture(isSampleComplimentary);
  const samplePlan = plan.samplePlan!;
  const firstSample = samplePlan.samples[0];
  const secondSample = {
    ...firstSample,
    colourId: 'col-xbond-2383d',
    colourCode: '2383D',
    colourName: 'Alexys',
    formulaCode: '2383D',
  };

  return {
    ...plan,
    totalChargeCad: 21.66 + (isSampleComplimentary ? 0 : 80),
    samplePlan: {
      ...samplePlan,
      samples: [firstSample, secondSample],
      totalLiquidGallons: 0.5,
      totalTintOunces: (samplePlan.totalTintOunces ?? 0) * 2,
      totalFlatRateCad: 80,
      subtotalChargeCad: 80,
      totalDiscountCad: isSampleComplimentary ? 80 : 0,
      totalChargeCad: isSampleComplimentary ? 0 : 80,
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
