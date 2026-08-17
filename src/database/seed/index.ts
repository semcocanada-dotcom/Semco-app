import { db } from '../client';
import { products } from '../schema/products';
import { colors } from '../schema/colors';
import productsData from './products.json';
import colorsData from './colors.json';

export async function seedDatabase() {
  const existing = await db.select().from(products).limit(1);
  if (existing.length > 0) return; // already seeded

  await db.insert(products).values(
    (productsData as typeof products.$inferInsert[]).map((p) => ({
      ...p,
      coverageMinSqmPerKg: p.coverageMinSqmPerKg ?? null,
      coverageMaxSqmPerKg: p.coverageMaxSqmPerKg ?? null,
      packSizeKg: p.packSizeKg ?? 1,
      potLifeMinutes: p.potLifeMinutes ?? null,
      cureTimeHours: p.cureTimeHours ?? null,
    })),
  );

  await db.insert(colors).values(
    (colorsData as typeof colors.$inferInsert[]).map((c) => ({
      ...c,
      pigments: JSON.stringify(c.pigments),
    })),
  );
}
