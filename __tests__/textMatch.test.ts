import { normalize, similarity } from '@lib/textMatch';

describe('normalize', () => {
  it('lowercases, strips punctuation and corporate suffixes', () => {
    expect(normalize('The Speech & Language Inc.')).toBe('speech language');
  });

  it('collapses whitespace', () => {
    expect(normalize('  ABA   Therapy  ')).toBe('aba therapy');
  });

  it('strips professional designations and registration numbers', () => {
    expect(normalize('Carissa Vance Msc - SLP, Reg. SK #1834')).toBe('carissa vance');
  });

  it('strips OT designations the same way', () => {
    expect(normalize('Angela Kretschmer MScOT (Reg.) SK # 1395')).toBe('angela kretschmer mscot');
  });

  it('strips calendar words so a receipt date is not a name', () => {
    expect(normalize('Tuesday April 7, 2026')).toBe('');
  });

  it('keeps the surname when a provider is named after a month', () => {
    expect(normalize('April Johnson')).toBe('johnson');
  });
});

describe('date no longer collides with a provider name', () => {
  it('a receipt date does not match a month-named provider', () => {
    expect(similarity(normalize('April 7, 2026'), normalize('April Johnson'))).toBe(0);
  });

  it('the real therapist line still matches', () => {
    const line = normalize('Angela (Angie) Kretschmer MScOT (Reg.) SK (# 1395)');
    expect(similarity(line, normalize('Angela Kretschmer'))).toBeGreaterThanOrEqual(0.45);
  });
});

describe('similarity after normalize', () => {
  it('matches a noisy receipt therapist line to the clean provider name', () => {
    const receipt  = normalize('Carissa Vance Msc - SLP, Reg. SK #1834');
    const provider = normalize('Carissa Vance');
    expect(similarity(receipt, provider)).toBe(1);
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
