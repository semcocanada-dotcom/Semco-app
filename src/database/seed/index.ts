import { db } from '../client';
import { products } from '../schema/products';
import { colors } from '../schema/colors';
import { eq } from 'drizzle-orm';
import productsData from './products.json';
import colorsData from './colors.json';
import { DEPRECATED_SEALER_SKUS } from '@/constants/stocked-sealers';

const SQLITE_INSERT_CHUNK_SIZE = 40;

export async function seedDatabase() {
  for (const sku of DEPRECATED_SEALER_SKUS) {
    await db.delete(products).where(eq(products.sku, sku));
  }

  const seededProducts = (productsData as typeof products.$inferInsert[]).map((p) => ({
    ...p,
    coverageMinSqmPerKg: p.coverageMinSqmPerKg ?? null,
    coverageMaxSqmPerKg: p.coverageMaxSqmPerKg ?? null,
    packSizeKg: p.packSizeKg ?? null,
    potLifeMinutes: p.potLifeMinutes ?? null,
    cureTimeHours: p.cureTimeHours ?? null,
  }));

  for (const product of seededProducts) {
    await db.insert(products).values(product).onConflictDoUpdate({
      target: products.id,
      set: {
        sku: product.sku,
        name: product.name,
        category: product.category,
        coverageMinSqmPerKg: product.coverageMinSqmPerKg,
        coverageMaxSqmPerKg: product.coverageMaxSqmPerKg,
        packSizeKg: product.packSizeKg,
        potLifeMinutes: product.potLifeMinutes,
        cureTimeHours: product.cureTimeHours,
        tdsContent: product.tdsContent,
        updatedAt: product.updatedAt,
      },
    });
  }

  const seededColors = (colorsData as typeof colors.$inferInsert[]).map((c) => ({
    ...c,
    pigments: JSON.stringify(c.pigments),
    swatchHex: c.swatchHex ?? null,
  }));

  const existingColors = await db.select().from(colors);
  const standardColors = existingColors.filter((c) => c.isStandard);
  // Reseed when the bundled fan deck changed: different count, or the
  // sentinel colour carries a different data version (updatedAt stamp).
  const sentinelSeed = seededColors[0];
  const sentinelExisting = sentinelSeed
    ? standardColors.find((c) => c.id === sentinelSeed.id)
    : undefined;
  const colorDataChanged =
    standardColors.length !== seededColors.length
    || (sentinelExisting != null && sentinelExisting.updatedAt !== sentinelSeed.updatedAt);
  if (colorDataChanged) {
    await db.delete(colors).where(eq(colors.isStandard, true));
    for (let i = 0; i < seededColors.length; i += SQLITE_INSERT_CHUNK_SIZE) {
      await db.insert(colors).values(seededColors.slice(i, i + SQLITE_INSERT_CHUNK_SIZE));
    }
  }
}
