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

export type CalculatorColourMode = 'single' | 'multiple';

export interface CalculatorColourSelection {
  slotId: string;
  colourId: string | null;
  areaSqft: string;
}

interface CalculatorState {
  areaSqft: string;
  substrateType: SubstrateId | null;
  wastePct: number;
  sealerSku: string;
  waterproofingMode: WaterproofingMode;
  finishSku: XBondFinishSku;
  prepCondition: PrepConditionId | null;
  installationScope: InstallationScope;
  colourMode: CalculatorColourMode;
  colourSelections: CalculatorColourSelection[];
  includeColourSamples: boolean;
}

let colourSlotCounter = 2;

function createColourSlot(): CalculatorColourSelection {
  const slot = { slotId: `colour-${colourSlotCounter}`, colourId: null, areaSqft: '' };
  colourSlotCounter += 1;
  return slot;
}

function getDefaultColourSelections(): CalculatorColourSelection[] {
  return [{ slotId: 'colour-1', colourId: null, areaSqft: '' }];
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
    colourMode: 'single',
    colourSelections: getDefaultColourSelections(),
    includeColourSamples: false,
  });
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invalidateResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const setAreaSqft = useCallback((v: string) => {
    invalidateResult();
    setForm((f) => ({ ...f, areaSqft: v }));
  }, [invalidateResult]);
  const setSubstrate = useCallback((v: SubstrateId) => {
    invalidateResult();
    setForm((f) => {
      const prepCondition = getRequiredPrepCondition(v) ?? getDefaultPrepCondition(v);
      const installationScope: InstallationScope = v === 'pool'
        ? 'submerged'
        : v === 'gypsum_board'
          ? 'non_wet_wall'
          : f.substrateType === 'pool' || f.substrateType === 'gypsum_board'
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
    });
  }, [invalidateResult]);
  const setWastePct = useCallback((v: number) => {
    invalidateResult();
    setForm((f) => ({ ...f, wastePct: v }));
  }, [invalidateResult]);
  const setSealerSku = useCallback((v: string) => {
    invalidateResult();
    setForm((f) => ({ ...f, sealerSku: v }));
  }, [invalidateResult]);
  const setWaterproofingMode = useCallback((v: WaterproofingMode) => {
    invalidateResult();
    setForm((f) => {
      if (f.substrateType && isLiquidMembraneRequired(
        f.substrateType,
        f.prepCondition ?? undefined,
        f.installationScope,
      )) {
        return f;
      }
      return { ...f, waterproofingMode: v };
    });
  }, [invalidateResult]);
  const setInstallationScope = useCallback((v: InstallationScope) => {
    invalidateResult();
    setForm((f) => {
      const installationScope = f.substrateType === 'pool'
        ? 'submerged'
        : f.substrateType === 'gypsum_board'
          ? 'non_wet_wall'
          : v;
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
    });
  }, [invalidateResult]);
  const setFinishSku = useCallback((v: XBondFinishSku) => {
    invalidateResult();
    setForm((f) => ({ ...f, finishSku: v }));
  }, [invalidateResult]);
  const setPrepCondition = useCallback((v: PrepConditionId) => {
    invalidateResult();
    setForm((f) => {
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
    });
  }, [invalidateResult]);

  const setColourMode = useCallback((mode: CalculatorColourMode) => {
    if (mode === form.colourMode) return;
    invalidateResult();
    setForm((f) => {
      const first = f.colourSelections[0] ?? getDefaultColourSelections()[0];
      if (mode === 'single') {
        return { ...f, colourMode: mode, colourSelections: [{ ...first, areaSqft: '' }] };
      }
      return {
        ...f,
        colourMode: mode,
        colourSelections: [
          { ...first, areaSqft: '' },
          f.colourSelections[1] ?? createColourSlot(),
        ],
      };
    });
  }, [form.colourMode, invalidateResult]);

  const setColourSelection = useCallback((slotId: string, colourId: string) => {
    invalidateResult();
    setForm((f) => ({
      ...f,
      colourSelections: f.colourSelections.map((selection) =>
        selection.slotId === slotId ? { ...selection, colourId } : selection),
    }));
  }, [invalidateResult]);

  const setColourArea = useCallback((slotId: string, areaSqft: string) => {
    invalidateResult();
    setForm((f) => ({
      ...f,
      colourSelections: f.colourSelections.map((selection) =>
        selection.slotId === slotId ? { ...selection, areaSqft } : selection),
    }));
  }, [invalidateResult]);

  const addColourSelection = useCallback(() => {
    invalidateResult();
    setForm((f) => ({
      ...f,
      colourSelections: [...f.colourSelections, createColourSlot()],
    }));
  }, [invalidateResult]);

  const removeColourSelection = useCallback((slotId: string) => {
    invalidateResult();
    setForm((f) => ({
      ...f,
      colourSelections: f.colourSelections.length <= 2
        ? f.colourSelections
        : f.colourSelections.filter((selection) => selection.slotId !== slotId),
    }));
  }, [invalidateResult]);

  const setIncludeColourSamples = useCallback((includeColourSamples: boolean) => {
    invalidateResult();
    setForm((f) => ({ ...f, includeColourSamples }));
  }, [invalidateResult]);

  const runCalculation = useCallback(() => {
    setResult(null);
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

    let colourAllocations: { colourId: string; areaSqft: number }[] | undefined;
    if (form.colourMode === 'single') {
      const colourId = form.colourSelections[0]?.colourId;
      if (colourId) colourAllocations = [{ colourId, areaSqft: area }];
    } else {
      if (form.colourSelections.length < 2) {
        setError('Add at least two colours for a multi-colour project');
        return;
      }
      const parsed = form.colourSelections.map((selection, index) => ({
        colourId: selection.colourId,
        areaSqft: Number.parseFloat(selection.areaSqft),
        index,
      }));
      const incomplete = parsed.find((selection) =>
        !selection.colourId || !Number.isFinite(selection.areaSqft) || selection.areaSqft <= 0);
      if (incomplete) {
        setError(`Choose colour ${incomplete.index + 1} and enter its project area`);
        return;
      }
      const selectedColourIds = parsed.map((selection) => selection.colourId as string);
      if (new Set(selectedColourIds).size !== selectedColourIds.length) {
        setError('Choose a different colour for each multi-colour row');
        return;
      }
      colourAllocations = parsed.map((selection) => ({
        colourId: selection.colourId as string,
        areaSqft: selection.areaSqft,
      }));
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
        colourAllocations,
        includeColourSamples: form.includeColourSamples,
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
      colourMode: 'single',
      colourSelections: getDefaultColourSelections(),
      includeColourSamples: false,
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
    setColourMode,
    setColourSelection,
    setColourArea,
    addColourSelection,
    removeColourSelection,
    setIncludeColourSamples,
    runCalculation,
    reset,
  };
}
