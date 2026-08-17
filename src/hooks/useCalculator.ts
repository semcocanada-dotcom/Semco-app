import { useState, useCallback } from 'react';
import { calculate } from '@/services/calculator';
import { db } from '@/database/client';
import { calculations } from '@/database/schema/calculations';
import { useAuthStore } from '@/store/auth';
import type { SubstrateId } from '@/constants/substrates';
import type { CalculationResult } from '@/database/schema/calculations';

interface CalculatorState {
  areaSqm: string;
  substrateType: SubstrateId | null;
  wastePct: number;
  sealerSku: string;
}

export function useCalculator() {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState<CalculatorState>({
    areaSqm: '',
    substrateType: null,
    wastePct: 10,
    sealerSku: 'SEAL-2K-S',
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setAreaSqm = useCallback((v: string) => setForm((f) => ({ ...f, areaSqm: v })), []);
  const setSubstrate = useCallback((v: SubstrateId) => setForm((f) => ({ ...f, substrateType: v })), []);
  const setWastePct = useCallback((v: number) => setForm((f) => ({ ...f, wastePct: v })), []);
  const setSealerSku = useCallback((v: string) => setForm((f) => ({ ...f, sealerSku: v })), []);

  const runCalculation = useCallback(() => {
    setError(null);
    const area = parseFloat(form.areaSqm);

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
        areaSqm: area,
        substrateType: form.substrateType,
        wastePct: form.wastePct,
        sealerSku: form.sealerSku,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
    }
  }, [form]);

  const saveCalculation = useCallback(async (projectId?: string): Promise<void> => {
    if (!result || !form.substrateType) return;
    setSaving(true);
    try {
      await db.insert(calculations).values({
        id: `calc-${Date.now()}`,
        projectId: projectId ?? null,
        installerId: user?.id ?? 'local',
        areaSqm: parseFloat(form.areaSqm),
        substrateType: form.substrateType,
        wastePct: form.wastePct,
        result: JSON.stringify(result),
        createdAt: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  }, [result, form, user]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setForm({ areaSqm: '', substrateType: null, wastePct: 10, sealerSku: 'SEAL-2K-S' });
  }, []);

  return {
    form,
    result,
    error,
    saving,
    setAreaSqm,
    setSubstrate,
    setWastePct,
    setSealerSku,
    runCalculation,
    saveCalculation,
    reset,
  };
}
