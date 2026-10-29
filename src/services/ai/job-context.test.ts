import type { ConversationMessage } from '@/database/schema/conversations';
import { extractJobContext, getActiveJobHistory, resolveContextualQuestion } from './job-context';

const user = (content: string): ConversationMessage => ({
  id: content, role: 'user', content, source: 'local_guide', timestamp: '2026-09-08T00:00:00Z',
});
const assistant = (content: string): ConversationMessage => ({ ...user(content), role: 'assistant' });

describe('offline job context boundaries', () => {
  it.each(['dry interior wall', 'wall in a non-wet area', 'wall in a non water area', 'wall that is not wet'])('recognizes %s', (description) => {
    expect(extractJobContext([], `X-Bond on drywall, ${description}`)).toMatchObject({
      substrate: 'drywall', application: 'wall', exposure: 'dry',
    });
  });

  it('does not mistake dry material in a shower for dry exposure', () => {
    expect(extractJobContext([], 'The shower board is dry now')).toMatchObject({ exposure: 'wet' });
  });

  it('clears pool, finish and prep conditions for an explicit new job', () => {
    const history = [user('Concrete pool, 1,500 sq ft, Natural Shield and old sealer')];
    const question = 'New job: dry drywall wall';
    const context = extractJobContext(history, question);
    expect(context).toMatchObject({ substrate: 'drywall', application: 'wall', exposure: 'dry', finish: 'unknown' });
    expect(context.prepCondition).toBeUndefined();
    expect(resolveContextualQuestion(question, history, context)).not.toContain('pool');
  });

  it('keeps subsequent follow-ups within the new job', () => {
    const history = [user('Concrete pool and Natural Shield'), user('Different project: dry drywall wall')];
    const context = extractJobContext(history, 'What finish coats do I use?');
    expect(context).toMatchObject({ substrate: 'drywall', exposure: 'dry', finish: 'unknown' });
    expect(getActiveJobHistory(history, 'What now?')).toHaveLength(1);
    expect(resolveContextualQuestion('What now?', history, context)).not.toContain('pool');
  });

  it('tracks actual contamination without treating a sealer question as contamination', () => {
    const history = [user('Concrete floor with oil and grease')];
    expect(extractJobContext(history, 'How much material?').prepCondition).toBe('type_b');
    expect(extractJobContext([], 'Concrete floor with efflorescence').prepCondition).toBe('type_d');
    expect(extractJobContext([], 'Concrete floor with oil and mineral deposits').prepCondition).toBe('type_c');
    expect(extractJobContext([], 'What sealer should I use on clean unsealed concrete?').prepCondition).toBe('type_a');
    expect(extractJobContext([], 'Clean, unsealed, non-waxed concrete').prepCondition).toBe('type_a');
  });

  it('remembers the active job after a long free-text troubleshooting conversation', () => {
    const history = [
      user('I am using X-Bond on a concrete shower wall with Natural Shield.'),
      ...Array.from({ length: 90 }, (_, index) => user(`Check ${index}: I inspected the loose edge and took a photo.`)),
    ];
    expect(extractJobContext(history, 'What should I check next?')).toMatchObject({
      substrate: 'concrete', application: 'shower', exposure: 'wet', system: 'x_bond', finish: 'natural_shield',
    });
  });

  it('does not reset the job when the installer reports a different problem', () => {
    expect(extractJobContext([user('X-Bond on a concrete floor')], 'Another issue: the top coat has bubbles')).toMatchObject({
      substrate: 'concrete', application: 'floor', system: 'x_bond',
    });
  });

  it.each([
    'It is not tile anymore, it is concrete',
    'Correction: concrete, not existing tile',
    'It was tile; actually it is concrete now',
    'I am going over concrete rather than tile',
    "It isn't tile. It is concrete.",
  ])('respects the installer correction: %s', (correction) => {
    expect(extractJobContext([user('Existing tile floor')], correction)).toMatchObject({ substrate: 'concrete', application: 'floor' });
  });

  it('clears an explicitly rejected fact instead of keeping a false answer', () => {
    expect(extractJobContext([user('Tile floor with Matte')], 'I was mistaken. It is not tile and not Matte.')).toMatchObject({
      substrate: 'unknown', application: 'floor', finish: 'unknown',
    });
  });

  it('uses a specific board phrase without also treating it as concrete or ordinary drywall', () => {
    expect(extractJobContext([], 'Cement board shower wall')).toMatchObject({ substrate: 'glasroc_board', application: 'shower' });
    expect(extractJobContext([], 'Moisture-resistant drywall in a shower')).toMatchObject({ substrate: 'glasroc_board', exposure: 'wet' });
  });

  it('does not infer wall from drywall or tile from textile', () => {
    expect(extractJobContext([], 'Drywall')).toMatchObject({ substrate: 'drywall', application: 'unknown' });
    expect(extractJobContext([], 'The textile is blue')).toMatchObject({ substrate: 'unknown' });
  });

  it('recognizes plurals when the installer describes walls', () => {
    expect(extractJobContext([], 'Concrete walls')).toMatchObject({ substrate: 'concrete', application: 'wall' });
  });

  it('does not mistake not sealed for a coated surface', () => {
    expect(extractJobContext([], 'Clean concrete, not sealed').prepCondition).toBe('type_a');
    expect(extractJobContext([], 'Concrete without oil or grease').prepCondition).not.toBe('type_b');
  });

  it('does not convert a product comparison into chosen job products', () => {
    const history = [user('X-Bond on a dry concrete wall with Matte')];
    expect(extractJobContext(history, 'What is the difference between MicroBond and Liquid Membrane, or Satin Stone versus Natural Shield?')).toMatchObject({
      substrate: 'concrete', system: 'x_bond', finish: 'matte',
    });
  });

  it('tracks a system correction while preserving the job', () => {
    expect(extractJobContext([user('X-Bond on a concrete floor')], 'Actually we are using MicroBond instead of X-Bond')).toMatchObject({
      substrate: 'concrete', application: 'floor', system: 'microbond',
    });
  });

  it('does not learn job facts from options listed by the assistant', () => {
    const history = [user('Concrete floor'), assistant('Is this tile, plywood, a pool, or a steam shower? Are you using Satin Stone?')];
    expect(extractJobContext(history, 'No, I already said concrete')).toMatchObject({
      substrate: 'concrete', application: 'floor', exposure: 'unknown', finish: 'unknown',
    });
    const resolved = resolveContextualQuestion('What do I do next?', history, extractJobContext(history, 'What do I do next?'));
    expect(resolved).toContain('substrate is concrete');
    expect(resolved).not.toMatch(/tile|plywood|pool|steam shower|Satin Stone/);
  });

  it('does not put disproved historical facts back into retrieval', () => {
    const history = [user('A pool over tile'), user('Actually not a pool or tile. A dry concrete wall.')];
    const question = 'How do I apply X-Bond?';
    const resolved = resolveContextualQuestion(question, history, extractJobContext(history, question));
    expect(resolved).toContain('substrate is concrete');
    expect(resolved).toContain('exposure is dry');
    expect(resolved).not.toMatch(/pool|tile|submerged/);
  });

  it('keeps known job facts even when a follow-up is a complete question', () => {
    const history = [user('X-Bond on concrete, shower walls, Natural Shield')];
    const question = 'How should I prepare concrete before applying X-Bond?';
    const resolved = resolveContextualQuestion(question, history, extractJobContext(history, question));
    expect(resolved).toContain('application is shower');
    expect(resolved).toContain('finish is Natural Shield');
  });

  it('leaves a general comparison independent of the previous job', () => {
    const history = [user('Concrete pool using Natural Shield')];
    const question = 'What is the difference between X-Bond and MicroBond?';
    expect(resolveContextualQuestion(question, history, extractJobContext(history, question))).toBe(question);
  });
});
