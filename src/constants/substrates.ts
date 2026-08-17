export type SubstrateId =
  | 'concrete'
  | 'concrete_block'
  | 'plywood'
  | 'cement_board'
  | 'existing_tile'
  | 'existing_paint'
  | 'gypsum_board'
  | 'heated_floor';

export interface SubstrateDefinition {
  id: SubstrateId;
  label: string;
  description: string;
  requiresPrimer2K: boolean;
  notes?: string;
}

export const SUBSTRATES: SubstrateDefinition[] = [
  {
    id: 'concrete',
    label: 'Concrete',
    description: 'Poured or pre-cast concrete slab',
    requiresPrimer2K: true,
  },
  {
    id: 'concrete_block',
    label: 'Concrete Block / CMU',
    description: 'Concrete masonry unit walls',
    requiresPrimer2K: true,
    notes: 'May require a skim coat before microcement if surface is highly porous',
  },
  {
    id: 'plywood',
    label: 'Plywood / OSB',
    description: 'Structural wood subfloor',
    requiresPrimer2K: true,
    notes: 'Minimum 18mm plywood. Screw every 150mm to eliminate flex.',
  },
  {
    id: 'cement_board',
    label: 'Cement Board / Backer Board',
    description: 'Fibre cement tile backer',
    requiresPrimer2K: true,
  },
  {
    id: 'existing_tile',
    label: 'Existing Tile',
    description: 'Ceramic, porcelain, or stone tile in good condition',
    requiresPrimer2K: true,
    notes: 'Grout lines must be filled flush with Semco Filler before priming.',
  },
  {
    id: 'existing_paint',
    label: 'Existing Paint / Coating',
    description: 'Previously painted or coated surface',
    requiresPrimer2K: false,
    notes: 'Test adhesion with crosshatch test. Remove any flaking paint before applying Semco Adhesion Primer.',
  },
  {
    id: 'gypsum_board',
    label: 'Drywall / Gypsum Board',
    description: 'Standard interior gypsum wallboard',
    requiresPrimer2K: false,
    notes: 'Walls only — not suitable for floors. Use Semco Adhesion Primer.',
  },
  {
    id: 'heated_floor',
    label: 'Heated Floor (UFH)',
    description: 'In-floor radiant heating system (electric or hydronic)',
    requiresPrimer2K: true,
    notes: 'Turn off heating 24h before application. Do not exceed 28°C surface temp during curing.',
  },
];

export const SUBSTRATE_MAP = Object.fromEntries(
  SUBSTRATES.map((s) => [s.id, s]),
) as Record<SubstrateId, SubstrateDefinition>;
