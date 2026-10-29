import { sendMessage, type AssistantResponse } from './assistant';
import type { ConversationMessage } from '@/database/schema/conversations';

jest.mock('./offline-search', () => ({
  searchProductsOffline: jest.fn(async () => []),
  formatOfflineResponse: jest.fn(() => ''),
}));

function user(content: string): ConversationMessage {
  return { id: content, role: 'user', content, source: 'local_guide', timestamp: '2026-09-08T00:00:00Z' };
}

function assistant(result: AssistantResponse): ConversationMessage {
  return { ...user(result.content), ...result, role: 'assistant' };
}

async function dialogue(...questions: string[]) {
  const history: ConversationMessage[] = [];
  let response: AssistantResponse | undefined;
  for (const question of questions) {
    response = await sendMessage(question, history, true, 'test-installer');
    history.push(user(question), assistant(response));
  }
  return { response: response!, history };
}

describe('Semco Guide complete offline chat flow', () => {
  it('runs multi-turn troubleshooting without contacting an AI or other network service', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async () => {
      throw new Error('This guide must work without network access');
    });
    try {
      const { response } = await dialogue('The coating is peeling', 'Peeling after drying', 'Concrete underneath', 'X-Bond is lifting', 'Surface underneath is dusty');
      expect(response).toMatchObject({ source: 'local_guide', isOffline: true, provider: 'local-instructor' });
      expect(response.content).toContain('sound surface');
      expect(response.citations?.some((citation) => citation.pageNumber === 27)).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('keeps quantity calculation independent from a preceding troubleshooting conversation', async () => {
    const { response } = await dialogue('X-Bond is peeling after drying over concrete', 'How much material for 1,500 sq ft of clean concrete?');
    expect(response.provider).toBe('local-calculator');
    expect(response.content).toContain('**1500 sq ft**');
  });

  it('clears the old pool when a different dry-wall job starts', async () => {
    const { response } = await dialogue('How much material for 100 sq ft of concrete pool?', 'New job: how much material for 500 sq ft on dry non-wet drywall?');
    expect(response.provider).toBe('local-calculator');
    expect(response.content).toContain('500 sq ft ÷ 100 sq ft per bag = 5');
    expect(response.content).not.toContain('**SEMCO Liquid Membrane**');
    expect(response.content).not.toContain('4 coats');
  });

  it('does not silently use an old area when the new measurement is invalid', async () => {
    const { response } = await dialogue('How much material for 500 sq ft of concrete?', 'How much material for -300 sq ft?');
    expect(response.provider).toBe('local-calculator');
    expect(response.content).toContain('positive number');
    expect(response.content).not.toContain('**500 sq ft**');
  });

  it('uses the same contamination plan as the calculator', async () => {
    const response = await sendMessage('How much material for 300 sq ft of concrete with oil and grease?', []);
    expect(response.provider).toBe('local-calculator');
    expect(response.content).toContain('Step 1: SEMCO Power Cleaner');
    expect(response.content).toContain('Step 2: SEMCO Stone Soap');
  });

  it('answers installed sample and promotion policies without claiming live availability', async () => {
    const { response } = await dialogue('X-Bond is peeling after drying over concrete', 'What is the current promotion?');
    expect(response.provider).toBe('local-installed-policy');
    expect(response.content).toContain('cannot check live availability');
    const sample = await sendMessage('How do colour samples work?', []);
    expect(sample.content).toContain('flat $40 CAD');
    expect(sample.content).toContain('500 sq ft');
    expect(sample.content).toContain('X-Bond Liquid');
  });

  it('turns a real long field procedure into whole steps and carries its saved sources', async () => {
    const first = await sendMessage('How do I install X-Bond on a clean concrete floor?', []);
    expect(first.provider).toBe('local-lesson');
    expect(first.guideLesson?.cursor).toBe(0);
    expect(first.content).toContain('Part 1 of');
    expect(first.content).not.toContain('**Step 2:');
    const history = [user('How do I install X-Bond on a clean concrete floor?'), assistant(first)];
    const next = await sendMessage('Next step', history);
    expect(next.provider).toBe('local-lesson');
    expect(next.guideLesson?.cursor).toBe(1);
    expect(next.citations).toEqual(first.citations);
    const all = await sendMessage('Show all steps', [...history, user('Next step'), assistant(next)]);
    expect(all.content).toContain('**Step 1:');
    expect(all.content).toContain('**Step 4:');
  });

  it('can leave a lesson for a reported problem without advancing its procedure', async () => {
    const { response } = await dialogue('How do I install X-Bond on a clean concrete floor?', 'The coating is peeling');
    expect(response.provider).toBe('local-instructor');
    expect(response.guideLesson).toBeUndefined();
    expect(response.content).toContain('Pause coating');
  });

  it('makes a dealer-summary draft without claiming anything was sent', async () => {
    const { response } = await dialogue('Liquid Membrane pinholes', 'Still wet', 'Help me summarize this for my dealer');
    expect(response.content).toContain('Nothing has been sent');
    expect(response.content).toContain('Bubbles or holes');
    expect(response.content).toContain('Still wet');
  });

  it('never claims this text-only guide has inspected a photo', async () => {
    const { response } = await dialogue('The coating is peeling', 'Can you check a photo?');
    expect(response.content).toContain("can't inspect a photo");
  });
});
