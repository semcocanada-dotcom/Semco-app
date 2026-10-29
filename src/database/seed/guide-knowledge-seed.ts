import { GUIDE_KNOWLEDGE_VERSION, GUIDE_PRODUCTS, GUIDE_TERMS } from '@/knowledge/guide-products';
import { GUIDE_VIDEOS } from '@/knowledge/guide-videos';

export const GUIDE_KNOWLEDGE_SEED_ID = 'meta:guide-knowledge-seed';
export const GUIDE_KNOWLEDGE_SEED_KIND = 'seed-marker';

export interface GuideKnowledgeSeedRow {
  id: string;
  kind: string;
  version: string;
  content: unknown;
}

/** Stable FNV-1a hash. No Node crypto, so the same value is produced on device. */
export function hashGuideKnowledgeSeed(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function buildGuideKnowledgeContentRows(version = GUIDE_KNOWLEDGE_VERSION): GuideKnowledgeSeedRow[] {
  return [
    ...GUIDE_PRODUCTS.map((content) => ({ id: `product:${content.id}`, kind: 'product', version, content })),
    ...GUIDE_TERMS.map((content) => ({ id: `term:${content.term}`, kind: 'term', version, content })),
    ...GUIDE_VIDEOS.map((content) => ({ id: `video:${content.id}`, kind: 'video', version, content })),
  ];
}

export function guideKnowledgeSeedHash(
  rows: readonly GuideKnowledgeSeedRow[] = buildGuideKnowledgeContentRows(),
): string {
  const canonical = JSON.stringify(rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    version: row.version,
    content: row.content,
  })));
  return hashGuideKnowledgeSeed(canonical);
}

export function buildGuideKnowledgeSeedRows(version = GUIDE_KNOWLEDGE_VERSION): GuideKnowledgeSeedRow[] {
  const contentRows = buildGuideKnowledgeContentRows(version);
  return [
    ...contentRows,
    {
      id: GUIDE_KNOWLEDGE_SEED_ID,
      kind: GUIDE_KNOWLEDGE_SEED_KIND,
      version,
      content: { hash: guideKnowledgeSeedHash(contentRows) },
    },
  ];
}

export function isGuideKnowledgeSeedCurrent(
  stored: { version?: string | null; content?: unknown } | null | undefined,
  rows: readonly GuideKnowledgeSeedRow[] = buildGuideKnowledgeSeedRows(),
): boolean {
  const marker = rows.find((row) => row.id === GUIDE_KNOWLEDGE_SEED_ID);
  const expectedHash = marker && typeof marker.content === 'object' && marker.content && 'hash' in marker.content
    ? (marker.content as { hash: unknown }).hash
    : undefined;
  if (!stored || stored.version !== marker?.version || typeof expectedHash !== 'string') return false;
  const saved = stored.content;
  const savedHash = saved && typeof saved === 'object' && 'hash' in saved
    ? (saved as { hash: unknown }).hash
    : undefined;
  return savedHash === expectedHash;
}
