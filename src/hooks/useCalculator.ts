import { useState, useCallback } from 'react';
import { calculate } from '@/services/calculator';
import type { SubstrateId } from '@/constants/substrates';
import { CURRENT_POOL_SEALER_SKU } from '@/constants/stocked-sealers';
import type { WaterproofingMode, XBondFinishSku } from '@/constants/product-coverage';
import type { CalculationResult } from '@/database/schema/calculations';

interface CalculatorState {
  areaSqft: string;
  substrateType: SubstrateId | null;
  wastePct: number;
  sealerSku: string;
  waterproofingMode: WaterproofingMode;
  finishSku: XBondFinishSku;
}

export function useCalculator() {
  const [form, setForm] = useState<CalculatorState>({
    areaSqft: '',
    substrateType: null,
    wastePct: 10,
    sealerSku: 'SATIN-STONE',
    waterproofingMode: 'above_grade',
    finishSku: 'XBOND-STANDARD',
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setAreaSqft = useCallback((v: string) => setForm((f) => ({ ...f, areaSqft: v })), []);
  const setSubstrate = useCallback((v: SubstrateId) => setForm((f) => ({
    ...f,
    substrateType: v,
    sealerSku: v === 'pool' ? CURRENT_POOL_SEALER_SKU : f.sealerSku,
  })), []);
  const setWastePct = useCallback((v: number) => setForm((f) => ({ ...f, wastePct: v })), []);
  const setSealerSku = useCallback((v: string) => setForm((f) => ({ ...f, sealerSku: v })), []);
  const setWaterproofingMode = useCallback((v: WaterproofingMode) => setForm((f) => ({ ...f, waterproofingMode: v })), []);
  const setFinishSku = useCallback((v: XBondFinishSku) => setForm((f) => ({ ...f, finishSku: v })), []);

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

    try {
      const res = calculate({
        areaSqft: area,
        substrateType: form.substrateType,
        wastePct: form.wastePct,
        sealerSku: form.sealerSku,
        waterproofingMode: form.waterproofingMode,
        finishSku: form.finishSku,
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
      waterproofingMode: 'above_grade',
      finishSku: 'XBOND-STANDARD',
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
    setFinishSku,
    runCalculation,
    reset,
  };
}
