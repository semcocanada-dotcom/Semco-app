import type { PigmentRatio } from '@/database/schema/colors';

export type BatchSize = 'quart' | 'gallon' | 'five_gallon';

export const BATCH_SIZES: { key: BatchSize; label: string; volumeLabel: string }[] = [
  { key: 'quart', label: 'Quart', volumeLabel: '946 ml' },
  { key: 'gallon', label: 'Gallon', volumeLabel: '3.8 L' },
  { key: 'five_gallon', label: '5 Gallon', volumeLabel: '18.9 L' },
];

export interface FormulaLine {
  pigmentCode: string;
  pigmentName: string;
  mlAmount: number;
  displayAmount: string;
}

export interface BatchFormula {
  batchSize: BatchSize;
  pigments: FormulaLine[];
  mixingNotes: string;
}

export function getFormulaForBatch(pigments: PigmentRatio[], batchSize: BatchSize): BatchFormula {
  const getMl = (p: PigmentRatio): number => {
    switch (batchSize) {
      case 'quart': return p.mlPerQuart;
      case 'gallon': return p.mlPerGallon;
      case 'five_gallon': return p.mlPerFiveGallon;
    }
  };

  const lines: FormulaLine[] = pigments
    .filter((p) => getMl(p) > 0)
    .map((p) => {
      const ml = getMl(p);
      return {
        pigmentCode: p.pigmentCode,
        pigmentName: p.pigmentName,
        mlAmount: ml,
        displayAmount: formatMl(ml),
      };
    });

  return {
    batchSize,
    pigments: lines,
    mixingNotes:
      lines.length > 0
        ? 'Add all tints to XBond liquid and mix thoroughly before applying to substrate. All tints must be from the same manufacturing lot.'
        : 'No pigment addition required. Natural cement tone.',
  };
}

function formatMl(ml: number): string {
  if (ml === 0) return '0 ml';
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`;
  if (ml < 1) return `${(ml * 1000).toFixed(0)} ul`;
  return `${Number.isInteger(ml) ? ml.toFixed(0) : ml.toFixed(1)} ml`;
}

/** For custom colours, installer enters ml per quart and the app auto-scales. */
export function buildPigmentRatio(
  pigmentCode: string,
  pigmentName: string,
  mlPerQuart: number,
): PigmentRatio {
  return {
    pigmentCode,
    pigmentName,
    mlPerQuart,
    mlPerGallon: Math.round(mlPerQuart * 4 * 10) / 10,
    mlPerFiveGallon: Math.round(mlPerQuart * 20 * 10) / 10,
  };
}

export const PACK_SIZES_KG = [5, 10, 15, 20, 25] as const;

export function suggestPackSize(areaSqmPerCoat: number, coats: number, coverageRatePerKg: number): number {
  const totalKg = (areaSqmPerCoat / coverageRatePerKg) * coats;
  for (const size of PACK_SIZES_KG) {
    if (size >= totalKg) return size;
  }
  return PACK_SIZES_KG[PACK_SIZES_KG.length - 1];
}
