import { sendMessage, type AssistantResponse } from './assistant';
import type { ConversationMessage } from '@/database/schema/conversations';

jest.mock('./offline-search', () => ({
  searchProductsOffline: jest.fn(async () => []),
  formatOfflineResponse: jest.fn(() => ''),
}));
jest.mock('./guide-knowledge-store', () => ({
  loadGuideProducts: jest.fn(async () => jest.requireActual('@/knowledge/guide-products').GUIDE_PRODUCTS),
}));

function user(content: string): ConversationMessage {
  return { id: `u-${content}`, role: 'user', content, source: 'local_guide', timestamp: '2026-09-11T00:00:00Z' };
}
function assistant(result: AssistantResponse): ConversationMessage {
  return { ...user(result.content), ...result, id: `a-${result.content}`, role: 'assistant' };
}
async function dialogue(...questions: string[]) {
  const history: ConversationMessage[] = [];
  let response: AssistantResponse | undefined;
  for (const question of questions) {
    response = await sendMessage(question, history);
    history.push(user(question), assistant(response));
  }
  return { response: response!, history };
}

describe('plain-language teaching through the complete local chat router', () => {
  it('compares similarly named liquids directly without asking for a substrate first', async () => {
    const { response } = await dialogue('What is the difference between XB Liquid and Liquid Membrane?');
    expect(response.provider).toBe('local-education');
    expect(response.content).toContain('**X-Bond Liquid**');
    expect(response.content).toContain('**Liquid Membrane**');
    expect(response.content).not.toContain('**X-Bond Stone**');
    expect(response.quickReplies).toBeUndefined();
  });

  it('understands common shorthand when comparing satin and matte', async () => {
    const { response } = await dialogue('What is the difference between satin and matte?');
    expect(response.provider).toBe('local-education');
    expect(response.content).toContain('**Satin Stone**');
    expect(response.content).toContain('**Matte sealer**');
  });

  it('explains Additive as a component rather than renaming it as the finished Brown Coat', async () => {
    const { response } = await dialogue('What is X-Bond Additive used for?');
    expect(response.provider).toBe('local-education');
    expect(response.content).toContain('**X-Bond Additive**');
    expect(response.content).toMatch(/Brown Coat/i);
    expect(response.content).toMatch(/component|ingredient|used with/i);
  });

  it('does not give a Satin Stone application recipe for a submerged pool', async () => {
    const { response } = await dialogue('How do I apply Satin Stone inside a swimming pool?');
    expect(response.content).toMatch(/Natural Shield/);
    expect(response.content).not.toMatch(/Mix 2 parts A to 1 part B|up to 35 minutes/);
    expect(response.videos ?? []).toEqual([]);
  });

  it('does not teach the Natural Shield coating sequence as the standard shower finish', async () => {
    const { response } = await dialogue('How do I apply Natural Shield to an interior shower?');
    expect(response.content).toContain('Satin Stone');
    expect(response.content).not.toContain('apply the specified three coats wet-on-wet');
    expect(response.videos ?? []).toEqual([]);
  });

  it('remembers already-given cleaner facts instead of asking both again', async () => {
    const { response } = await dialogue('How do I use Nu-Lift on a concrete floor with oil and grease?');
    expect(response.content).toContain('Power Cleaner');
    expect(response.content).not.toContain('What surface are you cleaning, and what residue is on it?');
  });

  it('continues a saved cleaner conversation with one missing fact at a time', async () => {
    const { response, history } = await dialogue('How do I use Power Cleaner?', 'Concrete');
    expect(response.content).toMatch(/what residue/i);
    expect(response.content).not.toContain('What surface are you cleaning?');
    const restored: ConversationMessage[] = JSON.parse(JSON.stringify(history));
    const result = await sendMessage('Oil and grease', restored);
    expect(result.provider).toBe('local-education');
    expect(result.content).toContain('Power Cleaner');
    expect(result.content).toContain('Stone Soap');
    expect(result.content).not.toMatch(/what residue|what surface/i);
  });

  it('routes a reported failure to troubleshooting even when the user mentions a video', async () => {
    const { response } = await dialogue('I followed a video but my X-Bond is peeling after drying over concrete. What do I do?');
    expect(response.provider).toBe('local-instructor');
    expect(response.content).toMatch(/already come loose|top layer|pause|hold|stop/i);
    expect(response.content).not.toMatch(/what(?: is the)? substrate|which surface/i);
  });

  it('treats explain-why wording about a real cloudy sealer as troubleshooting, not a product introduction', async () => {
    const { response } = await dialogue('Can you explain why my Natural Shield looks cloudy?');
    expect(response.provider).toBe('local-instructor');
    expect(response.content).toMatch(/haze|hazy|cloudy|puddl/i);
    expect(response.content).not.toContain('Use it for:');
  });

  it('does not offer the prior product video for an explicitly different unverified topic', async () => {
    const { response } = await dialogue('What is Natural Shield used for?', 'Do you have a video about epoxy?');
    expect(response.provider).toBe('local-video-reference');
    expect(response.videos ?? []).toEqual([]);
  });

  it('keeps a generic video request on its current product but never substitutes old Matte videos', async () => {
    const current = await dialogue('What is Natural Shield used for?', 'Can I see a video for that?');
    expect(current.response.videos?.[0].id).toBe('meufPYjz_2k');
    const unavailable = await dialogue('What is Natural Shield used for?', 'Show me a video for Matte sealer');
    expect(unavailable.response.videos ?? []).toEqual([]);
  });

  it('does not resurrect an old lesson after a new job video request', async () => {
    const { response } = await dialogue('How do I install X-Bond on a clean concrete floor?', 'New job: show me a Satin Stone video');
    expect(response.videos?.some(video => /Satin Stone/.test(video.title))).toBe(true);
    expect(response.guideLesson).toBeUndefined();
  });

  it('offers a working next-step action after simplifying a term inside a lesson', async () => {
    const lesson = await dialogue('How do I install X-Bond on a clean concrete floor?', 'What does substrate mean?');
    expect(lesson.response.provider).toBe('local-education');
    expect(lesson.response.guideLesson?.cursor).toBe(0);
    const simplified = await sendMessage('Explain that more simply', lesson.history);
    const history = [...lesson.history, user('Explain that more simply'), assistant(simplified)];
    const reply = simplified.suggestedFollowUps?.find(text => /next step/i.test(text)) ?? 'Next step';
    const continued = await sendMessage(reply, history);
    expect(continued.provider).toBe('local-lesson');
    expect(continued.guideLesson?.cursor).toBe(1);
  });

  it('works without making a network request for teaching or video recommendations', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async () => { throw new Error('No network allowed'); });
    try {
      const { response } = await dialogue('Compare the sealers', 'How do I apply Satin Stone?', 'Can I see a video for that?');
      expect(response.isOffline).toBe(true);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
