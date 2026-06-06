export type SubstrateId =
  | 'concrete'
  | 'plywood'
  | 'icf'
  | 'metal'
  | 'existing_tile'
  | 'gypsum_board'
  | 'pool'
  | 'concrete_block'
  | 'cement_board'
  | 'existing_paint'
  | 'heated_floor';

export interface SubstrateDefinition {
  id: SubstrateId;
  label: string;
  description: string;
  requiresPrimer2K: boolean;
  notes?: string;
  visible?: boolean;
}

export const SUBSTRATES: SubstrateDefinition[] = [
  {
    id: 'concrete',
    label: 'Concrete',
    description: 'Poured, pre-cast, or broom-finished concrete',
    requiresPrimer2K: true,
    visible: true,
  },
  {
    id: 'plywood',
    label: 'Plywood / OSB',
    description: 'Structural wood floor or panel',
    requiresPrimer2K: true,
    notes: 'Secure the floor first. Any movement in wood framing can telegraph through the coating.',
    visible: true,
  },
  {
    id: 'icf',
    label: 'ICF',
    description: 'Insulated concrete form wall or foundation',
    requiresPrimer2K: true,
    visible: true,
  },
  {
    id: 'metal',
    label: 'Metal',
    description: 'Prepared metal surface',
    requiresPrimer2K: true,
    notes: 'Confirm cleaning, surface profile, and adhesion before coating metal.',
    visible: true,
  },
  {
    id: 'existing_tile',
    label: 'Tile',
    description: 'Ceramic, porcelain, or stone tile in good condition',
    requiresPrimer2K: true,
    notes: 'Fill grout lines flush before coating.',
    visible: true,
  },
  {
    id: 'gypsum_board',
    label: 'Drywall',
    description: 'Interior wallboard',
    requiresPrimer2K: false,
    notes: 'Walls only. Do not use drywall as a floor substrate.',
    visible: true,
  },
  {
    id: 'pool',
    label: 'Pool',
    description: 'Pool, submerged, or continuous wet exposure',
    requiresPrimer2K: true,
    notes: 'Pool work uses the wet-area Liquid Membrane rate when membrane is included.',
    visible: true,
  },
  {
    id: 'concrete_block',
    label: 'Concrete Block / CMU',
    description: 'Legacy option kept for saved projects',
    requiresPrimer2K: true,
    visible: false,
  },
  {
    id: 'cement_board',
    label: 'Cement Board',
    description: 'Legacy option kept for saved projects',
    requiresPrimer2K: true,
    visible: false,
  },
  {
    id: 'existing_paint',
    label: 'Paint / Coating',
    description: 'Legacy option kept for saved projects',
    requiresPrimer2K: false,
    visible: false,
  },
  {
    id: 'heated_floor',
    label: 'Heated Floor',
    description: 'Legacy option kept for saved projects',
    requiresPrimer2K: true,
    visible: false,
  },
];

export const VISIBLE_SUBSTRATES = SUBSTRATES.filter((substrate) => substrate.visible !== false);

export const SUBSTRATE_MAP = Object.fromEntries(
  SUBSTRATES.map((s) => [s.id, s]),
) as Record<SubstrateId, SubstrateDefinition>;
