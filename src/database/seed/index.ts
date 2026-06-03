import { db } from '../client';
import { products } from '../schema/products';
import { colors } from '../schema/colors';
import { eq } from 'drizzle-orm';
import productsData from './products.json';
import colorsData from './colors.json';

export async function seedDatabase() {
  const existing = await db.select().from(products).limit(1);
  if (existing.length === 0) {
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
  }

  const seededColors = (colorsData as typeof colors.$inferInsert[]).map((c) => ({
    ...c,
    pigments: JSON.stringify(c.pigments),
    swatchHex: c.swatchHex ?? null,
  }));

  const existingColors = await db.select().from(colors);
  const standardColorCount = existingColors.filter((c) => c.isStandard).length;
  if (standardColorCount < seededColors.length) {
    await db.delete(colors).where(eq(colors.isStandard, true));
    await db.insert(colors).values(seededColors);
  }
}
