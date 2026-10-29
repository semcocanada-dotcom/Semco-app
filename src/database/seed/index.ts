import { db } from '../client';
import { products } from '../schema/products';
import { colors } from '../schema/colors';
import { eq } from 'drizzle-orm';
import productsData from './products.json';
import colorsData from './colors.json';
import { DEPRECATED_SEALER_SKUS } from '@/constants/stocked-sealers';
import { guideKnowledge } from '../schema/guide-knowledge';
import { GUIDE_KNOWLEDGE_VERSION, GUIDE_PRODUCTS, GUIDE_TERMS } from '@/knowledge/guide-products';
import { GUIDE_VIDEOS } from '@/knowledge/guide-videos';

const SQLITE_INSERT_CHUNK_SIZE = 40;

export async function seedDatabase() {
  // Additive local knowledge updates never delete installer chats or projects.
  const guideRows = [
    ...GUIDE_PRODUCTS.map((content) => ({ id: `product:${content.id}`, kind: 'product', content })),
    ...GUIDE_TERMS.map((content) => ({ id: `term:${content.term}`, kind: 'term', content })),
    ...GUIDE_VIDEOS.map((content) => ({ id: `video:${content.id}`, kind: 'video', content })),
  ];
  for (const row of guideRows) {
    await db.insert(guideKnowledge).values({ ...row, version: GUIDE_KNOWLEDGE_VERSION }).onConflictDoUpdate({
      target: guideKnowledge.id,
      set: { content: row.content, kind: row.kind, version: GUIDE_KNOWLEDGE_VERSION },
    });
  }

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
