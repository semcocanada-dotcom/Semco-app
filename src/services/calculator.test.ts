import {
  CLEANER_COVERAGE_SOURCE,
  getAvailablePrepSystems,
  getDefaultPrepCondition,
  getPrepSystem,
  getRequiredPrepCondition,
  isLiquidMembraneRequired,
} from '@/constants/prep-systems';
import { calculate } from '@/services/calculator';

describe('SIP preparation systems', () => {
  it('encodes the exact ordered SIP cleaner sequence and dilution for Types A-D', () => {
    expect(getPrepSystem('type_a').cleanerSteps.map(stepSummary)).toEqual([
      '1:STONE-SOAP:1:4:p20',
    ]);
    expect(getPrepSystem('type_b').cleanerSteps.map(stepSummary)).toEqual([
      '1:POWER-CLEANER:1:4:p21',
      '2:STONE-SOAP:1:4:p21',
    ]);
    expect(getPrepSystem('type_c').cleanerSteps.map(stepSummary)).toEqual([
      '1:POWER-CLEANER:1:4:p22',
      '2:NU-LIFT:1:1:p22',
      '3:POWER-CLEANER:1:9:p22',
    ]);
    expect(getPrepSystem('type_d').cleanerSteps.map(stepSummary)).toEqual([
      '1:NU-LIFT:1:0:p23',
      '2:STONE-SOAP:1:4:p23',
    ]);
  });

  it('keeps Type E cleaner-free and marks its membrane assembly as required', () => {
    const typeE = getPrepSystem('type_e');

    expect(typeE.cleanerSteps).toHaveLength(0);
    expect(typeE.requiresLiquidMembrane).toBe(true);
    expect(typeE.sourcePage).toBe(24);
  });

  it('locks pool, plywood, and tile while preventing a no-cleaner bypass on concrete', () => {
    expect(getRequiredPrepCondition('pool')).toBe('type_c');
    expect(getRequiredPrepCondition('plywood')).toBe('type_e');
    expect(getRequiredPrepCondition('existing_tile')).toBe('type_d');
    expect(getDefaultPrepCondition('concrete')).toBe('type_a');
    expect(getAvailablePrepSystems('concrete').map((system) => system.id)).toEqual([
      'type_a',
      'type_b',
      'type_c',
      'type_d',
    ]);
    expect(getAvailablePrepSystems('gypsum_board').map((system) => system.id)).toEqual([
      'surface_ready',
    ]);
  });
});

describe('calculator preparation and membrane behavior', () => {
  it('defaults clean concrete to Type A, quantities Stone Soap, and leaves dry-area membrane optional', () => {
    const result = calculate({
      areaSqft: 1000,
      substrateType: 'concrete',
      wastePct: 10,
    });
    const prep = result.layers.filter((layer) => layer.category === 'prep');

    expect(result.prepCondition).toBe('type_a');
    expect(result.liquidMembraneRequired).toBe(false);
    expect(prep.map((layer) => layer.productSku)).toEqual(['STONE-SOAP']);
    expect(prep[0].quantityRangeMin).toBeCloseTo(1100 / 250, 8);
    expect(prep[0].quantityRangeMax).toBeCloseTo(1100 / 200, 8);
    expect(prep[0].exactQuantity).toBeCloseTo(1100 / 200, 8);
    expect(prep[0].roundedQuantity).toBe(6);
    expect(prep[0].quantityLabel).toBe('4.4-5.5 gal concentrate');
    expect(prep[0].purchaseLabel).toContain('up to 5.5 gal for this pass');
    expect(prep[0].sourceDocument).toBe('Open SIP manual - master copy v2019-3 2.pdf');
    expect(prep[0].sourceNote).toContain(CLEANER_COVERAGE_SOURCE);
    expect(prep[0].sourcePage).toBe(20);
    expect(result.layers.some((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')).toBe(false);
  });

  it('uses the selected Type B condition and returns ordered, priceable cleaner quantities', () => {
    const result = calculate({
      areaSqft: 1000,
      substrateType: 'concrete',
      wastePct: 0,
      prepCondition: 'type_b',
    });
    const prep = result.layers.filter((layer) => layer.category === 'prep');

    expect(prep.map((layer) => `${layer.prepStep}:${layer.productSku}:${layer.dilutionLabel}`)).toEqual([
      '1:POWER-CLEANER:1:4 cleaner to water',
      '2:STONE-SOAP:1:4 cleaner to water',
    ]);
    expect(prep[0].quantityRangeMin).toBeCloseTo(1000 / 450, 8);
    expect(prep[0].exactQuantity).toBeCloseTo(1000 / 300, 8);
    expect(prep[0].roundedQuantity).toBe(4);
    expect(prep[1].quantityRangeMin).toBeCloseTo(1000 / 250, 8);
    expect(prep[1].exactQuantity).toBeCloseTo(1000 / 200, 8);
    expect(prep[1].roundedQuantity).toBe(5);
  });

  it('does not divide dealer concentrate coverage by the SIP dilution ratio', () => {
    const result = calculate({
      areaSqft: 375,
      substrateType: 'concrete',
      wastePct: 0,
      prepCondition: 'type_c',
    });
    const powerCleanerPasses = result.layers.filter((layer) => layer.productSku === 'POWER-CLEANER');

    expect(powerCleanerPasses).toHaveLength(2);
    expect(powerCleanerPasses[0].quantityRangeMin).toBeCloseTo(375 / 450, 8);
    expect(powerCleanerPasses[0].exactQuantity).toBeCloseTo(375 / 300, 8);
    expect(powerCleanerPasses[1].quantityRangeMin).toBeCloseTo(375 / 450, 8);
    expect(powerCleanerPasses[1].exactQuantity).toBeCloseTo(375 / 300, 8);
    expect(powerCleanerPasses.map((layer) => layer.dilutionLabel)).toEqual([
      '1:4 cleaner to water',
      '1:9 cleaner to water',
    ]);
  });

  it('forces the documented prep and membrane requirements for pool, wood, and tile', () => {
    const pool = calculate({
      areaSqft: 100,
      substrateType: 'pool',
      wastePct: 0,
      prepCondition: 'type_a',
      waterproofingMode: 'none',
    });
    const wood = calculate({
      areaSqft: 100,
      substrateType: 'plywood',
      wastePct: 0,
      waterproofingMode: 'none',
    });
    const tile = calculate({
      areaSqft: 100,
      substrateType: 'existing_tile',
      wastePct: 0,
      waterproofingMode: 'none',
    });

    expect(pool.prepCondition).toBe('type_c');
    expect(pool.layers.find((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')?.coats).toBe(4);
    expect(wood.prepCondition).toBe('type_e');
    expect(wood.layers.filter((layer) => ['STONE-SOAP', 'POWER-CLEANER', 'NU-LIFT'].includes(layer.productSku))).toHaveLength(0);
    expect(wood.layers.some((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')).toBe(true);
    expect(tile.prepCondition).toBe('type_d');
    expect(tile.layers.some((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')).toBe(true);
  });

  it('uses a cleaner-free readiness check for board instead of an unsafe Type A default', () => {
    const result = calculate({
      areaSqft: 100,
      substrateType: 'gypsum_board',
      wastePct: 0,
      prepCondition: 'type_a',
    });
    const prep = result.layers.filter((layer) => layer.category === 'prep');

    expect(result.prepCondition).toBe('surface_ready');
    expect(prep).toHaveLength(1);
    expect(prep[0].productSku).toBe('PREP-SURFACE-READY');
    expect(prep[0].roundedQuantity).toBeUndefined();
  });

  it('adds optional Liquid Membrane when selected for an ordinary dry substrate', () => {
    const result = calculate({
      areaSqft: 100,
      substrateType: 'concrete',
      wastePct: 0,
      waterproofingMode: 'above_grade',
    });

    expect(result.liquidMembraneRequired).toBe(false);
    expect(result.layers.some((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')).toBe(true);
  });

  it('keeps Liquid Membrane optional for a wall in a non-wet area', () => {
    const result = calculate({
      areaSqft: 100,
      substrateType: 'gypsum_board',
      wastePct: 0,
      installationScope: 'non_wet_wall',
      waterproofingMode: 'none',
    });

    expect(result.installationScope).toBe('non_wet_wall');
    expect(result.liquidMembraneRequired).toBe(false);
    expect(result.layers.some((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')).toBe(false);
    expect(result.sourceSummary).toContain('optional for this wall in a non-wet area');
  });

  it('uses the no-scratch 100 sq ft field rate only for dry non-wet drywall walls', () => {
    const dryWall = calculate({
      areaSqft: 100,
      substrateType: 'gypsum_board',
      wastePct: 10,
      installationScope: 'non_wet_wall',
      waterproofingMode: 'none',
    });
    const normalizedDrywall = calculate({
      areaSqft: 100,
      substrateType: 'gypsum_board',
      wastePct: 0,
      installationScope: 'floor_or_other',
      waterproofingMode: 'none',
    });
    const paintedWall = calculate({
      areaSqft: 100,
      substrateType: 'existing_paint',
      wastePct: 0,
      installationScope: 'non_wet_wall',
      waterproofingMode: 'none',
    });
    const dryWallStone = dryWall.layers.find((layer) => layer.productSku === 'XBOND-STONE');
    const normalizedStone = normalizedDrywall.layers.find((layer) => layer.productSku === 'XBOND-STONE');
    const paintedStone = paintedWall.layers.find((layer) => layer.productSku === 'XBOND-STONE');
    const dryWallLiquid = dryWall.layers.find((layer) => layer.productSku === 'XBOND-LIQUID');

    expect(dryWallStone).toMatchObject({
      exactQuantity: 1,
      roundedQuantity: 1,
      coats: 2,
      coverageLabel: 'Dry, non-wet drywall finish coats: 100 sq ft/bag',
    });
    expect(dryWallStone?.sourceNote).toContain('omit the scratch coat');
    expect(dryWallStone?.sourceNote).toContain('global waste percentage is not added');
    expect(dryWallLiquid?.exactQuantity).toBeCloseTo(110 / 37.5, 8);
    expect(dryWall.wastePct).toBe(10);
    expect(normalizedDrywall.installationScope).toBe('non_wet_wall');
    expect(normalizedStone).toMatchObject({ exactQuantity: 1, roundedQuantity: 1 });
    expect(paintedStone).toMatchObject({ exactQuantity: 100 / 75, roundedQuantity: 2 });
    expect(normalizedStone?.sourceNote).toContain('omit the scratch coat');
    expect(paintedStone?.sourceNote).not.toContain('omit the scratch coat');
  });

  it('forces the 2-coat above-grade membrane system for a wet-area cement-board wall', () => {
    const result = calculate({
      areaSqft: 100,
      substrateType: 'cement_board',
      wastePct: 0,
      installationScope: 'wet_area',
      waterproofingMode: 'none',
    });
    const membrane = result.layers.find((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE');

    expect(result.installationScope).toBe('wet_area');
    expect(result.liquidMembraneRequired).toBe(true);
    expect(membrane?.coats).toBe(2);
    expect(result.sourceSummary).toContain('2-coat above-grade system');
    expect(result.layers.find((layer) => layer.productSku === 'FR675')).toMatchObject({
      roundedQuantity: 1,
      purchaseLabel: 'Buy 1 x 6 in x 75 ft roll',
    });
  });

  it('defaults wet-area work to one selectable 75 ft fabric roll', () => {
    const result = calculate({
      areaSqft: 150,
      substrateType: 'plywood',
      wastePct: 10,
      installationScope: 'wet_area',
      waterproofingMode: 'none',
    });
    const fabric = result.layers.find((layer) => layer.productSku === 'FR675');

    expect(fabric).toMatchObject({
      productName: 'SEMCO Fabric Reinforcement',
      quantityLabel: '75 lin ft selected',
      purchaseLabel: 'Buy 1 x 6 in x 75 ft roll',
      packLabel: '6 in x 75 ft roll',
      roundedQuantity: 1,
    });
    expect(fabric?.exactQuantity).toBe(1);
    expect(fabric?.sourceNote).toContain('selected by the installer');
    expect(result.sourceSummary).toContain('1 x 75-ft Fabric Reinforcement roll selected');
  });

  it('uses the installer-selected number of fabric rolls instead of estimating seams from area', () => {
    const fabric = calculate({
      areaSqft: 400,
      substrateType: 'plywood',
      wastePct: 10,
      installationScope: 'wet_area',
      fabricRolls: 3,
    }).layers.find((layer) => layer.productSku === 'FR675');

    expect(fabric).toMatchObject({
      quantityLabel: '225 lin ft selected',
      roundedQuantity: 3,
      purchaseLabel: 'Buy 3 x 6 in x 75 ft rolls',
    });
  });

  it('allows optional rolls for dry cracks and omits fabric when zero rolls are selected', () => {
    const selected = calculate({
      areaSqft: 100,
      substrateType: 'concrete',
      wastePct: 0,
      installationScope: 'floor_or_other',
      fabricRolls: 2,
    });
    const omitted = calculate({
      areaSqft: 100,
      substrateType: 'concrete',
      wastePct: 0,
      installationScope: 'floor_or_other',
      fabricRolls: 0,
    });

    expect(selected.layers.find((layer) => layer.productSku === 'FR675')).toMatchObject({
      quantityLabel: '150 lin ft selected',
      roundedQuantity: 2,
      purchaseLabel: 'Buy 2 x 6 in x 75 ft rolls',
    });
    expect(omitted.layers.some((layer) => layer.productSku === 'FR675')).toBe(false);
    expect(omitted.sourceSummary).toContain('No Fabric Reinforcement rolls were selected');
  });

  it('keeps one fabric roll as the wet-area minimum even when zero is requested', () => {
    const fabric = calculate({
      areaSqft: 50,
      substrateType: 'cement_board',
      wastePct: 0,
      installationScope: 'wet_area',
      fabricRolls: 0,
    }).layers.find((layer) => layer.productSku === 'FR675');

    expect(fabric).toMatchObject({ roundedQuantity: 1, quantityLabel: '75 lin ft selected' });
  });

  it('lets a submerged project stay at zero rolls when no cracks or joints need fabric', () => {
    const result = calculate({
      areaSqft: 500,
      substrateType: 'pool',
      wastePct: 10,
      installationScope: 'submerged',
      fabricRolls: 0,
    });

    expect(result.layers.some((layer) => layer.productSku === 'FR675')).toBe(false);
  });

  it('orders two 1-gallon Liquid Membrane pails for the 384 sq ft Atlantic quote', () => {
    const result = calculate({
      areaSqft: 384,
      substrateType: 'cement_board',
      wastePct: 10,
      installationScope: 'wet_area',
      waterproofingMode: 'none',
    });
    const membrane = result.layers.find((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE');

    expect(membrane).toMatchObject({
      quantityLabel: '1.9 gal',
      roundedQuantity: 2,
      quantityPacks: 2,
      purchaseLabel: 'Buy 2 x 1 gal pails (2 gal total)',
    });
    expect(membrane?.exactQuantity).toBeCloseTo((384 * 1.1) / 225, 8);
  });

  it('uses a 5-gallon Liquid Membrane pail only when the requirement reaches five gallons', () => {
    const fiveGallons = calculate({
      areaSqft: 1125,
      substrateType: 'cement_board',
      wastePct: 0,
      installationScope: 'wet_area',
    }).layers.find((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE');
    const sixGallons = calculate({
      areaSqft: 1350,
      substrateType: 'cement_board',
      wastePct: 0,
      installationScope: 'wet_area',
    }).layers.find((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE');

    expect(fiveGallons).toMatchObject({
      roundedQuantity: 5,
      purchaseLabel: 'Buy 1 x 5 gal pail',
    });
    expect(sixGallons).toMatchObject({
      roundedQuantity: 6,
      purchaseLabel: 'Buy 1 x 5 gal pail + 1 x 1 gal pail (6 gal total)',
    });
  });

  it('rejects regular gypsum board in a wet area', () => {
    expect(() => calculate({
      areaSqft: 100,
      substrateType: 'gypsum_board',
      wastePct: 0,
      installationScope: 'wet_area',
      waterproofingMode: 'none',
    })).toThrow('Select a manufacturer-approved moisture-resistant wet-area board substrate');
  });

  it('forces the 4-coat system for submerged exposure and normalizes pools to submerged', () => {
    const submerged = calculate({
      areaSqft: 100,
      substrateType: 'concrete',
      wastePct: 0,
      installationScope: 'submerged',
      waterproofingMode: 'none',
    });
    const pool = calculate({
      areaSqft: 100,
      substrateType: 'pool',
      wastePct: 0,
      installationScope: 'non_wet_wall',
      waterproofingMode: 'none',
    });

    expect(submerged.layers.find((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')?.coats).toBe(4);
    expect(pool.installationScope).toBe('submerged');
    expect(pool.layers.find((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')?.coats).toBe(4);
  });

  it('retains mandatory substrate details even for non-wet walls', () => {
    expect(isLiquidMembraneRequired('plywood', 'type_e', 'non_wet_wall')).toBe(true);
    expect(isLiquidMembraneRequired('existing_tile', 'type_d', 'non_wet_wall')).toBe(true);

    const wood = calculate({
      areaSqft: 100,
      substrateType: 'plywood',
      wastePct: 0,
      installationScope: 'non_wet_wall',
      waterproofingMode: 'none',
    });

    expect(wood.installationScope).toBe('non_wet_wall');
    expect(wood.liquidMembraneRequired).toBe(true);
    expect(wood.layers.find((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')?.coats).toBe(2);
  });

  it('defaults direct calls to floor-or-other without making ordinary floors require membrane', () => {
    const result = calculate({
      areaSqft: 100,
      substrateType: 'concrete',
      wastePct: 0,
      waterproofingMode: 'none',
    });

    expect(result.installationScope).toBe('floor_or_other');
    expect(result.liquidMembraneRequired).toBe(false);
    expect(result.layers.some((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')).toBe(false);
  });

  it('snapshots a selected colour and tint charge with the calculation', () => {
    const result = calculate({
      areaSqft: 187.5,
      substrateType: 'concrete',
      wastePct: 0,
      colourAllocations: [{ colourId: 'col-xbond-2053t', areaSqft: 187.5 }],
    });

    expect(result.colourTintPlan).toMatchObject({
      exactLiquidGallons: 5,
      preparedLiquidGallons: 5,
      baseLiquidPurchaseGallons: 5,
      totalChargeCad: 54.17,
      allocations: [{ colourCode: '2053T', formulaCode: '2053T' }],
    });
  });

  it('uses dealer sample stock without increasing the project X-Bond Liquid order', () => {
    const result = calculate({
      areaSqft: 187.5,
      substrateType: 'concrete',
      wastePct: 0,
      colourAllocations: [{ colourId: 'col-xbond-2053t', areaSqft: 187.5 }],
      includeColourSamples: true,
    });
    const liquid = result.layers.find((layer) => layer.productSku === 'XBOND-LIQUID');

    expect(result.colourTintPlan).toMatchObject({
      preparedLiquidGallons: 5,
      baseLiquidPurchaseGallons: 5,
      totalChargeCad: 94.17,
      samplePlan: {
        liquidSource: 'dealer_sample_stock',
        totalLiquidGallons: 0.25,
        totalFlatRateCad: 40,
        subtotalChargeCad: 40,
        totalDiscountCad: 0,
        totalChargeCad: 40,
        isSampleComplimentary: false,
        samples: [{
          colourCode: '2053T',
          sampleSize: 'quart',
          flatRateCad: 40,
          totalChargeCad: 40,
          isSampleComplimentary: false,
        }],
      },
    });
    expect(liquid).toMatchObject({
      roundedQuantity: 5,
      purchaseLabel: 'Buy 1 x 5 gal pail',
    });
  });

  it('keeps the current $40 sample policy in the exact 150 sq ft plywood wet-area path', () => {
    const baseInput = {
      areaSqft: 150,
      substrateType: 'plywood' as const,
      wastePct: 10,
      installationScope: 'wet_area' as const,
      colourAllocations: [{ colourId: 'col-xbond-2053t', areaSqft: 150 }],
    };
    const withoutSample = calculate(baseInput);
    const withSample = calculate({ ...baseInput, includeColourSamples: true });

    expect(withoutSample.colourTintPlan?.samplePlan).toBeUndefined();
    expect(withSample.colourTintPlan?.samplePlan).toMatchObject({
      totalChargeCad: 40,
      isSampleComplimentary: false,
      liquidSource: 'dealer_sample_stock',
      samples: [{ flatRateCad: 40, totalChargeCad: 40 }],
    });
  });

  it('rounds each project colour to whole-gallon tint batches', () => {
    const result = calculate({
      areaSqft: 183.75,
      substrateType: 'concrete',
      wastePct: 0,
      colourAllocations: [
        { colourId: 'col-xbond-2053t', areaSqft: 61.25 },
        { colourId: 'col-xbond-2383d', areaSqft: 61.25 },
        { colourId: 'col-xbond-2397d', areaSqft: 61.25 },
      ],
    });
    const liquid = result.layers.find((layer) => layer.productSku === 'XBOND-LIQUID');

    expect(result.colourTintPlan?.preparedLiquidGallons).toBe(6);
    expect(result.colourTintPlan?.baseLiquidPurchaseGallons).toBe(6);
    expect(liquid?.roundedQuantity).toBe(6);
    expect(liquid?.purchaseLabel).toBe('Buy 1 x 5 gal pail + 1 x 1 gal pail (6 gal)');
  });
});

function stepSummary(step: {
  order: number;
  productSku: string;
  cleanerParts: number;
  waterParts: number;
  sourcePage: number;
}): string {
  return `${step.order}:${step.productSku}:${step.cleanerParts}:${step.waterParts}:p${step.sourcePage}`;
}
