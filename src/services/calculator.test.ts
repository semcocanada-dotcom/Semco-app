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
  });

  it('rejects regular gypsum board in a wet area', () => {
    expect(() => calculate({
      areaSqft: 100,
      substrateType: 'gypsum_board',
      wastePct: 0,
      installationScope: 'wet_area',
      waterproofingMode: 'none',
    })).toThrow('Select a wet-area board or cement board substrate');
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
