import tintDataJson from '@/database/seed/colour-tint-data.json';
import colourSeedJson from '@/database/seed/colors.json';
import type { TintBatchSize, TintFormulaBasis } from '@/database/schema/calculations';

export interface TintBatchDefinition {
  tintOunces: number;
  chargeCad: number;
  formulaBasis: TintFormulaBasis;
}

export interface TintPigmentDefinition {
  pigmentCode: string;
  pigmentName: string;
  y48PerQuart: number;
  y48PerGallon: number;
  y48PerFiveGallon: number;
}

export interface ColourChargeRecord {
  id: string;
  code: string;
  name: string;
  sourceFormulaCode: string;
  associationStatus: string;
  associationNote: string | null;
  orderable: boolean;
  reviewReason: string | null;
  formulaCorrections: string[];
  qaFlags: string[];
  swatchHex: string | null;
  batches: Record<TintBatchSize, TintBatchDefinition>;
  pigments: TintPigmentDefinition[];
}

interface ColourTintSeed {
  source: string;
  sourceFormulaDocument: string;
  ratePerTintOunceCad: number;
  pricingUnit: string;
  unitDefinition: string;
  stats: {
    workbookColours: number;
    mappedColours: number;
    orderableColours: number;
    reviewRequiredColours: number;
    pigmentFormulaRows: number;
  };
  colours: Omit<ColourChargeRecord, 'swatchHex'>[];
}

const tintData = tintDataJson as unknown as ColourTintSeed;
const swatchesById = new Map(
  (colourSeedJson as { id: string; swatchHex?: string | null }[])
    .map((colour) => [colour.id, validSwatch(colour.swatchHex) ? colour.swatchHex! : null]),
);
const colourRecords: ColourChargeRecord[] = tintData.colours.map((colour) => ({
  ...colour,
  swatchHex: swatchesById.get(colour.id) ?? null,
}));
const byId = new Map(colourRecords.map((colour) => [colour.id, colour]));
const byCode = new Map(colourRecords.map((colour) => [normalise(colour.code), colour]));
const byFormulaCode = new Map(
  colourRecords.map((colour) => [normalise(colour.sourceFormulaCode), colour]),
);

export const TINT_RATE_PER_MACHINE_OUNCE_CAD = tintData.ratePerTintOunceCad;
export const TINT_PRICING_UNIT = tintData.pricingUnit;
export const TINT_UNIT_DEFINITION = tintData.unitDefinition;
export const COLOUR_TINT_SOURCE = tintData.source;
export const COLOUR_TINT_STATS = tintData.stats;
export const COLOUR_SWATCH_STATS = {
  available: colourRecords.filter((colour) => colour.swatchHex).length,
  unavailable: colourRecords.filter((colour) => !colour.swatchHex).length,
};

export const TINT_COLOUR_OPTIONS = colourRecords
  .map((colour) => ({
    id: colour.id,
    code: colour.code,
    name: colour.name,
    formulaCode: colour.sourceFormulaCode,
    swatchHex: colour.swatchHex,
    orderable: colour.orderable,
    reviewReason: colour.reviewReason,
  }))
  .sort((a, b) => compareAlphabetically(a.name, b.name) || compareAlphabetically(a.code, b.code));

export function getColourChargeRecord(colourIdOrCode: string): ColourChargeRecord | undefined {
  const normalised = normalise(colourIdOrCode);
  return byId.get(colourIdOrCode) ?? byCode.get(normalised) ?? byFormulaCode.get(normalised);
}

export function searchTintColours(query: string) {
  const needle = normalise(query);
  if (!needle) return TINT_COLOUR_OPTIONS;

  return TINT_COLOUR_OPTIONS.filter((colour) =>
    normalise(`${colour.code} ${colour.formulaCode} ${colour.name}`).includes(needle),
  );
}

export function getPigmentY48ForBatch(
  pigment: TintPigmentDefinition,
  batchSize: TintBatchSize,
): number {
  switch (batchSize) {
    case 'quart': return pigment.y48PerQuart;
    case 'gallon': return pigment.y48PerGallon;
    case 'five_gallon': return pigment.y48PerFiveGallon;
  }
}

function normalise(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

function compareAlphabetically(a: string, b: string): number {
  return a.localeCompare(b, 'en-CA', { sensitivity: 'base', numeric: true });
}

function validSwatch(value?: string | null): value is string {
  return Boolean(value && /^#[0-9A-F]{6}$/i.test(value));
}
