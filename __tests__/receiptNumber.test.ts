import { extractReceiptNumber } from '@lib/ocr';

describe('extractReceiptNumber', () => {
  it('reads a Pathways invoice number', () => {
    expect(extractReceiptNumber('Speech Therapy 50-minutes Invoice #J29959-P01')).toBe('J29959-P01');
  });

  it('reads an Amazon order number', () => {
    expect(extractReceiptNumber('Order # 702-5618413-2695448')).toBe('702-5618413-2695448');
  });

  it('reads an iClassPro entry id', () => {
    expect(extractReceiptNumber('Entry ID 100291')).toBe('100291');
  });

  it('reads "Receipt No: 4471"', () => {
    expect(extractReceiptNumber('Receipt No: 4471')).toBe('4471');
  });

  it('returns null when there is no number', () => {
    expect(extractReceiptNumber('Thank you for your payment')).toBeNull();
  });

  it('returns null for empty text', () => {
    expect(extractReceiptNumber('')).toBeNull();
  });
});
