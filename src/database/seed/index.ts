import { db, GUIDE_KNOWLEDGE_PERSISTENCE } from '../client';
import { products } from '../schema/products';
import { colors } from '../schema/colors';
import { eq, sql } from 'drizzle-orm';
import productsData from './products.json';
import colorsData from './colors.json';
import { DEPRECATED_SEALER_SKUS } from '@/constants/stocked-sealers';
import { guideKnowledge } from '../schema/guide-knowledge';
import {
  GUIDE_KNOWLEDGE_SEED_ID,
  buildGuideKnowledgeSeedRows,
  isGuideKnowledgeSeedCurrent,
} from './guide-knowledge-seed';

const SQLITE_INSERT_CHUNK_SIZE = 40;

async function seedGuideKnowledge() {
  // Web preview has no guide_knowledge table. Callers use the bundled guide.
  if (GUIDE_KNOWLEDGE_PERSISTENCE !== 'sqlite') return;

  const rows = buildGuideKnowledgeSeedRows();
  const [stored] = await db.select().from(guideKnowledge).where(eq(guideKnowledge.id, GUIDE_KNOWLEDGE_SEED_ID)).limit(1);
  if (isGuideKnowledgeSeedCurrent(stored, rows)) return;

  db.transaction((tx) => {
    for (let index = 0; index < rows.length; index += SQLITE_INSERT_CHUNK_SIZE) {
      const chunk = rows.slice(index, index + SQLITE_INSERT_CHUNK_SIZE);
      tx.insert(guideKnowledge).values(chunk).onConflictDoUpdate({
        target: guideKnowledge.id,
        set: {
          content: sql`excluded.content`,
          kind: sql`excluded.kind`,
          version: sql`excluded.version`,
        },
      }).run();
    }
  });
}

export async function seedDatabase() {
  // Additive local knowledge updates never delete installer chats or projects.
  await seedGuideKnowledge();

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
