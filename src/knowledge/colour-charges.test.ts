import {
  COLOUR_SWATCH_STATS,
  COLOUR_TINT_STATS,
  getColourChargeRecord,
  TINT_COLOUR_OPTIONS,
  TINT_RATE_PER_MACHINE_OUNCE_CAD,
  searchTintColours,
} from '@/knowledge/colour-charges';

describe('X-Bond colour tint charge catalogue', () => {
  it('contains the complete workbook catalogue and pigment row count', () => {
    expect(TINT_COLOUR_OPTIONS).toHaveLength(1022);
    expect(new Set(TINT_COLOUR_OPTIONS.map((colour) => colour.id)).size).toBe(1022);
    expect(COLOUR_TINT_STATS).toMatchObject({
      workbookColours: 1022,
      mappedColours: 1022,
      pigmentFormulaRows: 3466,
    });
    expect(TINT_RATE_PER_MACHINE_OUNCE_CAD).toBe(2);
  });

  it('sorts colour choices alphabetically by name and then code', () => {
    const compare = (a: { name: string; code: string }, b: { name: string; code: string }) =>
      a.name.localeCompare(b.name, 'en-CA', { sensitivity: 'base', numeric: true })
      || a.code.localeCompare(b.code, 'en-CA', { sensitivity: 'base', numeric: true });

    expect(TINT_COLOUR_OPTIONS.slice(0, 4)).toMatchObject([
      { name: "Aaron's Rod", code: '2053T' },
      { name: 'Absicon', code: '2383D' },
      { name: 'Abstract', code: '2397D' },
      { name: 'Abyss', code: '2951D' },
    ]);
    expect(TINT_COLOUR_OPTIONS.at(-1)).toMatchObject({ name: 'Zesty Lilac', code: '2304P' });

    for (let index = 1; index < TINT_COLOUR_OPTIONS.length; index += 1) {
      expect(compare(TINT_COLOUR_OPTIONS[index - 1], TINT_COLOUR_OPTIONS[index])).toBeLessThanOrEqual(0);
    }

    const blueResults = searchTintColours('blue');
    for (let index = 1; index < blueResults.length; index += 1) {
      expect(compare(blueResults[index - 1], blueResults[index])).toBeLessThanOrEqual(0);
    }
  });

  it('adds only verified fan-deck hex swatches and identifies colours without one', () => {
    expect(COLOUR_SWATCH_STATS).toEqual({ available: 1008, unavailable: 14 });
    expect(getColourChargeRecord('2053T')?.swatchHex).toBe('#FFD077');

    const coloursWithoutSwatches = TINT_COLOUR_OPTIONS
      .filter((colour) => colour.swatchHex == null)
      .map((colour) => colour.code)
      .sort((a, b) => a.localeCompare(b, 'en-CA', { numeric: true }));

    expect(coloursWithoutSwatches).toEqual([
      '4000',
      '4001',
      '4003',
      '4004',
      '4005',
      '4006',
      '4007',
      '4008',
      '4009',
      '4010',
      '4011',
      '4012',
      '4013',
      '4014',
    ]);

    for (const colour of TINT_COLOUR_OPTIONS) {
      if (colour.swatchHex) expect(colour.swatchHex).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('keeps all three aggregate charges for direct-source formulas', () => {
    expect(getColourChargeRecord('2053T')?.batches).toEqual({
      quart: { tintOunces: 1.35416667, chargeCad: 2.71, formulaBasis: 'direct_source' },
      gallon: { tintOunces: 5.41666667, chargeCad: 10.83, formulaBasis: 'direct_source' },
      five_gallon: { tintOunces: 27.08333333, chargeCad: 54.17, formulaBasis: 'direct_source' },
    });
    expect(getColourChargeRecord('2383D')?.batches).toMatchObject({
      quart: { chargeCad: 1.42 },
      gallon: { chargeCad: 6.17 },
      five_gallon: { chargeCad: 30.83 },
    });
  });

  it('retains derived quart pricing metadata without presenting it as a direct formula', () => {
    const angelKiss = getColourChargeRecord('2162P');

    expect(angelKiss?.batches.quart).toEqual({
      tintOunces: 1.8984375,
      chargeCad: 3.8,
      formulaBasis: 'derived_from_gallon_div_4',
    });
    expect(angelKiss?.batches.gallon).toMatchObject({ tintOunces: 7.59375, chargeCad: 15.19 });
    expect(angelKiss?.batches.five_gallon).toMatchObject({ tintOunces: 37.875, chargeCad: 75.75 });
  });

  it('uses aggregate batch rounding rather than summed rounded pigment prices', () => {
    const aaronsRod = getColourChargeRecord('2053T')!;
    const pigmentRoundedTotal = aaronsRod.pigments.reduce(
      (sum, pigment) => sum + Math.round((pigment.y48PerGallon / 48) * 2 * 100) / 100,
      0,
    );

    expect(pigmentRoundedTotal).toBe(10.84);
    expect(aaronsRod.batches.gallon.chargeCad).toBe(10.83);
  });

  it('preserves duplicate pigment rows so their machine amounts can be summed', () => {
    expect(getColourChargeRecord('2389T')?.pigments.filter((pigment) => pigment.pigmentCode === 'R S SS')).toHaveLength(2);
    expect(getColourChargeRecord('2595C')?.pigments.filter((pigment) => pigment.pigmentCode === 'AXN AXX')).toHaveLength(2);
  });

  it('keeps display codes and source formula codes separate for aliases', () => {
    expect(getColourChargeRecord('2585T')).toMatchObject({ code: '2585T', sourceFormulaCode: '2585P' });
    expect(getColourChargeRecord('2664D')).toMatchObject({
      code: '2664D',
      sourceFormulaCode: '2464D',
      associationStatus: 'verified_source_code_correction',
    });
    expect(getColourChargeRecord('2668T')).toMatchObject({
      code: '2668T',
      sourceFormulaCode: '2688T',
      associationStatus: 'verified_source_code_correction',
    });
  });

  it('finds aliased colours by either the display code or source formula code', () => {
    expect(getColourChargeRecord('2464D')).toMatchObject({ code: '2664D', name: 'Sea Moss' });
    expect(searchTintColours('2688T')).toEqual([
      expect.objectContaining({ code: '2668T', name: 'Yellow Grass', formulaCode: '2688T' }),
    ]);
  });

  it('keeps the six verified source corrections in operational charges', () => {
    expect(getColourChargeRecord('2688P')?.batches.gallon.chargeCad).toBe(16);
    expect(getColourChargeRecord('2375T')?.batches.gallon.chargeCad).toBe(9.83);
    expect(getColourChargeRecord('2629D')?.batches.five_gallon.chargeCad).toBe(57.5);
    expect(getColourChargeRecord('2092P')?.batches.five_gallon.chargeCad).toBe(78.67);
    expect(getColourChargeRecord('2605P')?.batches.gallon.chargeCad).toBe(16.75);
    expect(getColourChargeRecord('2432D')?.batches.quart.chargeCad).toBe(1.5);
  });

  it('reconciles every stored aggregate charge to machine ounces at two dollars', () => {
    for (const option of TINT_COLOUR_OPTIONS) {
      const colour = getColourChargeRecord(option.id)!;
      for (const batch of Object.values(colour.batches)) {
        expect(batch.chargeCad).toBe(Math.round((batch.tintOunces * 2 + Number.EPSILON) * 100) / 100);
      }
    }
  });

  it('has direct 1-gallon and 5-gallon formulas for every project colour', () => {
    for (const option of TINT_COLOUR_OPTIONS) {
      const colour = getColourChargeRecord(option.id)!;
      expect(colour.batches.gallon.formulaBasis).toBe('direct_source');
      expect(colour.batches.five_gallon.formulaBasis).toBe('direct_source');
    }
  });
});
