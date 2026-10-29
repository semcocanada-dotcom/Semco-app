import { GUIDE_KNOWLEDGE_VERSION, GUIDE_PRODUCTS, type GuideProductKnowledge } from '@/knowledge/guide-products';

/** Web sets this to bundled-fallback. Any other value, including a test mock, still tries SQLite. */
export function shouldUseBundledGuideKnowledge(persistence: string | undefined): boolean {
  return persistence === 'bundled-fallback';
}

/** Read a versioned local snapshot. The bundle is also the offline/recovery source. */
async function readSavedProductRows(): Promise<{ id: string; content: unknown }[]> {
  const { db, GUIDE_KNOWLEDGE_PERSISTENCE } = await import('@/database/client');
  const { guideKnowledge } = await import('@/database/schema/guide-knowledge');
  const { and, eq } = await import('drizzle-orm');
  // Web has no guide_knowledge table. An empty read makes every row use the bundle.
  if (shouldUseBundledGuideKnowledge(GUIDE_KNOWLEDGE_PERSISTENCE)) return [];
  return db.select().from(guideKnowledge).where(and(
    eq(guideKnowledge.kind, 'product'), eq(guideKnowledge.version, GUIDE_KNOWLEDGE_VERSION),
  ));
}

export async function loadGuideProducts(readRows = readSavedProductRows): Promise<readonly GuideProductKnowledge[]> {
  try {
    const rows = await readRows();
    const byId = new Map(rows.map((row) => [row.id, row.content]));
    // Do not accept stale, malformed or unreviewed text as technical guidance.
    // Each missing/invalid row falls back independently, preserving offline use.
    return GUIDE_PRODUCTS.map((bundled) => {
      const saved = byId.get(`product:${bundled.id}`);
      return JSON.stringify(saved) === JSON.stringify(bundled) ? saved as GuideProductKnowledge : bundled;
    });
  } catch {
    // Web preview, first boot and failed cache reads still have reviewed content.
    return GUIDE_PRODUCTS;
  }
}
