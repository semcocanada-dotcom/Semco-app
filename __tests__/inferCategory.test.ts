import { inferCategoryFromText } from '@lib/ocr';

describe('inferCategoryFromText', () => {
  it('reads speech-language therapy off a receipt', () => {
    expect(inferCategoryFromText('Speech Therapy 50-minutes\nCarissa Vance Msc - SLP, Reg. SK #1834'))
      .toBe('speech_language');
  });

  it('detects occupational therapy', () => {
    expect(inferCategoryFromText('Occupational Therapy session')).toBe('occupational_therapy');
  });

  it('detects ABA / IBI behaviour work', () => {
    expect(inferCategoryFromText('Applied Behaviour Analysis — BCBA consult')).toBe('aba_ibi');
  });

  it('detects physiotherapy', () => {
    expect(inferCategoryFromText('Physiotherapy assessment')).toBe('physical_therapy');
  });

  it('returns null when no service keyword is present', () => {
    expect(inferCategoryFromText('Receipt\nTotal $140.00\nThank you')).toBeNull();
  });

  it('returns null for empty text', () => {
    expect(inferCategoryFromText('')).toBeNull();
  });
});
