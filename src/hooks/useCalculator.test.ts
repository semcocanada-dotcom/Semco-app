import { act, renderHook } from '@testing-library/react-native';
import { useCalculator } from '@/hooks/useCalculator';

describe('useCalculator preparation and membrane controls', () => {
  it('starts with optional Liquid Membrane turned off', () => {
    const { result } = renderHook(() => useCalculator());

    expect(result.current.form.waterproofingMode).toBe('none');
    expect(result.current.form.prepCondition).toBeNull();
    expect(result.current.form.installationScope).toBe('floor_or_other');
  });

  it('keeps membrane optional for a wall in a non-wet area', () => {
    const { result } = renderHook(() => useCalculator());

    act(() => result.current.setSubstrate('gypsum_board'));
    act(() => result.current.setInstallationScope('non_wet_wall'));
    expect(result.current.form.waterproofingMode).toBe('none');

    act(() => result.current.setWaterproofingMode('above_grade'));
    expect(result.current.form.waterproofingMode).toBe('above_grade');

    act(() => result.current.setWaterproofingMode('none'));
    expect(result.current.form.waterproofingMode).toBe('none');
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
});
