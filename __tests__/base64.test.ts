import { base64ToBytes } from '@lib/base64';

describe('base64ToBytes', () => {
  it('decodes ASCII text', () => {
    // "Hello" → SGVsbG8=
    expect(Array.from(base64ToBytes('SGVsbG8='))).toEqual([72, 101, 108, 108, 111]);
  });

  it('decodes with two padding chars', () => {
    // "Hi" → SGk=  ... "M" → TQ==
    expect(Array.from(base64ToBytes('TQ=='))).toEqual([77]);
  });

  it('decodes binary bytes (PNG header)', () => {
    // 0x89 'PNG' → iVBORw==  (first 4 bytes of every PNG)
    expect(Array.from(base64ToBytes('iVBORw=='))).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('ignores whitespace/newlines in the input', () => {
    expect(Array.from(base64ToBytes('SGVs\nbG8='))).toEqual([72, 101, 108, 108, 111]);
  });

  it('returns an empty array for empty input', () => {
    expect(base64ToBytes('').byteLength).toBe(0);
  });

  it('produces the correct byte length (no trailing zeros)', () => {
    expect(base64ToBytes('SGVsbG8=').byteLength).toBe(5);
  });
});
