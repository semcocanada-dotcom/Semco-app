import type { SubstrateId } from '@/constants/substrates';

export type PrepConditionId =
  | 'type_a'
  | 'type_b'
  | 'type_c'
  | 'type_d'
  | 'type_e'
  | 'surface_ready';

export type PrepCleanerSku = 'STONE-SOAP' | 'POWER-CLEANER' | 'NU-LIFT';

export type InstallationScope =
  | 'floor_or_other'
  | 'non_wet_wall'
  | 'wet_area'
  | 'submerged';

export interface PrepCleanerStep {
  order: number;
  productSku: PrepCleanerSku;
  productName: string;
  purpose: string;
  cleanerParts: number;
  waterParts: number;
  dilutionLabel: string;
  minSqftPerConcentrateGallon: number;
  maxSqftPerConcentrateGallon: number;
  sourcePage: number;
}

export interface PrepSystem {
  id: PrepConditionId;
  sipType: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  label: string;
  description: string;
  useWhen: string;
  cleanerSteps: readonly PrepCleanerStep[];
  requiresLiquidMembrane: boolean;
  sourcePage: number;
  assemblyNote?: string;
}

export const SIP_PREP_SOURCE = 'Open SIP manual - master copy v2019-3 2.pdf';
export const CLEANER_COVERAGE_SOURCE = 'Modern Arc Ontario Dealer Pricing 2026 PDF p.4';
export const CLEANER_COVERAGE_CAVEAT =
  'Dealer planning coverage per gallon of cleaner concentrate/package for each required pass. The SIP manual controls cleaner order and dilution. Actual use varies with porosity, texture, contamination, application method, and repeat cleaning; confirm site conditions before ordering.';

const COVERAGE = {
  'STONE-SOAP': { min: 200, max: 250 },
  'POWER-CLEANER': { min: 300, max: 450 },
  'NU-LIFT': { min: 200, max: 250 },
} as const satisfies Record<PrepCleanerSku, { min: number; max: number }>;

function cleanerStep({
  order,
  productSku,
  purpose,
  cleanerParts,
  waterParts,
  sourcePage,
}: {
  order: number;
  productSku: PrepCleanerSku;
  purpose: string;
  cleanerParts: number;
  waterParts: number;
  sourcePage: number;
}): PrepCleanerStep {
  const names: Record<PrepCleanerSku, string> = {
    'STONE-SOAP': 'SEMCO Stone Soap',
    'POWER-CLEANER': 'SEMCO Power Cleaner',
    'NU-LIFT': 'SEMCO Nu-Lift Cleaner',
  };
  const coverage = COVERAGE[productSku];

  return {
    order,
    productSku,
    productName: names[productSku],
    purpose,
    cleanerParts,
    waterParts,
    dilutionLabel: waterParts === 0 ? 'Undiluted' : `${cleanerParts}:${waterParts} cleaner to water`,
    minSqftPerConcentrateGallon: coverage.min,
    maxSqftPerConcentrateGallon: coverage.max,
    sourcePage,
  };
}

export const PREP_SYSTEMS: readonly PrepSystem[] = [
  {
    id: 'type_a',
    sipType: 'A',
    label: 'Clean / unsealed surface',
    description: 'SIP Type A - one standard cleaning pass.',
    useWhen: 'Unsealed or non-waxed concrete, non-waxed natural stone or vinyl, metal, Formica, or glass.',
    cleanerSteps: [
      cleanerStep({
        order: 1,
        productSku: 'STONE-SOAP',
        purpose: 'Standard wash; scrub, rinse, and allow the surface to dry.',
        cleanerParts: 1,
        waterParts: 4,
        sourcePage: 20,
      }),
    ],
    requiresLiquidMembrane: false,
    sourcePage: 20,
  },
  {
    id: 'type_b',
    sipType: 'B',
    label: 'Oil, wax, glue, paint, or coating',
    description: 'SIP Type B - contaminant removal followed by a final wash.',
    useWhen: 'Commercial kitchens, epoxy, terrazzo, carpet glue, wax, paint, sealer, or non-permanent topical coatings.',
    cleanerSteps: [
      cleanerStep({
        order: 1,
        productSku: 'POWER-CLEANER',
        purpose: 'Remove grease, glue, paint, wax, sealer, and topical residue; then rinse.',
        cleanerParts: 1,
        waterParts: 4,
        sourcePage: 21,
      }),
      cleanerStep({
        order: 2,
        productSku: 'STONE-SOAP',
        purpose: 'Final wash to remove cleaner residue and pH-balance; then rinse and dry.',
        cleanerParts: 1,
        waterParts: 4,
        sourcePage: 21,
      }),
    ],
    requiresLiquidMembrane: false,
    sourcePage: 21,
  },
  {
    id: 'type_c',
    sipType: 'C',
    label: 'Unknown, stamped, exterior, or pool',
    description: 'SIP Type C - three ordered passes for unsure or demanding surface conditions.',
    useWhen: 'Unsure pre-existing surface conditions, stamped concrete, exteriors, and the default pool prep plan.',
    cleanerSteps: [
      cleanerStep({
        order: 1,
        productSku: 'POWER-CLEANER',
        purpose: 'First degreasing and coating-residue removal pass; then rinse.',
        cleanerParts: 1,
        waterParts: 4,
        sourcePage: 22,
      }),
      cleanerStep({
        order: 2,
        productSku: 'NU-LIFT',
        purpose: 'Remove mineral deposits, efflorescence, alkali, and magnesium; then rinse.',
        cleanerParts: 1,
        waterParts: 1,
        sourcePage: 22,
      }),
      cleanerStep({
        order: 3,
        productSku: 'POWER-CLEANER',
        purpose: 'Final pH-balancing and contaminant-cleaning pass; then rinse and dry.',
        cleanerParts: 1,
        waterParts: 9,
        sourcePage: 22,
      }),
    ],
    requiresLiquidMembrane: false,
    sourcePage: 22,
  },
  {
    id: 'type_d',
    sipType: 'D',
    label: 'Tile, masonry, or mineral deposits',
    description: 'SIP Type D - mineral removal followed by a final wash.',
    useWhen: 'Exterior block, stucco, below-grade plaster, tile, magnesium, calcium, mineral, alkali, or efflorescence contamination.',
    cleanerSteps: [
      cleanerStep({
        order: 1,
        productSku: 'NU-LIFT',
        purpose: 'Undiluted mineral and efflorescence removal pass; then rinse.',
        cleanerParts: 1,
        waterParts: 0,
        sourcePage: 23,
      }),
      cleanerStep({
        order: 2,
        productSku: 'STONE-SOAP',
        purpose: 'Final wash to remove cleaner residue and pH-balance; then rinse and dry.',
        cleanerParts: 1,
        waterParts: 4,
        sourcePage: 23,
      }),
    ],
    requiresLiquidMembrane: false,
    sourcePage: 23,
  },
  {
    id: 'type_e',
    sipType: 'E',
    label: 'Wood / plywood / OSB',
    description: 'SIP Type E - no cleaner quantity; membrane-and-fabric assembly preparation.',
    useWhen: 'Wood, plywood, or OSB substrates.',
    cleanerSteps: [],
    requiresLiquidMembrane: true,
    sourcePage: 24,
    assemblyNote: 'Sweep and secure the wood. Apply Liquid Membrane, embed anti-fracture fabric while wet with at least 2-inch overlaps, and fully encapsulate the fabric before X-Bond.',
  },
  {
    id: 'surface_ready',
    sipType: null,
    label: 'Stable board / top surface',
    description: 'Surface-readiness check - no cleaner quantity is assumed.',
    useWhen: 'Stable, clean, dry wall board or a heated-floor assembly whose actual top surface does not call for an SIP cleaner system.',
    cleanerSteps: [],
    requiresLiquidMembrane: false,
    sourcePage: 15,
    assemblyNote: 'Verify the board or actual top surface is clean, dry, securely fastened, and stable. Select SIP Type A-D instead when the actual surface or contamination calls for cleaning.',
  },
] as const;

export const PREP_SYSTEM_MAP = Object.fromEntries(
  PREP_SYSTEMS.map((system) => [system.id, system]),
) as Record<PrepConditionId, PrepSystem>;

export const REQUIRED_PREP_CONDITIONS: Partial<Record<SubstrateId, PrepConditionId>> = {
  plywood: 'type_e',
  existing_tile: 'type_d',
  pool: 'type_c',
};

const DEFAULT_PREP_CONDITIONS: Record<SubstrateId, PrepConditionId> = {
  concrete: 'type_a',
  plywood: 'type_e',
  icf: 'type_a',
  metal: 'type_a',
  existing_tile: 'type_d',
  gypsum_board: 'surface_ready',
  pool: 'type_c',
  concrete_block: 'type_d',
  cement_board: 'surface_ready',
  existing_paint: 'type_b',
  heated_floor: 'surface_ready',
};

export function getPrepSystem(id: PrepConditionId): PrepSystem {
  return PREP_SYSTEM_MAP[id];
}

export function getDefaultPrepCondition(substrate: SubstrateId): PrepConditionId {
  return DEFAULT_PREP_CONDITIONS[substrate];
}

export function getRequiredPrepCondition(substrate: SubstrateId): PrepConditionId | null {
  return REQUIRED_PREP_CONDITIONS[substrate] ?? null;
}

export function isPrepConditionLocked(substrate: SubstrateId): boolean {
  return getRequiredPrepCondition(substrate) !== null;
}

export function getAvailablePrepSystems(substrate: SubstrateId): readonly PrepSystem[] {
  const required = getRequiredPrepCondition(substrate);
  if (required) return [getPrepSystem(required)];
  if (substrate === 'gypsum_board' || substrate === 'cement_board' || substrate === 'heated_floor') {
    return [getPrepSystem('surface_ready')];
  }

  const selectableIds: readonly PrepConditionId[] = substrate === 'metal'
    ? ['type_a', 'type_b', 'type_c']
    : ['type_a', 'type_b', 'type_c', 'type_d'];
  return selectableIds.map(getPrepSystem);
}

export function resolvePrepCondition(
  substrate: SubstrateId,
  requested?: PrepConditionId,
): PrepConditionId {
  const required = getRequiredPrepCondition(substrate);
  if (required) return required;
  const available = getAvailablePrepSystems(substrate);
  if (requested && available.some((system) => system.id === requested)) return requested;
  return getDefaultPrepCondition(substrate);
}

export function isLiquidMembraneRequired(
  substrate: SubstrateId,
  prepCondition?: PrepConditionId,
  installationScope: InstallationScope = 'floor_or_other',
): boolean {
  if (substrate === 'pool' || installationScope === 'submerged') return true;
  if (installationScope === 'wet_area') return true;
  if (substrate === 'plywood' || substrate === 'existing_tile') return true;
  return prepCondition === 'type_e';
}
