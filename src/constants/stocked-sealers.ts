export type StockedSealerSku =
  | 'NATURAL-SHIELD'
  | 'SATIN-STONE'
  | 'TITAN-SHIELD'
  | 'MATTE-SEALER';

export const CURRENT_POOL_SEALER_SKU: StockedSealerSku = 'NATURAL-SHIELD';

export const STOCKED_SEALER_POLICY_SOURCE = 'Semco Canada stocked sealer policy';
export const STOCKED_SEALER_POLICY_PAGE = 1;

export const STOCKED_SEALERS = [
  {
    sku: 'NATURAL-SHIELD',
    label: 'Natural',
    productName: 'Natural Shield',
    bestFor: 'Pools, submerged work, exterior exposure, and natural penetrating protection.',
  },
  {
    sku: 'SATIN-STONE',
    label: 'Satin',
    productName: 'Satin Stone',
    bestFor: 'Satin film finish where Satin Stone is specified.',
  },
  {
    sku: 'TITAN-SHIELD',
    label: 'Gloss',
    productName: 'Titan Gloss',
    bestFor: 'Gloss film finish where Titan Gloss is specified.',
  },
  {
    sku: 'MATTE-SEALER',
    label: 'Matte',
    productName: 'Matte',
    bestFor: 'Matte film finish. Current field rule: Titan-like matte finish and slightly harder than Titan.',
  },
] as const satisfies readonly {
  sku: StockedSealerSku;
  label: string;
  productName: string;
  bestFor: string;
}[];

export const DEPRECATED_SEALER_SKUS = ['SEAL-2K-G', 'SEAL-2K-M', 'SEAL-2K-S'] as const;

export const STOCKED_SEALER_POLICY_TEXT = [
  'Current Semco Canada stocked sealers are Natural Shield, Satin Stone, Titan Gloss, and Matte.',
  'These four stocked sealers are enough to cover current Semco Canada applications.',
  'Natural Shield is the current stocked sealer used for pools, submerged conditions, wet exposure, and exterior work. It replaces X-Crete for current pool guidance because it is a penetrating sealer and is best for submerged and exterior exposure.',
  'Satin Stone is the stocked satin finish.',
  'Titan Gloss is the stocked gloss finish.',
  'Matte is a stocked matte finish. Semco Canada field rule: Matte is like Titan Gloss in a matte finish and is slightly harder than Titan.',
  'Do not present X-Crete 400, X-Crete 500, X-Tra Gloss, Xtreme Gloss, Crystal Coat, Colour Coat, or Color Gloss as current stocked Semco Canada sealer options. If older Semco documents mention them, treat them as older reference material unless the installer specifically asks about that older product.',
].join('\n');

export function isStockedSealerSku(sku?: string): sku is StockedSealerSku {
  return STOCKED_SEALERS.some((sealer) => sealer.sku === sku);
}
