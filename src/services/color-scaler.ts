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
  /** Semco dispenser dial amount (Y units in 1/48 steps), when the source provides it. */
  dispenserAmount?: string;
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
  const getY48 = (p: PigmentRatio): number | undefined => {
    switch (batchSize) {
      case 'quart': return p.y48PerQuart;
      case 'gallon': return p.y48PerGallon;
      case 'five_gallon': return p.y48PerFiveGallon;
    }
  };

  const lines: FormulaLine[] = pigments
    .filter((p) => getMl(p) > 0 || (getY48(p) ?? 0) > 0)
    .map((p) => {
      const ml = getMl(p);
      const y48 = getY48(p);
      return {
        pigmentCode: p.pigmentCode,
        pigmentName: p.pigmentName,
        mlAmount: ml,
        displayAmount: formatMl(ml),
        dispenserAmount: y48 && y48 > 0 ? formatDispenser(y48) : undefined,
      };
    });

  // A batch with no amounts is only "no pigment needed" when the colour has
  // no amounts in ANY batch. Otherwise the source simply does not publish
  // this batch size (true for ~106 quart formulas).
  const hasAnyAmounts = pigments.some((p) =>
    p.mlPerQuart > 0 || p.mlPerGallon > 0 || p.mlPerFiveGallon > 0);

  return {
    batchSize,
    pigments: lines,
    mixingNotes:
      lines.length > 0
        ? 'Add all tints to XBond liquid and mix thoroughly before applying to substrate. All tints must be from the same manufacturing lot.'
        : hasAnyAmounts
          ? `A ${BATCH_SIZES.find((b) => b.key === batchSize)?.label.toLowerCase() ?? batchSize} batch is not published for this colour. Mix the gallon batch instead.`
          : 'No pigment addition required. Natural cement tone.',
  };
}

/**
 * Formats total 1/48 steps the way the Semco tint dispenser is dialed:
 * whole Y units plus remaining 48ths, e.g. "1 Y + 12/48". Per Semco's
 * Color Formulation Converter, 1 Y = 35 ml.
 */
export function formatDispenser(y48Total: number): string {
  const wholeY = Math.floor(y48Total / 48);
  const rest = Math.round((y48Total - wholeY * 48) * 100) / 100;
  const restLabel = formatDispenserNumber(rest);
  const parts: string[] = [];
  if (wholeY > 0) parts.push(`${wholeY} Y`);
  if (rest > 0) parts.push(wholeY > 0 ? `${restLabel}/48` : `${restLabel}/48 Y`);
  return parts.length ? parts.join(' + ') : '0';
}

function formatDispenserNumber(value: number): string {
  return Number.isInteger(value)
    ? value.toFixed(0)
    : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function formatMl(ml: number): string {
  if (ml === 0) return '0 ml';
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`;
  if (ml < 1) return `${ml.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} ml`;
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
