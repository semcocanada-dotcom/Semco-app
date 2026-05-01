import { Product, CartItem, SavedJob } from "./types";

export const products: Product[] = [
  { id: 1, name: "All-Purpose Drywall Compound", sku: "BTT-001", price: 24.99, unit: "4.5L pail", category: "Compound" },
  { id: 2, name: "Paper Joint Tape", sku: "BTT-002", price: 8.49, unit: "75m roll", category: "Tape" },
  { id: 3, name: "Coarse Thread Drywall Screws", sku: "BTT-003", price: 12.99, unit: "1lb box", category: "Fasteners" },
  { id: 4, name: "Metal Corner Bead", sku: "BTT-004", price: 4.99, unit: "each", category: "Beads" },
  { id: 5, name: "Sanding Sponge", sku: "BTT-005", price: 3.49, unit: "each", category: "Finishing" },
  { id: 6, name: "Finishing Trowel 10\"", sku: "BTT-006", price: 34.99, unit: "each", category: "Tools" },
  { id: 7, name: "Mud Pan", sku: "BTT-007", price: 14.99, unit: "each", category: "Tools" },
  { id: 8, name: "Lightweight Compound", sku: "BTT-008", price: 19.99, unit: "4.5L pail", category: "Compound" },
  { id: 9, name: "Mesh Joint Tape", sku: "BTT-009", price: 6.99, unit: "50m roll", category: "Tape" },
  { id: 10, name: "Hawk 13\"", sku: "BTT-010", price: 29.99, unit: "each", category: "Tools" },
  { id: 11, name: "Setting-Type Compound", sku: "BTT-011", price: 18.49, unit: "4kg bag", category: "Compound" },
  { id: 12, name: "Fine Grit Sandpaper", sku: "BTT-012", price: 5.99, unit: "10-pack", category: "Finishing" },
];

export const lastOrder: CartItem[] = [
  { product: products[0], quantity: 3 },
  { product: products[1], quantity: 5 },
  { product: products[2], quantity: 2 },
  { product: products[7], quantity: 2 },
];

export const savedJobs: SavedJob[] = [
  { id: 1, name: "Maple Ridge Condos", address: "Unit 4B, 12450 Maple Ridge Rd", itemCount: 8 },
  { id: 2, name: "Downtown Office Reno", address: "1150 Jasper Ave, 3rd Floor", itemCount: 12 },
];

export const smartSuggestions: Product[] = [
  products[3],
  products[4],
  products[6],
];

export const recentItems: Product[] = [
  products[0],
  products[1],
  products[2],
];
