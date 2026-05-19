import { normalize, similarity } from '@lib/textMatch';

describe('normalize', () => {
  it('lowercases, strips punctuation and corporate suffixes', () => {
    expect(normalize('The Speech & Language Inc.')).toBe('speech language');
  });

  it('collapses whitespace', () => {
    expect(normalize('  ABA   Therapy  ')).toBe('aba therapy');
  });
});

describe('similarity', () => {
  it('scores identical names as 1', () => {
    expect(similarity('aba therapy', 'aba therapy')).toBe(1);
  });

  it('scores disjoint names as 0', () => {
    expect(similarity('aba therapy', 'swimming lessons')).toBe(0);
  });

  it('scores partial overlap between 0 and 1', () => {
    const score = similarity('saskatoon speech clinic', 'speech clinic');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});
