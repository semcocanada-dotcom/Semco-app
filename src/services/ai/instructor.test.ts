import { buildInstructorAnswer, type InstructorAnswer } from './instructor';
import { extractJobContext } from './job-context';
import type { ConversationMessage } from '@/database/schema/conversations';
import { TECHNICAL_DOC_PAGES } from '../../knowledge/technical-docs';

function user(content: string): ConversationMessage {
  return { id: content, role: 'user', content, source: 'local_guide', timestamp: '2026-09-08T12:00:00Z' };
}

function assistant(result: InstructorAnswer): ConversationMessage {
  return { ...user(result.content), ...result, role: 'assistant', provider: 'local-instructor' };
}

function chat(...turns: string[]): { result: InstructorAnswer; history: ConversationMessage[] } {
  const history: ConversationMessage[] = [];
  let result: InstructorAnswer | null = null;
  for (const turn of turns) {
    result = buildInstructorAnswer(turn, history);
    expect(result).not.toBeNull();
    history.push(user(turn), assistant(result!));
  }
  return { result: result!, history };
}

describe('free offline instructor', () => {
  it.each([
    ['The coating is peeling', 'Is it still wet'],
    ['There are cracks in the finish', 'What surface is underneath'],
    ['I have pinholes', 'identify the layer'],
    ['The colour looks patchy', 'colour difference'],
    ['The finish is sticky', 'exact product'],
    ['My mix is too thick', 'Which product'],
  ])('recognizes %s and asks one focused question', (question, expected) => {
    const result = buildInstructorAnswer(question, []);
    expect(result?.content).toContain(expected);
    expect((result?.content.match(/\?/g) ?? []).length).toBe(1);
    expect(result?.quickReplies?.length).toBeGreaterThan(0);
  });

  it.each(['What sealer should I use?', 'How many bags for 500 sq ft?', 'How do I avoid bubbles?', 'There are no cracks', 'It is not peeling'])('does not hijack an unrelated or negated request: %s', (question) => {
    expect(buildInstructorAnswer(question, [])).toBeNull();
  });

  it('remembers surface and timing through several peeling answers', () => {
    const { result } = chat('The coating is peeling', 'Peeling after drying', 'Concrete underneath', 'X-Bond is lifting');
    expect(result.content).toContain('only the top layer');
    expect(result.content).not.toContain('What surface is underneath');
    expect(result.content).not.toContain('did it start after drying');
  });

  it('does not infer facts from its own options', () => {
    const { result } = chat('The coating is peeling', 'Peeling after drying');
    expect(result.content).toContain('What surface is underneath');
  });

  it('provides a sound-surface check for dusty peeling substrate without promising a cure', () => {
    const { result } = chat('X-Bond is peeling after drying on concrete', 'Surface underneath is dusty');
    expect(result.content).toContain('sound surface');
    expect(result.content).toContain('dealer');
    expect(result.content).not.toContain('guarantee');
    expect(result.citations?.map((citation) => citation.pageNumber)).toContain(27);
  });

  it('identifies a dry-primer clue without prescribing fresh primer over a failed coat', () => {
    const { result } = chat('X-Bond is lifting while applying over concrete', 'The primer was completely dry');
    expect(result.content).toContain('while it is still tacky');
    expect(result.content).toContain('does not prove');
    expect(result.content).toContain('failed area reviewed first');
  });

  it('asks about crack size and movement then supports a dealer handoff', () => {
    const { result } = chat('Cracks over plywood at sheet seams', 'Hairline, unchanged');
    expect(result.content).toContain('sheet seam');
    expect(result.content).toContain('not proof that movement has stopped');
  });

  it('stops for widening cracks without advising grinding or hiding joints', () => {
    const { result } = chat('Cracks over concrete', 'It is getting wider');
    expect(result.content).toContain('on-site check');
    expect(result.content).not.toContain('grind');
  });

  it('gives the verified membrane pinhole correction only once dry', () => {
    const { result } = chat('Liquid Membrane pinholes', 'Dry to the touch, tiny open holes');
    expect(result.content).toContain('additional Liquid Membrane to close the defects');
    expect(result.content).toContain('does not confirm');
    expect(result.citations?.map((citation) => citation.pageNumber)).toEqual([29]);
  });

  it('does not patch over wet membrane or raised blisters', () => {
    for (const response of ['Still wet', 'It has not dried yet', 'Dry to the touch, raised blisters']) {
      const { result } = chat('Liquid Membrane pinholes', response);
      expect(result.content).not.toContain('additional Liquid Membrane to close the defects');
      expect(result.content.toLowerCase()).toContain('dealer');
    }
  });

  it('does not assume yesterday means a membrane layer is dry', () => {
    const result = buildInstructorAnswer('Liquid Membrane has pinholes, applied yesterday', []);
    expect(result?.content).toContain('still wet');
    expect(result?.content).not.toContain('additional Liquid Membrane to close the defects');
  });

  it('keeps the bubble topic when a follow-up says still wet', () => {
    const { result } = chat('Liquid Membrane pinholes', 'Still wet', 'Help me summarize this for my dealer');
    expect(result.content).toContain('Issue: Bubbles or holes');
    expect(result.content).toContain('Nothing has been sent');
  });

  it('does not let absence of movement cancel an active leak warning', () => {
    const { result } = chat('Cracks over concrete, water is coming through but no movement');
    expect(result.content).toContain('on-site check');
  });

  it('compares actual batches and approved sample without guessing a pigment correction', () => {
    const { result } = chat('The X-Bond colour is uneven', 'Before sealer, multiple batches');
    expect(result.content).toContain('approved sample under the same lighting');
    expect(result.content).toContain('measured X-Bond Liquid amounts');
    expect(result.content).toContain('not automatically a pigment mistake');
    expect(result.citations?.map((citation) => citation.pageNumber)).toEqual([6, 33]);
  });

  it('handles white Natural Shield haze using its own verified product procedure', () => {
    const { result } = chat('Natural Shield has a white haze', 'After sealer, one batch');
    expect(result.content).toContain('warning against puddling');
    expect(result.citations?.map((citation) => citation.pageNumber)).toEqual([40]);
  });

  it('asks for elapsed time and conditions and does not invent Matte cure values', () => {
    const { result } = chat('Matte sealer is sticky', 'Applied yesterday, cool and humid');
    expect(result.content).toContain('not have enough verified Matte-specific');
    expect(result.content).not.toMatch(/\d+ hours/);
  });

  it('gives mixing guidance specific to the named wall finish', () => {
    const { result } = chat('My mix is too thick', 'X-Bond wall finish', 'Wrong straight away');
    expect(result.content).toContain('one measure of X-Bond Liquid to three measures of X-Bond Stone');
    expect(result.content).toContain('liquid in first');
    expect(result.citations?.map((citation) => citation.pageNumber)).toEqual([35]);
  });

  it('does not prescribe retempering a batch that thickened in the bucket', () => {
    const { result } = chat('X-Bond floor scratch coat mix is too thick', 'Thickened after sitting');
    expect(result.content).toContain('do not restore it by adding liquid by eye');
  });

  it('does not retry the same recipe after a confirmed wrong ratio', () => {
    const { result } = chat('X-Bond wall finish mix is too thick', 'Wrong straight away', 'My measured amounts were different');
    expect(result.content).toContain('Keep that batch separate');
    expect(result.content).not.toContain('Check the measured recipe first');
  });

  it('uses the corrected coat type rather than an earlier scratch-coat mention', () => {
    const { result } = chat('X-Bond scratch coat mix is too thick', 'Actually a wall finish, not the scratch coat', 'Wrong straight away');
    expect(result.content).toContain('three measures of X-Bond Stone');
  });

  it('does not pretend to inspect a photo or automatically contact the dealer', () => {
    const { result } = chat('X-Bond is peeling after drying over concrete', 'I cannot tell');
    expect(result.content).toContain('text chat cannot inspect photos');
    const summary = chat('X-Bond is peeling after drying over concrete', 'Layers lift together', 'Help me summarize this for my dealer').result;
    expect(summary.content).toContain('Nothing has been sent');
    expect(summary.content).toContain('X-Bond is peeling');
  });

  it('allows an unrelated calculator request after a troubleshooting question', () => {
    const { history } = chat('X-Bond is peeling after drying over concrete');
    expect(buildInstructorAnswer('How many bags for 500 sq ft?', history)).toBeNull();
  });

  it.each([
    'What materials do I need for 300 sq ft cracked concrete?',
    'How many bags for 500 sq ft over soft board?',
    'Calculate coverage for 200 sq ft of cracked concrete',
    'What is the current promotion?',
    'Tell me about the promotion',
    'How do colour samples work?',
    'Can you check a photo?',
    'Could you look at a photo of the peeling?',
    'How do I waterproof a shower?',
    'How do I prepare cracked concrete?',
    'How do I avoid cracks?',
  ])('routes a new task outside troubleshooting, both before and after an instructor conversation: %s', (question) => {
    const { history } = chat('X-Bond is peeling after drying over concrete');
    expect(buildInstructorAnswer(question, [])).toBeNull();
    expect(buildInstructorAnswer(question, history)).toBeNull();
  });

  it('prioritizes an explicitly reported new failure over a secondary materials question', () => {
    const result = buildInstructorAnswer('The coating is peeling. What materials do I need to fix it?', []);
    expect(result?.content).toContain('Is it still wet');
  });

  it('starts the explicitly reported new symptom instead of continuing an older fault', () => {
    const { history } = chat('X-Bond is peeling after drying over concrete');
    const result = buildInstructorAnswer('The Matte sealer is still sticky. How much will a repair cost?', history);
    expect(result?.content).toContain('How long ago');
    expect(result?.content).not.toContain('which layer is lifting');
  });

  it('recognizes the cloudy-sealer starter and asks for the product rather than diagnosing the image', () => {
    const result = buildInstructorAnswer('My sealer looks cloudy. Can you help?', []);
    expect(result?.content).toContain('Which exact sealer');
    expect(result?.quickReplies).toContain('Matte sealer looks cloudy');
    expect(result?.content).not.toContain('puddling');
  });

  it('resets prior facts on a new job even when the caller supplies stale context', () => {
    const { history } = chat('X-Bond is peeling after drying over concrete');
    const oldContext = extractJobContext(history, '');
    const result = buildInstructorAnswer('New job. The coating is peeling', history, oldContext);
    expect(result?.content).toContain('Is it still wet');
    expect(result?.quickReplies).toEqual(['Still wet', 'Dry to the touch']);
    const next = buildInstructorAnswer('Dry to the touch', [...history, user('New job. The coating is peeling'), assistant(result!)]);
    expect(next?.content).toContain('What surface is underneath');
    expect(buildInstructorAnswer('Start a new job', history, oldContext)).toBeNull();
  });

  it('handles histories that already contain the current user message', () => {
    const { history } = chat('X-Bond is peeling after drying over concrete', 'Layers lift together');
    const question = 'Help me summarize this for my dealer';
    const result = buildInstructorAnswer(question, [...history, user(question)]);
    expect(result?.content).toContain('Nothing has been sent');
    expect(result?.content.match(/Help me summarize/g)).toBeNull();
  });

  it.each(['Next job', 'Start again', 'Forget the previous job'])('uses the same job reset wording as the calculator: %s', (reset) => {
    const { history } = chat('X-Bond is peeling after drying over concrete');
    const result = buildInstructorAnswer(`${reset}. The coating is peeling`, history, extractJobContext(history, ''));
    expect(result?.content).toContain('Is it still wet');
    const next = buildInstructorAnswer('Dry to the touch', [...history, user(`${reset}. The coating is peeling`), assistant(result!)]);
    expect(next?.content).toContain('What surface is underneath');
  });

  it('every emitted source link resolves to an installed page', () => {
    const scenarios = [
      ['X-Bond is peeling after drying over concrete', 'Surface underneath is dusty'],
      ['Cracks over plywood at sheet seams', 'Hairline, unchanged'],
      ['Liquid Membrane pinholes', 'Dry to the touch, tiny open holes'],
      ['The X-Bond colour is uneven', 'Before sealer, multiple batches'],
      ['X-Bond wall finish mix is too thick', 'Wrong straight away'],
    ];
    for (const turns of scenarios) {
      for (const citation of chat(...turns).result.citations ?? []) {
        expect(TECHNICAL_DOC_PAGES.some((page) => page.id === citation.id && page.docId === citation.docId && page.pageNumber === citation.pageNumber)).toBe(true);
      }
    }
  });

  it('uses every fact supplied in one free-text answer and never asks those questions again', () => {
    const { result } = chat('The coating is peeling', 'It is X-Bond over concrete. It dried yesterday. Only the top coat lifts, the base is clean and firm and the primer was still tacky.');
    expect(result.content).toContain('Here is the practical plan');
    expect(result.content).not.toContain('What surface is underneath');
    expect(result.content).not.toContain('Is it still wet');
    expect(result.content).not.toContain('Which product');
    expect(result.quickReplies).not.toContain('Concrete underneath');
  });

  it('explains a safe check for uncertainty instead of ending the conversation', () => {
    const { result } = chat('X-Bond is peeling after drying over concrete', 'I cannot tell');
    expect(result.content).toContain('piece that has already come loose');
    expect(result.content).toContain('do not pull up sound material');
    expect(result.quickReplies).toContain('Only the top coat lifts');
    expect(result.quickReplies).not.toContain('Start a new job');
  });

  it('moves to another useful check after uncertainty remains, without declaring the unknown answer confirmed', () => {
    const { result } = chat('X-Bond is peeling after drying over concrete', 'I cannot tell', 'I still cannot tell');
    expect(result.content).toContain('primer still tacky');
    expect(result.content).not.toContain('Is only the top layer');
    expect(result.content).not.toContain('have confirmed');
  });

  it('answers how to check in plain language and accepts the subsequent observation', () => {
    const { result } = chat('Liquid Membrane has bubbles and is dry to the touch', 'How do I tell?', 'Tiny open holes');
    expect(result.content).toContain('additional Liquid Membrane to close the defects');
    expect(result.quickReplies).not.toContain('Tiny open holes');
  });

  it('gives a next inspection step after correcting membrane pinholes instead of repeating the same repair', () => {
    const { result } = chat('Liquid Membrane pinholes, dry to the touch', 'What is the next step?');
    expect(result.content).toContain('check the whole membrane again');
    expect(result.content).not.toContain('use additional Liquid Membrane to close the defects');
  });

  it('does not repeat the same pinhole patch when treated holes return', () => {
    const { result } = chat('Liquid Membrane pinholes, dry to the touch', 'What is the next step?', 'The holes reopened');
    expect(result.content).toContain('Stop repeating the patch');
    expect(result.content).not.toContain('use additional Liquid Membrane to close the defects');
  });

  it('does not confuse primer tackiness with a new drying problem', () => {
    const { result } = chat('X-Bond is peeling after drying on concrete', 'Only the top coat lifts', 'The primer was still tacky');
    expect(result.content).toContain('layer underneath clean and firm');
    expect(result.content).not.toContain('How long ago');
  });

  it('uses a corrected sealer product rather than the earlier product or substrate layer', () => {
    const { result } = chat('Natural Shield has a white haze', 'Actually it is Matte, not Natural Shield. It is over X-Bond.');
    expect(result.content).not.toContain('Natural Shield has a specific warning');
    expect(result.content).toContain('colour difference visible');
  });

  it('remembers before sealing when a later answer only supplies the batch count', () => {
    const { result } = chat('X-Bond colour is patchy and not sealed', 'Multiple batches');
    expect(result.content).toContain('Compare the fully dried finish');
    expect(result.quickReplies).not.toContain('Visible before sealing');
  });

  it('moves from a matching recipe to the mixer check and then useful test-batch guidance', () => {
    const { result, history } = chat('My X-Bond wall finish mix is too thick straight away', 'Yes', 'Low speed with square paddle');
    expect(history[3].content).toContain('mixing method');
    expect(result.content).toContain('next small test batch');
    expect(result.content).not.toContain('Do your measured amounts match');
  });

  it('does not give a finish recipe to a brown-coat mixing problem', () => {
    const { result } = chat('My X-Bond brown coat mix is too thick');
    expect(result.content).toContain('separate additive');
    expect(result.content).not.toContain('one measure of X-Bond Liquid to three');
    expect(result.citations?.map((citation) => citation.pageNumber)).toEqual([30]);
  });

  it('does not force the same product question forever if a label cannot be found', () => {
    const { result } = chat('My sealer looks cloudy', 'I do not know', 'I still cannot tell');
    expect(result.content).toContain('sealer name is still unknown');
    expect(result.content).not.toContain('Which exact sealer');
    expect(result.quickReplies).not.toContain('Matte sealer looks cloudy');
  });

  it('recognizes a named sealer haze report asked as an explanation', () => {
    const result = buildInstructorAnswer('Can you explain why my Natural Shield looks cloudy?', []);
    expect(result?.content).toContain('warning against puddling');
  });

  it('keeps uncertainty and facts through a saved and reopened chat', () => {
    const { history } = chat('X-Bond is peeling after drying on concrete', 'I cannot tell');
    const restored = JSON.parse(JSON.stringify(history));
    const result = buildInstructorAnswer('Still cannot tell', restored);
    expect(result?.content).toContain('primer still tacky');
    expect(result?.content).not.toContain('What surface is underneath');
  });

  it('does not infer successful checks from the vague answer checked that', () => {
    const { result } = chat('X-Bond wall finish mix is too thick straight away', 'I checked that');
    expect(result.content).toContain('mixing method');
    expect(result.content).not.toContain('amounts match');
  });
});
