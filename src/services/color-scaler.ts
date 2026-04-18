import type { PigmentRatio } from '@/database/schema/colors';

export interface ScaledFormula {
  pigmentSku: string;
  pigmentName: string;
  ratioGPerKg: number;
  totalGrams: number;
  displayAmount: string;
}

export interface ScaledColorFormula {
  totalMixKg: number;
  pigments: ScaledFormula[];
  mixingNotes: string;
}

/**
 * Scales a standard pigment formula to a specific mix volume.
 * ratioGPerKg is the reference ratio per 1 kg of microcement powder.
 */
export function scalePigmentFormula(
  pigments: PigmentRatio[],
  totalMixKg: number,
): ScaledColorFormula {
  if (totalMixKg <= 0) throw new Error('Mix volume must be greater than 0');

  const scaled: ScaledFormula[] = pigments.map((p) => {
    const totalGrams = p.ratioGPerKg * totalMixKg;
    return {
      pigmentSku: p.pigmentSku,
      pigmentName: p.pigmentName,
      ratioGPerKg: p.ratioGPerKg,
      totalGrams,
      displayAmount: formatGrams(totalGrams),
    };
  });

  const hasPigments = scaled.some((p) => p.totalGrams > 0);

  return {
    totalMixKg,
    pigments: scaled,
    mixingNotes: hasPigments
      ? `Add pigments to the mix water and dissolve thoroughly before adding powder. Mix at low speed (300–400 rpm) for 3 minutes. All pigment must come from the same manufacturing lot.`
      : `No pigment addition required for this colour. Natural cement tone.`,
  };
}

function formatGrams(grams: number): string {
  if (grams === 0) return '0 g';
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  if (grams < 1) return `${(grams * 1000).toFixed(0)} mg`;
  return `${grams.toFixed(1)} g`;
}

export const PACK_SIZES_KG = [5, 10, 15, 20, 25] as const;

export function suggestPackSize(areaSqmPerCoat: number, coats: number, coverageRatePerKg: number): number {
  const totalKg = (areaSqmPerCoat / coverageRatePerKg) * coats;
  for (const size of PACK_SIZES_KG) {
    if (size >= totalKg) return size;
  }
  return PACK_SIZES_KG[PACK_SIZES_KG.length - 1];
}
