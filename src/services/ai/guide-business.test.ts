import { buildGuideBusinessAnswer } from './guide-business';
import { searchSipManual, technicalSearchTerms } from './manual-knowledge';

describe('installed policy answers and conservative reference search', () => {
  it('uses the installed promotion without promising live availability', () => {
    const result = buildGuideBusinessAnswer('What is the current promotion?');
    expect(result?.content).toContain('1,000');
    expect(result?.content).toContain('14-tool');
    expect(result?.content).toContain('cannot check live availability');
  });

  it('explains a prepared X-Bond Liquid sample, not a complete Stone mix', () => {
    const result = buildGuideBusinessAnswer('How much does a quart sample cost?');
    expect(result?.content).toContain('$40 CAD');
    expect(result?.content).toContain('500 sq ft');
    expect(result?.content).toContain('does not include the Stone');
  });

  it('uses the shared pigment rate and whole-gallon job batches', () => {
    const result = buildGuideBusinessAnswer('How is job tint priced?');
    expect(result?.content).toContain('$2 CAD per machine ounce');
    expect(result?.content).toContain('1-gallon and 5-gallon');
  });

  it('does not claim to inspect photographs', () => {
    expect(buildGuideBusinessAnswer('Can you check this photo?')?.content).toContain("can't inspect a photo");
  });

  it.each(['How do I mix a sample of X-Bond?', 'How long should I let my sample dry?', 'What should I do if my sample does not work?'])('does not turn technical sample questions into pricing: %s', (question) => {
    expect(buildGuideBusinessAnswer(question)).toBeNull();
  });

  it('recognizes the plain-language sample policy question', () => {
    expect(buildGuideBusinessAnswer('How do colour samples work?')?.content).toContain('flat $40 CAD');
  });

  it('removes filler words rather than treating them as technical evidence', () => {
    expect(technicalSearchTerms('What is the current promotion?')).toEqual(['promotion']);
    expect(searchSipManual('Hello, can you please help?')).toEqual([]);
    expect(searchSipManual('How do I mix X-Bond?').length).toBeGreaterThan(0);
  });
});
