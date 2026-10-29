import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  GUIDE_KNOWLEDGE_SEED_ID,
  buildGuideKnowledgeContentRows,
  buildGuideKnowledgeSeedRows,
  guideKnowledgeSeedHash,
  isGuideKnowledgeSeedCurrent,
} from './guide-knowledge-seed';

const REPO_ROOT = path.resolve(__dirname, '../../..');

describe('guide knowledge seed gate', () => {
  const rows = buildGuideKnowledgeSeedRows();
  const marker = rows.find((row) => row.id === GUIDE_KNOWLEDGE_SEED_ID);

  it('stores one versioned hash marker after the content rows', () => {
    expect(marker?.kind).toBe('seed-marker');
    expect(marker?.version).toBe('2026-09-11.1');
    expect(isGuideKnowledgeSeedCurrent(marker, rows)).toBe(true);
    expect(buildGuideKnowledgeContentRows().some((row) => row.id === GUIDE_KNOWLEDGE_SEED_ID)).toBe(false);
  });

  it('reseeds when the version or content hash does not match', () => {
    expect(isGuideKnowledgeSeedCurrent(undefined, rows)).toBe(false);
    expect(isGuideKnowledgeSeedCurrent({ version: '2026-09-08', content: marker?.content }, rows)).toBe(false);
    expect(isGuideKnowledgeSeedCurrent({ version: marker?.version, content: { hash: 'stale' } }, rows)).toBe(false);
    const changed = buildGuideKnowledgeContentRows();
    changed[0] = { ...changed[0], content: { id: 'changed' } };
    expect(guideKnowledgeSeedHash(changed)).not.toBe(guideKnowledgeSeedHash());
  });

  it('does not call the full seed from the colour screens', () => {
    const index = readFileSync(path.join(REPO_ROOT, 'app/(app)/colors/index.tsx'), 'utf8');
    const detail = readFileSync(path.join(REPO_ROOT, 'app/(app)/colors/[id].tsx'), 'utf8');
    expect(index).not.toMatch(/seedDatabase/);
    expect(detail).not.toMatch(/seedDatabase/);
  });
});
