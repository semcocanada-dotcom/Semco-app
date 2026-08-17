import { Product } from "./types";

// Single source of truth for deal pricing.
// A product with salePrice set is "on deal" everywhere automatically.

export function effectivePrice(p: Product): number {
  return p.salePrice ?? p.price;
}

export function savings(p: Product): number {
  return p.salePrice ? p.price - p.salePrice : 0;
}

export function savingsPct(p: Product): number {
  return p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0;
}
