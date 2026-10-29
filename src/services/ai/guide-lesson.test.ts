import { continueGuideLesson, startGuideLesson } from './guide-lesson';
import type { ConversationMessage } from '@/database/schema/conversations';

const procedure = ['Check the product and surface first.', ...[1, 2, 3, 4].map((step) => `**Step ${step}: Check ${step}.**\nComplete check ${step} before continuing.`), 'Field check:\nStop if the surface is wet or moving.'].join('\n\n');
const reply = (extra: Partial<ConversationMessage>): ConversationMessage => ({ id: 'a', role: 'assistant', content: '', timestamp: '', source: 'local_guide', ...extra });

describe('offline step-by-step guide', () => {
  it('shows one whole step and keeps the shared safety note visible', () => {
    const result = startGuideLesson(procedure, 'How do I install this?');
    expect(result?.content).toContain('Check 1');
    expect(result?.content).not.toContain('Check 2');
    expect(result?.content).toContain('Stop if the surface is wet or moving.');
    expect(result?.guideLesson.steps).toHaveLength(4);
  });

  it('advances, goes back and restores the full unabridged procedure', () => {
    const first = startGuideLesson(procedure, 'Help me')!;
    const second = continueGuideLesson('Next step', [reply(first)])!;
    expect(second.guideLesson.cursor).toBe(1);
    expect(second.content).toContain('Complete check 2');
    expect(continueGuideLesson('Previous step', [reply(second)])?.guideLesson.cursor).toBe(0);
    const full = continueGuideLesson('Show all steps', [reply(second)])!;
    expect(full.content).toBe(procedure);
  });

  it('does not hijack a new question or resume an older unrelated lesson', () => {
    const first = startGuideLesson(procedure, 'Help me')!;
    expect(continueGuideLesson('Now the coating is peeling', [reply(first)])).toBeNull();
    expect(continueGuideLesson('Next step', [reply(first), reply({ content: 'Unrelated answer' })])).toBeNull();
    expect(startGuideLesson(procedure, 'Show all steps')).toBeNull();
  });

  it('never advances beyond the last step or treats guidance as inspection', () => {
    const first = startGuideLesson(procedure, 'Help me')!;
    const last = { ...first, guideLesson: { ...first.guideLesson, cursor: 3 } };
    const result = continueGuideLesson('done', [reply(last)]);
    expect(result?.guideLesson.cursor).toBe(3);
    expect(result?.content).toContain('not confirmation');
    expect(result?.quickReplies).not.toContain('Next step');
    expect(continueGuideLesson('Show all steps', [reply(last)])?.quickReplies).not.toContain('Next step');
  });

  it('does not resume after an unanswered new-job turn, but permits the current question in history', () => {
    const first = startGuideLesson(procedure, 'Help me')!;
    expect(continueGuideLesson('next', [reply(first), reply({ role: 'user', content: 'New job on a different surface' })])).toBeNull();
    expect(continueGuideLesson('next', [reply(first), reply({ role: 'user', content: 'next' })])?.guideLesson.cursor).toBe(1);
  });
});
