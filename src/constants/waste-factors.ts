export type ProductCategory = 'primer' | 'base_coat' | 'finish_coat' | 'sealer' | 'pigment';

// Default waste percentage per category (can be overridden by user)
export const DEFAULT_WASTE_PCT: Record<ProductCategory, number> = {
  primer: 10,
  base_coat: 12,
  finish_coat: 15,   // more waste in finish coats due to trowel work
  sealer: 10,
  pigment: 5,
};

export const WASTE_PCT_MIN = 5;
export const WASTE_PCT_MAX = 30;
export const WASTE_PCT_STEP = 5;
