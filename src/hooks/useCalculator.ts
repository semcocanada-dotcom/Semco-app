import { useState, useCallback } from 'react';
import { calculate } from '@/services/calculator';
import type { SubstrateId } from '@/constants/substrates';
import { CURRENT_POOL_SEALER_SKU } from '@/constants/stocked-sealers';
import type { WaterproofingMode, XBondFinishSku } from '@/constants/product-coverage';
import {
  getDefaultPrepCondition,
  getAvailablePrepSystems,
  getRequiredPrepCondition,
  isLiquidMembraneRequired,
  type InstallationScope,
  type PrepConditionId,
} from '@/constants/prep-systems';
import type { CalculationResult } from '@/database/schema/calculations';

interface CalculatorState {
  areaSqft: string;
  substrateType: SubstrateId | null;
  wastePct: number;
  sealerSku: string;
  waterproofingMode: WaterproofingMode;
  finishSku: XBondFinishSku;
  prepCondition: PrepConditionId | null;
  installationScope: InstallationScope;
}

export function useCalculator() {
  const [form, setForm] = useState<CalculatorState>({
    areaSqft: '',
    substrateType: null,
    wastePct: 10,
    sealerSku: 'SATIN-STONE',
    waterproofingMode: 'none',
    finishSku: 'XBOND-STANDARD',
    prepCondition: null,
    installationScope: 'floor_or_other',
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setAreaSqft = useCallback((v: string) => setForm((f) => ({ ...f, areaSqft: v })), []);
  const setSubstrate = useCallback((v: SubstrateId) => setForm((f) => {
    const prepCondition = getRequiredPrepCondition(v) ?? getDefaultPrepCondition(v);
    const installationScope: InstallationScope = v === 'pool'
      ? 'submerged'
      : f.substrateType === 'pool'
        ? 'floor_or_other'
        : f.installationScope;
    const membraneRequired = isLiquidMembraneRequired(v, prepCondition, installationScope);

    return {
      ...f,
      substrateType: v,
      prepCondition,
      installationScope,
      sealerSku: v === 'pool' ? CURRENT_POOL_SEALER_SKU : f.sealerSku,
      waterproofingMode: membraneRequired
        ? (installationScope === 'submerged' ? 'submerged' : 'above_grade')
        : 'none',
    };
  }), []);
  const setWastePct = useCallback((v: number) => setForm((f) => ({ ...f, wastePct: v })), []);
  const setSealerSku = useCallback((v: string) => setForm((f) => ({ ...f, sealerSku: v })), []);
  const setWaterproofingMode = useCallback((v: WaterproofingMode) => setForm((f) => {
    if (f.substrateType && isLiquidMembraneRequired(
      f.substrateType,
      f.prepCondition ?? undefined,
      f.installationScope,
    )) {
      return f;
    }
    return { ...f, waterproofingMode: v };
  }), []);
  const setInstallationScope = useCallback((v: InstallationScope) => setForm((f) => {
    const installationScope = f.substrateType === 'pool' ? 'submerged' : v;
    const membraneRequired = f.substrateType
      ? isLiquidMembraneRequired(f.substrateType, f.prepCondition ?? undefined, installationScope)
      : installationScope === 'wet_area' || installationScope === 'submerged';

    return {
      ...f,
      installationScope,
      waterproofingMode: membraneRequired
        ? (installationScope === 'submerged' ? 'submerged' : 'above_grade')
        : 'none',
    };
  }), []);
  const setFinishSku = useCallback((v: XBondFinishSku) => setForm((f) => ({ ...f, finishSku: v })), []);
  const setPrepCondition = useCallback((v: PrepConditionId) => setForm((f) => {
    if (!f.substrateType || getRequiredPrepCondition(f.substrateType)) return f;
    if (!getAvailablePrepSystems(f.substrateType).some((system) => system.id === v)) return f;
    const membraneWasRequired = isLiquidMembraneRequired(
      f.substrateType,
      f.prepCondition ?? undefined,
      f.installationScope,
    );
    const membraneRequired = isLiquidMembraneRequired(f.substrateType, v, f.installationScope);
    return {
      ...f,
      prepCondition: v,
      waterproofingMode: membraneRequired
        ? (f.installationScope === 'submerged' ? 'submerged' : 'above_grade')
        : membraneWasRequired
          ? 'none'
          : f.waterproofingMode,
    };
  }), []);

  const runCalculation = useCallback(() => {
    setError(null);
    const area = parseFloat(form.areaSqft);

    if (isNaN(area) || area <= 0) {
      setError('Please enter a valid area greater than 0');
      return;
    }
    if (!form.substrateType) {
      setError('Please select a substrate type');
      return;
    }
    if (!form.prepCondition) {
      setError('Please select the surface condition / SIP prep type');
      return;
    }

    try {
      const res = calculate({
        areaSqft: area,
        substrateType: form.substrateType,
        wastePct: form.wastePct,
        sealerSku: form.sealerSku,
        waterproofingMode: form.waterproofingMode,
        finishSku: form.finishSku,
        prepCondition: form.prepCondition,
        installationScope: form.installationScope,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
    }
  }, [form]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setForm({
      areaSqft: '',
      substrateType: null,
      wastePct: 10,
      sealerSku: 'SATIN-STONE',
      waterproofingMode: 'none',
      finishSku: 'XBOND-STANDARD',
      prepCondition: null,
      installationScope: 'floor_or_other',
    });
  }, []);

  return {
    form,
    result,
    error,
    setAreaSqft,
    setSubstrate,
    setWastePct,
    setSealerSku,
    setWaterproofingMode,
    setInstallationScope,
    setFinishSku,
    setPrepCondition,
    runCalculation,
    reset,
  };
}
