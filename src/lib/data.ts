import { Product, CartItem, SavedJob, Kit } from "./types";

// ─── Products ─────────────────────────────────────────────────────────────────
// Drop real image URLs into the `image` field — the ProductImage component
// will use them automatically and fall back to the placeholder otherwise.

export const products: Product[] = [
  {
    id: 1, name: "All-Purpose Drywall Compound", sku: "BTT-001",
    price: 24.99, unit: "4.5L pail", category: "Compound",
    brand: "CGC", prosUsing: 34, inStock: true,
    description: "Ready-mixed all-purpose compound for taping, topping, and texturing. Smooth consistency, easy sanding.",
  },
  {
    id: 2, name: "Paper Joint Tape", sku: "BTT-002",
    price: 8.49, unit: "75m roll", category: "Tape",
    brand: "CGC", prosUsing: 41, inStock: true,
    description: "High-strength paper tape for drywall joints. Resists shrinking and cracking.",
  },
  {
    id: 3, name: "Coarse Thread Drywall Screws", sku: "BTT-003",
    price: 12.99, unit: "1lb box", category: "Fasteners",
    brand: "Grabber", prosUsing: 28, inStock: true,
    description: "Coarse thread screws for wood framing. Bugle head, phosphate coated.",
  },
  {
    id: 4, name: "Metal Corner Bead", sku: "BTT-004",
    price: 4.99, unit: "each", category: "Beads",
    brand: "Clarkwestern", prosUsing: 19, inStock: true,
    description: "Standard metal corner bead for crisp, durable outside corners.",
  },
  {
    id: 5, name: "Sanding Sponge", sku: "BTT-005",
    price: 3.49, unit: "each", category: "Finishing",
    brand: "3M", prosUsing: 22, inStock: true,
    description: "Dual-grit sanding sponge. Fine on one side, medium on the other.",
  },
  {
    id: 6, name: "Finishing Trowel 10\"", sku: "BTT-006",
    price: 34.99, unit: "each", category: "Tools",
    brand: "Marshalltown", prosUsing: 31, inStock: true,
    description: "Professional stainless steel finishing trowel with soft-grip handle. 10\" blade.",
  },
  {
    id: 7, name: "Mud Pan", sku: "BTT-007",
    price: 14.99, unit: "each", category: "Tools",
    brand: "Marshalltown", prosUsing: 27, inStock: true,
    description: "14\" plastic mud pan with comfort grip. Lightweight, easy to clean.",
  },
  {
    id: 8, name: "Lightweight Compound", sku: "BTT-008",
    price: 19.99, unit: "4.5L pail", category: "Compound",
    brand: "CGC", prosUsing: 38, inStock: true,
    description: "Lightweight topping compound. 35% less weight, easier sanding, minimal shrinkage.",
  },
  {
    id: 9, name: "Mesh Joint Tape", sku: "BTT-009",
    price: 6.99, unit: "50m roll", category: "Tape",
    brand: "Saint-Gobain", prosUsing: 15, inStock: true,
    description: "Self-adhesive fibreglass mesh tape. Great for repairs and butt joints.",
  },
  {
    id: 10, name: "Hawk 13\"", sku: "BTT-010",
    price: 29.99, unit: "each", category: "Tools",
    brand: "Marshalltown", prosUsing: 24, inStock: true,
    description: "Lightweight aluminium hawk with soft-grip handle. 13\" platform.",
  },
  {
    id: 11, name: "Setting-Type Compound", sku: "BTT-011",
    price: 18.49, unit: "4kg bag", category: "Compound",
    brand: "Durabond", prosUsing: 20, inStock: true,
    description: "Fast-setting chemical compound. Sets in 20 minutes. Ideal for fills and repairs.",
  },
  {
    id: 12, name: "Fine Grit Sandpaper", sku: "BTT-012",
    price: 5.99, unit: "10-pack", category: "Finishing",
    brand: "Norton", prosUsing: 18, inStock: false,
    description: "220-grit sandpaper sheets for smooth finish work. 9×11\" sheets.",
  },
];

// ─── Last order (reorder flow) ────────────────────────────────────────────────
export const lastOrder: CartItem[] = [
  { product: products[0], quantity: 3 },
  { product: products[1], quantity: 5 },
  { product: products[2], quantity: 2 },
  { product: products[7], quantity: 2 },
];

// ─── Kits ─────────────────────────────────────────────────────────────────────
export const kits: Kit[] = [
  {
    id: 1,
    name: "Finishing Kit",
    description: "Everything for a smooth finish coat",
    category: "Finishing",
    items: [
      { product: products[7], quantity: 2 }, // Lightweight Compound
      { product: products[1], quantity: 3 }, // Paper Tape
      { product: products[4], quantity: 2 }, // Sanding Sponge
      { product: products[5], quantity: 1 }, // Finishing Trowel
      { product: products[6], quantity: 1 }, // Mud Pan
      { product: products[11], quantity: 1 }, // Sandpaper
    ],
  },
  {
    id: 2,
    name: "Drywall Hang & Tape",
    description: "Full hang, tape, and mud kit",
    category: "Tape",
    items: [
      { product: products[0], quantity: 4 }, // AP Compound
      { product: products[1], quantity: 5 }, // Paper Tape
      { product: products[2], quantity: 3 }, // Screws
      { product: products[3], quantity: 6 }, // Corner Bead
      { product: products[8], quantity: 2 }, // Mesh Tape
      { product: products[10], quantity: 1 }, // Setting Compound
    ],
  },
  {
    id: 3,
    name: "Tool Starter Pack",
    description: "Essential tools for new crew members",
    category: "Tools",
    items: [
      { product: products[5], quantity: 1 }, // Finishing Trowel
      { product: products[6], quantity: 1 }, // Mud Pan
      { product: products[9], quantity: 1 }, // Hawk
    ],
  },
];

// ─── Saved jobs ───────────────────────────────────────────────────────────────
export const savedJobs: SavedJob[] = [
  { id: 1, name: "Maple Ridge Condos", address: "Unit 4B, 12450 Maple Ridge Rd", itemCount: 8 },
  { id: 2, name: "Downtown Office Reno", address: "1150 Jasper Ave, 3rd Floor", itemCount: 12 },
];

// ─── Smart suggestions ────────────────────────────────────────────────────────
export const smartSuggestions: Product[] = [
  products[2], // Screws
  products[3], // Corner Bead
  products[4], // Sanding Sponge
];

// ─── Home – "Tools Pros Are Using" ───────────────────────────────────────────
export const proTools = [
  { product: products[5], prosCount: 31 }, // Finishing Trowel
  { product: products[1], prosCount: 41 }, // Paper Tape
  { product: products[9], prosCount: 24 }, // Hawk
];

// ─── Recent items ─────────────────────────────────────────────────────────────
export const recentItems: Product[] = [products[0], products[1], products[2]];
