import { readFileSync } from 'node:fs';
import path from 'node:path';
import { sendMessage } from '../assistant';
import {
  classifyGuideAnswer,
  summarizeGuideEval,
  type GuideEvalQuestion,
} from './classify';

jest.mock('../offline-search', () => ({
  searchProductsOffline: jest.fn(async () => []),
  formatOfflineResponse: jest.fn(() => ''),
}));

const questions = JSON.parse(
  readFileSync(path.join(__dirname, 'questions.json'), 'utf8'),
) as GuideEvalQuestion[];

describe('guide eval classifier', () => {
  const question: GuideEvalQuestion = {
    id: 'sample',
    question: 'How do I apply it?',
    expectedDocuments: [{ sourceIncludes: 'Open SIP manual', page: 14 }],
    keyFacts: ['tacky'],
    mustNotSay: ['warranty is approved'],
  };

  it('counts a taught fact with a matching page as answered-with-cite', () => {
    const row = classifyGuideAnswer(question, {
      content: 'Apply the next coat while the primer is still tacky.',
      citations: [{ id: 'c1', documentName: 'Open SIP manual - master copy v2019-3 2.pdf', pageNumber: 14, retrieval: 'local' }],
    });
    expect(row.verdict).toBe('answered-with-cite');
  });

  it('counts a fact without the expected page as partial', () => {
    expect(classifyGuideAnswer(question, { content: 'Keep it tacky.', citations: [] }).verdict).toBe('partial');
  });

  it('counts a document list of the expected page as partial, not a full answer', () => {
    const row = classifyGuideAnswer(question, {
      content: 'I found related references, but they do not give me a clear answer.\n\n- Open SIP manual p. 14',
      citations: [{ id: 'c1', documentName: 'Open SIP manual - master copy v2019-3 2.pdf', pageNumber: 14, retrieval: 'local' }],
    });
    expect(row.verdict).toBe('partial');
  });

  it('counts a miss as cannot-confirm and records forbidden phrases', () => {
    const row = classifyGuideAnswer(question, {
      content: "I don't have enough information. The warranty is approved.",
    });
    expect(row.verdict).toBe('cannot-confirm');
    expect(row.mustNotSayHits).toEqual(['warranty is approved']);
  });
});

describe('offline guide eval baseline', () => {
  it('asks a starter set of installer questions and stays inside must-not-say', async () => {
    expect(questions.length).toBeGreaterThanOrEqual(20);
    expect(questions.length).toBeLessThanOrEqual(30);

    const rows = [];
    for (const question of questions) {
      const response = await sendMessage(question.question, []);
      rows.push({
        question,
        response,
        classification: classifyGuideAnswer(question, response),
      });
    }

    const summary = summarizeGuideEval(rows.map((row) => row.classification));
    const failures = rows.filter((row) => row.classification.mustNotSayHits.length > 0);
    expect(failures.map((row) => ({
      id: row.question.id,
      hits: row.classification.mustNotSayHits,
      content: row.response.content.slice(0, 240),
    }))).toEqual([]);
    expect(summary.total).toBe(questions.length);
    expect(summary.answeredWithCite + summary.partial + summary.cannotConfirm).toBe(questions.length);
    const report = rows.map((row) => `${row.classification.verdict}\t${row.question.id}`).join('\n');
    // Counts are locked to the Phase 1 baseline in docs/GUIDE_EVAL_BASELINE.md.
    expect({
      answeredWithCite: summary.answeredWithCite,
      partial: summary.partial,
      cannotConfirm: summary.cannotConfirm,
      report,
    }).toEqual({
      answeredWithCite: 9,
      partial: 18,
      cannotConfirm: 2,
      report: [
        'answered-with-cite\tsatin-vs-natural-shield',
        'answered-with-cite\txbond-vs-microbond',
        'answered-with-cite\tliquid-vs-membrane',
        'answered-with-cite\twhat-is-liquid-membrane',
        'partial\tsubstrate-glossary',
        'partial\tpot-life-glossary',
        'partial\tmil-glossary',
        'partial\tcure-glossary',
        'partial\tpeeling-check',
        'partial\tcloudy-sealer',
        'partial\tclean-concrete-prep',
        'partial\tpool-prep',
        'partial\tnatural-shield-apply',
        'answered-with-cite\tsatin-mix',
        'partial\tshower-sealer',
        'answered-with-cite\tmatte-role',
        'partial\tmatte-coat-count',
        'partial\tcolour-samples',
        'partial\ttint-price',
        'answered-with-cite\tbrown-coat',
        'partial\tfabric-overlap',
        'answered-with-cite\tcleaners-difference',
        'cannot-confirm\tpinholes',
        'partial\tshower-over-tile',
        'partial\tphoto-inspect',
        'partial\tgreeting',
        'partial\txbond-plywood',
        'answered-with-cite\ttitan-mixing',
        'cannot-confirm\tweak-hello-help',
      ].join('\n'),
    });
  }, 60000);
});
