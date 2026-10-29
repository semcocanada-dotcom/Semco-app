import { CHECKS, collectTroubleEvidence, previousCheck, troubleProductFrom, wantsNext, type Check } from './instructor-evidence';
import type { ConversationMessage } from '@/database/schema/conversations';

const user = (content: string): ConversationMessage => ({ id: content, content, role: 'user', source: 'local_guide', timestamp: '' });
const prompt = (check: Check): ConversationMessage => ({ ...user(CHECKS[check].question), role: 'assistant', provider: 'local-instructor', quickReplies: CHECKS[check].choices });

describe('installer evidence, not assistant suggestions', () => {
  it('never treats suggested products or examples as observations', () => {
    const evidence = collectTroubleEvidence([prompt('product')], 'I do not know');
    expect(evidence.product).toBeUndefined();
    expect(evidence.unresolved.has('product')).toBe(true);
  });

  it.each([
    ['Actually Matte, not Natural Shield', 'matte'],
    ['Satin Stone over X-Bond', 'satin'],
    ['Not X-Bond, Liquid Membrane', 'membrane'],
    ['X-Bond over Liquid Membrane', 'x_bond'],
    ['Not using Matte', undefined],
  ])('identifies the foreground product in %s', (text, product) => expect(troubleProductFrom(text)).toBe(product));

  it('retains a named sealer when a later turn only says after sealing', () => {
    const evidence = collectTroubleEvidence([user('Matte sealer is cloudy')], 'After the sealer was applied');
    expect(evidence.product).toBe('matte');
  });

  it('interprets a bare batch count against the actual previous question', () => {
    expect(collectTroubleEvidence([prompt('batches')], 'Just one').batches).toBe('one');
    expect(collectTroubleEvidence([], 'Just one').batches).toBeUndefined();
  });

  it('accepts ordinary drying descriptions and measured Celsius conditions', () => {
    const evidence = collectTroubleEvidence([user('Applied a couple hours ago')], '22°C and 40% RH');
    expect(evidence.elapsed).toContain('couple hours');
    expect(evidence.climate).toContain('22°C');
    expect(collectTroubleEvidence([prompt('timing')], 'It is wet').timing).toBe('wet');
    expect(collectTroubleEvidence([prompt('timing')], 'It is dry').timing).toBe('dry');
  });

  it('does not let a negative fact in one clause hide a hazard in another', () => {
    expect(collectTroubleEvidence([], 'No movement there, but this crack is getting wider').movement).toBe('moving');
    expect(collectTroubleEvidence([], 'Not leaking here, but water is coming through by the drain').leak).toBe(true);
    expect(collectTroubleEvidence([], 'No movement and not leaking').leak).toBeUndefined();
  });

  it('does not clear observed movement merely because a later snapshot looks unchanged', () => {
    expect(collectTroubleEvidence([user('Crack is getting wider')], 'Looks unchanged now').movement).toBe('moving');
    expect(collectTroubleEvidence([user('Crack is getting wider')], 'Correction: it has not changed').movement).toBe('stable');
  });

  it('preserves an unanswered checked-that result across later turns', () => {
    const history = [prompt('recipe'), user('I checked that'), prompt('mixSpeed')];
    expect(collectTroubleEvidence(history, 'Low speed with square paddle').unresolved.has('recipe')).toBe(true);
    expect(collectTroubleEvidence(history, 'My measured amounts match').unresolved.has('recipe')).toBe(false);
  });

  it('prioritizes fast speed even when a square paddle was used', () => {
    expect(collectTroubleEvidence([], 'Square paddle at high speed').mixSpeed).toBe('fast');
  });

  it.each(['What is the next step?', 'What next?', 'I checked that', 'I checked that, what next?', 'Next step'])('recognizes %s as a request to continue', (text) => expect(wantsNext(text)).toBe(true));

  it('does not read arbitrary assistant option lists as instructor prompts', () => {
    expect(previousCheck({ ...prompt('product'), provider: 'local-education' })).toBeUndefined();
  });
});
