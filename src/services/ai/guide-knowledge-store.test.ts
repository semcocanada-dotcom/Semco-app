import { GUIDE_PRODUCTS } from '@/knowledge/guide-products';
import { loadGuideProducts, shouldUseBundledGuideKnowledge } from './guide-knowledge-store';

const mockWhere = jest.fn();
jest.mock('@/database/client', () => ({
  GUIDE_KNOWLEDGE_PERSISTENCE: 'sqlite',
  db: { select: () => ({ from: () => ({ where: mockWhere }) }) },
}));
jest.mock('@/database/schema/guide-knowledge', () => ({ guideKnowledge: { kind: 'kind', version: 'version' } }));
jest.mock('drizzle-orm', () => ({ and: (...args: unknown[]) => args, eq: (key: string, value: string) => [key, value] }));

describe('offline reviewed knowledge database', () => {
  it('reads the current version of seeded product knowledge', async () => {
    const copy = JSON.parse(JSON.stringify(GUIDE_PRODUCTS[0]));
    mockWhere.mockResolvedValueOnce([{ id: `product:${copy.id}`, content: copy }]);
    const result = await loadGuideProducts(mockWhere);
    expect(result[0]).toBe(copy);
    expect(mockWhere).toHaveBeenCalled();
  });
  it('rejects unreviewed or malformed technical content and fills missing entries', async () => {
    mockWhere.mockResolvedValueOnce([{ id: 'product:x-bond', content: { ...GUIDE_PRODUCTS[0], firstSteps: ['Add arbitrary water'] } }]);
    expect(await loadGuideProducts(mockWhere)).toEqual(GUIDE_PRODUCTS);
  });
  it('uses the bundled guide when web has no guide_knowledge table', () => {
    expect(shouldUseBundledGuideKnowledge('bundled-fallback')).toBe(true);
    expect(shouldUseBundledGuideKnowledge('sqlite')).toBe(false);
    expect(shouldUseBundledGuideKnowledge(undefined)).toBe(false);
  });
  it('still answers from the bundled knowledge when local cache cannot be read', async () => {
    mockWhere.mockRejectedValueOnce(new Error('database unavailable'));
    expect(await loadGuideProducts(mockWhere)).toEqual(GUIDE_PRODUCTS);
  });
});
