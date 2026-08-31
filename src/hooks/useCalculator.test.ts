import { act, renderHook } from '@testing-library/react-native';
import { useCalculator } from '@/hooks/useCalculator';

describe('useCalculator preparation and membrane controls', () => {
  it('starts with optional Liquid Membrane turned off', () => {
    const { result } = renderHook(() => useCalculator());

    expect(result.current.form.waterproofingMode).toBe('none');
    expect(result.current.form.prepCondition).toBeNull();
    expect(result.current.form.installationScope).toBe('floor_or_other');
    expect(result.current.form.fabricRolls).toBe(0);
  });

  it('keeps membrane optional for a wall in a non-wet area', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setSubstrate('gypsum_board'));
    expect(result.current.form.installationScope).toBe('non_wet_wall');
    expect(result.current.form.waterproofingMode).toBe('none');

    act(() => result.current.setInstallationScope('floor_or_other'));
    expect(result.current.form.installationScope).toBe('non_wet_wall');

    act(() => result.current.setWaterproofingMode('above_grade'));
    expect(result.current.form.waterproofingMode).toBe('above_grade');

    act(() => result.current.setWaterproofingMode('none'));
    expect(result.current.form.waterproofingMode).toBe('none');
  });

  it('automatically applies the dry-wall scope and one-bag field rate for drywall', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('100'));
    act(() => result.current.setSubstrate('gypsum_board'));
    act(() => result.current.runCalculation());

    expect(result.current.error).toBeNull();
    expect(result.current.result?.installationScope).toBe('non_wet_wall');
    expect(result.current.result?.layers.find((layer) => layer.productSku === 'XBOND-STONE')).toMatchObject({
      exactQuantity: 1,
      roundedQuantity: 1,
    });
  });

  it('forces membrane for a wet-area wall and unlocks it when changed to a non-wet wall', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setSubstrate('cement_board'));
    act(() => result.current.setInstallationScope('wet_area'));
    expect(result.current.form.waterproofingMode).toBe('above_grade');

    act(() => result.current.setWaterproofingMode('none'));
    expect(result.current.form.waterproofingMode).toBe('above_grade');

    act(() => result.current.setInstallationScope('non_wet_wall'));
    expect(result.current.form.waterproofingMode).toBe('none');
  });

  it('defaults clean concrete to SIP Type A and lets the installer add membrane', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setSubstrate('concrete'));
    expect(result.current.form.prepCondition).toBe('type_a');
    expect(result.current.form.waterproofingMode).toBe('none');

    act(() => result.current.setPrepCondition('type_b'));
    act(() => result.current.setWaterproofingMode('above_grade'));
    expect(result.current.form.prepCondition).toBe('type_b');
    expect(result.current.form.waterproofingMode).toBe('above_grade');
  });

  it('locks pool to SIP Type C and submerged membrane', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setSubstrate('pool'));
    expect(result.current.form.prepCondition).toBe('type_c');
    expect(result.current.form.waterproofingMode).toBe('submerged');
    expect(result.current.form.installationScope).toBe('submerged');
    expect(result.current.form.fabricRolls).toBe(0);

    act(() => result.current.setPrepCondition('type_a'));
    act(() => result.current.setWaterproofingMode('none'));
    expect(result.current.form.prepCondition).toBe('type_c');
    expect(result.current.form.waterproofingMode).toBe('submerged');

    act(() => result.current.setInstallationScope('non_wet_wall'));
    expect(result.current.form.installationScope).toBe('submerged');
    expect(result.current.form.waterproofingMode).toBe('submerged');
  });

  it('locks plywood to SIP Type E with membrane', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setSubstrate('plywood'));
    expect(result.current.form.prepCondition).toBe('type_e');
    expect(result.current.form.waterproofingMode).toBe('above_grade');

    act(() => result.current.setWaterproofingMode('none'));
    expect(result.current.form.waterproofingMode).toBe('above_grade');
  });

  it('passes the selected prep type and membrane choice into the calculation', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('500'));
    act(() => result.current.setSubstrate('concrete'));
    act(() => result.current.setPrepCondition('type_b'));
    act(() => result.current.runCalculation());

    expect(result.current.error).toBeNull();
    expect(result.current.result?.prepCondition).toBe('type_b');
    expect(result.current.result?.layers.some((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')).toBe(false);
  });

  it('passes a wet-area wall scope into the calculation and cannot omit membrane', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('120'));
    act(() => result.current.setSubstrate('cement_board'));
    act(() => result.current.setInstallationScope('wet_area'));
    act(() => result.current.runCalculation());

    expect(result.current.error).toBeNull();
    expect(result.current.result?.installationScope).toBe('wet_area');
    expect(result.current.result?.liquidMembraneRequired).toBe(true);
    expect(result.current.result?.layers.find((layer) => layer.productSku === 'SEMCO-LIQUID-MEMBRANE')?.coats).toBe(2);
    expect(result.current.form.fabricRolls).toBe(1);
    expect(result.current.result?.layers.find((layer) => layer.productSku === 'FR675')).toMatchObject({
      roundedQuantity: 1,
    });
  });

  it('lets the installer select dry-area fabric rolls and enforces the wet-area minimum', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('100'));
    act(() => result.current.setSubstrate('concrete'));
    act(() => result.current.setFabricRolls(2));
    act(() => result.current.runCalculation());

    expect(result.current.form.fabricRolls).toBe(2);
    expect(result.current.result?.layers.find((layer) => layer.productSku === 'FR675')).toMatchObject({
      roundedQuantity: 2,
      quantityLabel: '150 lin ft selected',
    });

    act(() => result.current.setFabricRolls(3));
    expect(result.current.result).toBeNull();

    act(() => result.current.setInstallationScope('wet_area'));
    act(() => result.current.setFabricRolls(0));
    expect(result.current.form.fabricRolls).toBe(1);

    act(() => result.current.setInstallationScope('floor_or_other'));
    expect(result.current.form.fabricRolls).toBe(1);
    act(() => result.current.setFabricRolls(0));
    expect(result.current.form.fabricRolls).toBe(0);
  });

  it('resets the project area to floor or other', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setInstallationScope('non_wet_wall'));
    act(() => result.current.reset());

    expect(result.current.form.installationScope).toBe('floor_or_other');
    expect(result.current.form.waterproofingMode).toBe('none');
  });

  it('does not allow a cleaner-free board check to bypass concrete prep', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setSubstrate('concrete'));
    act(() => result.current.setPrepCondition('surface_ready'));

    expect(result.current.form.prepCondition).toBe('type_a');
  });

  it('assigns the full project area to one selected colour', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('187.5'));
    act(() => result.current.setSubstrate('concrete'));
    act(() => result.current.setColourSelection('colour-1', 'col-xbond-2053t'));
    act(() => result.current.runCalculation());

    expect(result.current.error).toBeNull();
    expect(result.current.result?.colourTintPlan?.allocations[0]).toMatchObject({
      colourCode: '2053T',
      areaSqft: 187.5,
    });
  });

  it('adds an optional one-quart sample for the selected colour', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('75'));
    act(() => result.current.setSubstrate('concrete'));
    act(() => result.current.setColourSelection('colour-1', 'col-xbond-2053t'));
    act(() => result.current.setIncludeColourSamples(true));
    act(() => result.current.runCalculation());

    expect(result.current.error).toBeNull();
    expect(result.current.result?.colourTintPlan?.samplePlan).toMatchObject({
      sampleLabel: '1-quart sample (946 mL)',
      samples: [{ colourCode: '2053T', sampleSize: 'quart' }],
    });
  });

  it('keeps fabric and the $40 sample policy together for 150 sq ft of plywood in a wet area', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('150'));
    act(() => result.current.setSubstrate('plywood'));
    act(() => result.current.setInstallationScope('wet_area'));
    act(() => result.current.setColourSelection('colour-1', 'col-xbond-2053t'));
    act(() => result.current.setIncludeColourSamples(true));
    act(() => result.current.runCalculation());

    expect(result.current.error).toBeNull();
    expect(result.current.result?.layers.find((layer) => layer.productSku === 'FR675')).toMatchObject({
      quantityLabel: '75 lin ft selected',
      roundedQuantity: 1,
    });
    expect(result.current.result?.colourTintPlan?.samplePlan).toMatchObject({
      totalChargeCad: 40,
      isSampleComplimentary: false,
    });
  });

  it('requires multi-colour areas to total the project area', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('100'));
    act(() => result.current.setSubstrate('concrete'));
    act(() => result.current.setColourMode('multiple'));
    const [first, second] = result.current.form.colourSelections;
    act(() => result.current.setColourSelection(first.slotId, 'col-xbond-2053t'));
    act(() => result.current.setColourSelection(second.slotId, 'col-xbond-2383d'));
    act(() => result.current.setColourArea(first.slotId, '40'));
    act(() => result.current.setColourArea(second.slotId, '50'));
    act(() => result.current.runCalculation());

    expect(result.current.error).toContain('must total 100 sq ft');

    act(() => result.current.setColourArea(second.slotId, '60'));
    act(() => result.current.runCalculation());
    expect(result.current.error).toBeNull();
    expect(result.current.result?.colourTintPlan?.allocations).toHaveLength(2);
  });

  it('requires distinct colours in multi-colour mode', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('100'));
    act(() => result.current.setSubstrate('concrete'));
    act(() => result.current.setColourMode('multiple'));
    const [first, second] = result.current.form.colourSelections;
    act(() => result.current.setColourSelection(first.slotId, 'col-xbond-2053t'));
    act(() => result.current.setColourSelection(second.slotId, 'col-xbond-2053t'));
    act(() => result.current.setColourArea(first.slotId, '50'));
    act(() => result.current.setColourArea(second.slotId, '50'));
    act(() => result.current.runCalculation());

    expect(result.current.error).toContain('different colour');
    expect(result.current.result).toBeNull();
  });

  it('clears a calculated tint snapshot when the colour changes', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('100'));
    act(() => result.current.setSubstrate('concrete'));
    act(() => result.current.setColourSelection('colour-1', 'col-xbond-2053t'));
    act(() => result.current.runCalculation());
    expect(result.current.result?.colourTintPlan).toBeDefined();

    act(() => result.current.setColourSelection('colour-1', 'col-xbond-2383d'));
    expect(result.current.result).toBeNull();
  });

  it('clears a calculated tint snapshot when any estimate input changes', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setAreaSqft('100'));
    act(() => result.current.setSubstrate('concrete'));
    act(() => result.current.setColourSelection('colour-1', 'col-xbond-2053t'));
    act(() => result.current.runCalculation());
    expect(result.current.result?.colourTintPlan).toBeDefined();

    act(() => result.current.setAreaSqft('500'));
    expect(result.current.result).toBeNull();
  });

  it('does not discard colour rows when the active colour mode is tapped again', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setColourMode('multiple'));
    act(() => result.current.addColourSelection());
    const slots = result.current.form.colourSelections.map((selection) => selection.slotId);

    act(() => result.current.setColourMode('multiple'));
    expect(result.current.form.colourSelections.map((selection) => selection.slotId)).toEqual(slots);
  });

  it('resets colour mode and selections', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setColourMode('multiple'));
    act(() => result.current.reset());

    expect(result.current.form.colourMode).toBe('single');
    expect(result.current.form.colourSelections).toEqual([
      { slotId: 'colour-1', colourId: null, areaSqft: '' },
    ]);
  });
});
