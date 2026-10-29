import { buildGuideEducationAnswer, namedGuideProducts } from './guide-education';
import { extractJobContext } from './job-context';
import { GUIDE_PRODUCTS, guideProductCitations } from '@/knowledge/guide-products';
import type { ConversationMessage } from '@/database/schema/conversations';

jest.mock('./guide-knowledge-store', () => ({
  loadGuideProducts: jest.fn(async () => jest.requireActual('@/knowledge/guide-products').GUIDE_PRODUCTS),
}));
const user = (content: string): ConversationMessage => ({ id: content, role: 'user', content, timestamp: '', source: 'local_guide' });
async function answer(question: string, history: ConversationMessage[] = []) {
  return buildGuideEducationAnswer(question, history, extractJobContext(history, question));
}

describe('reviewed local product teaching', () => {
  it.each([
    ['Compare X-Bond Liquid with Liquid Membrane', ['x-bond-liquid', 'liquid-membrane']],
    ['X Bond vs Micro Bond', ['microbond', 'x-bond']],
    ['What is Nu Lift Cleaner?', ['nu-lift']],
    ['Satin and Matte', ['satin-stone', 'matte']],
  ])('matches whole product names: %s', (query, expected) => {
    expect(namedGuideProducts(query).map((product) => product.id).sort()).toEqual([...expected].sort());
  });

  it('does not confuse decorative names or text fragments with products', () => {
    expect(namedGuideProducts('Matter on a textile')).toEqual([]);
  });

  it('gives a direct product overview without technical fragments', async () => {
    const result = await answer('What are the products used for?');
    expect(result?.content).toContain('different jobs');
    expect(result?.content).toContain('**Clean:**');
    expect(result?.content).not.toContain('I need the substrate');
  });

  it('compares main and smoother finish, not an installation quiz', async () => {
    const result = await answer('What is the difference between X-Bond and MicroBond?');
    expect(result?.content).toContain('finer material');
    expect(result?.content).toContain('main X-Bond base');
    expect(result?.quickReplies).toBeUndefined();
    expect(result?.citations?.length).toBeGreaterThan(0);
  });

  it('explains a jargon term without pretending it knows a project', async () => {
    const result = await answer('What does pot life mean?');
    expect(result?.content).toContain('How long a mixed batch stays usable');
    expect(result?.content).not.toContain('35 minutes');
  });

  it('does not supply unverified Matte cure or mixing instructions', async () => {
    const result = await answer('How do I apply Matte sealer?');
    expect(result?.content).toContain('does not provide a verified full Matte application sheet');
    expect(result?.content).not.toContain('Mix 2 parts');
  });

  it('asks only the missing cleaner detail and remembers the requested product', async () => {
    const question = 'How do I use Power Cleaner on concrete?';
    const first = await answer(question);
    expect(first?.content).toContain('What residue');
    expect(first?.content).not.toContain('What surface');
    const history = [user(question), { ...user(first!.content), ...first, role: 'assistant' as const }];
    const second = await answer('Oil and grease', history);
    expect(second?.content).toContain('SIP Type B');
    expect(second?.content).toContain('1:4 cleaner to water');
    expect(second?.content).not.toContain('What residue');
  });

  it('respects application context when a short exposure answer follows', async () => {
    const first = await answer('How do I apply Natural Shield?');
    const history = [user('How do I apply Natural Shield?'), { ...user(first!.content), ...first, role: 'assistant' as const }];
    const next = await answer('An interior shower', history);
    expect(next?.content).toContain('Satin Stone');
    expect(next?.content).not.toContain('apply the specified three coats');
    expect(next?.videos).toEqual([]);
  });

  it('does not instruct a generic concrete wash on drywall', async () => {
    const result = await answer('How do I use Power Cleaner on drywall with oil?');
    expect(result?.content).toContain('Do not soak board');
    expect(result?.content).not.toContain('1:4');
  });

  it('uses real saved source pages and marks local policy separately', () => {
    const citations = guideProductCitations(GUIDE_PRODUCTS);
    expect(citations.some((citation) => citation.pageNumber === 33 && citation.docId)).toBe(true);
    expect(citations.some((citation) => citation.documentName === 'Semco Canada stocked sealer policy')).toBe(true);
    expect(new Set(citations.map((citation) => citation.id)).size).toBe(citations.length);
  });
});
