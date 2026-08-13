import { buildMathAnswer } from './assistant-math';
import { extractJobContext } from './job-context';
import { buildReasoningProfile } from './reasoning';
import { retrieveSemcoChunks } from './semco-retrieval';

describe('Semco Guide local responses', () => {
  it('answers glossary questions with deterministic installed logic', () => {
    const question = 'What does substrate mean?';
    const context = extractJobContext([], question);
    const answer = buildMathAnswer(context, question, []);

    expect(answer).toMatchObject({ kind: 'glossary' });
    expect(answer?.content).toContain('The surface you are coating over');
  });

  it('retrieves only installed Semco references', async () => {
    const result = await retrieveSemcoChunks('How do I prepare a concrete floor for X-Bond?');

    expect(result.chunks.length).toBeGreaterThan(0);
    expect(result.chunks.every((chunk) => chunk.retrieval === 'local')).toBe(true);
    expect(result.retrievalNotes.some((note) => note.startsWith('local:'))).toBe(true);
  });

  it('uses SIP Type A Stone Soap for clean concrete instead of a universal Nu-Lift path', () => {
    const profile = buildReasoningProfile(
      'How do I prepare a clean, unsealed concrete floor before X-Bond?',
    );

    expect(profile.intent).toBe('prep_decision');
    expect(profile.localAnswer).toContain('For clean, unsealed, non-waxed concrete, use SIP Type A: Stone Soap 1:4.');
    expect(profile.localAnswer).not.toContain('Preferred Semco Canada field prep');
    expect(profile.localAnswer).not.toContain('use Nu-Lift first as the pH/mineral reset');
  });

  it('uses the exact SIP Type C cleaner order and pool membrane detail', () => {
    const profile = buildReasoningProfile(
      'How do I prepare a concrete pool before X-Bond?',
    );
    const answer = profile.localAnswer ?? '';
    const powerFirst = answer.indexOf('Power Cleaner 1:4');
    const nuLift = answer.indexOf('Nu-Lift Cleaner 1:1');
    const powerFinal = answer.indexOf('Power Cleaner 1:9');

    expect(profile.intent).toBe('prep_decision');
    expect(answer).toContain('Use SIP Type C as the pool-prep plan');
    expect(powerFirst).toBeGreaterThanOrEqual(0);
    expect(nuLift).toBeGreaterThan(powerFirst);
    expect(powerFinal).toBeGreaterThan(nuLift);
    expect(answer).not.toContain('SIP Type D');
    expect(answer).toContain('4 coats at 15 mil wet film per coat, for 60 mil total');
  });
});
