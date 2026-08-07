import { buildMathAnswer } from './assistant-math';
import { extractJobContext } from './job-context';
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
});
