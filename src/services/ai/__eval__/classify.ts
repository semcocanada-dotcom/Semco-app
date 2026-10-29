import type { AssistantCitation } from '@/database/schema/conversations';

export interface GuideEvalDocument {
  sourceIncludes: string;
  page?: number;
}

export interface GuideEvalQuestion {
  id: string;
  question: string;
  expectedDocuments: GuideEvalDocument[];
  keyFacts: string[];
  mustNotSay: string[];
  note?: string;
}

export type GuideEvalVerdict = 'answered-with-cite' | 'partial' | 'cannot-confirm';

export interface GuideEvalAnswer {
  content: string;
  citations?: AssistantCitation[];
}

export interface GuideEvalClassification {
  id: string;
  verdict: GuideEvalVerdict;
  matchedFacts: string[];
  matchedDocuments: string[];
  mustNotSayHits: string[];
}

const DOC_LIST_ONLY = /do not give me a clear answer|not a confirmed diagnosis/i;

function includesText(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function documentLabel(document: GuideEvalDocument): string {
  return document.page == null ? document.sourceIncludes : `${document.sourceIncludes} p. ${document.page}`;
}

function matchesDocument(answer: GuideEvalAnswer, document: GuideEvalDocument): boolean {
  const text = answer.content;
  const source = document.sourceIncludes.toLowerCase();
  const pageMatches = (page?: number) => document.page == null || page === document.page;
  const cited = (answer.citations ?? []).some((citation) => (
    (citation.documentName ?? '').toLowerCase().includes(source) && pageMatches(citation.pageNumber)
  ));
  if (cited) return true;
  return includesText(text, document.sourceIncludes)
    && (document.page == null || includesText(text, `p. ${document.page}`));
}

export function classifyGuideAnswer(question: GuideEvalQuestion, answer: GuideEvalAnswer): GuideEvalClassification {
  const matchedFacts = question.keyFacts.filter((fact) => includesText(answer.content, fact));
  const matchedDocuments = question.expectedDocuments
    .filter((document) => matchesDocument(answer, document))
    .map(documentLabel);
  const mustNotSayHits = question.mustNotSay.filter((phrase) => includesText(answer.content, phrase));
  const docListOnly = DOC_LIST_ONLY.test(answer.content);
  const hasFact = matchedFacts.length > 0;
  const hasCite = matchedDocuments.length > 0;

  let verdict: GuideEvalVerdict;
  if (hasFact && hasCite && !docListOnly) verdict = 'answered-with-cite';
  else if (hasFact || hasCite) verdict = 'partial';
  else verdict = 'cannot-confirm';

  return {
    id: question.id,
    verdict,
    matchedFacts,
    matchedDocuments,
    mustNotSayHits,
  };
}

export function summarizeGuideEval(rows: GuideEvalClassification[]) {
  const count = (verdict: GuideEvalVerdict) => rows.filter((row) => row.verdict === verdict).length;
  return {
    total: rows.length,
    answeredWithCite: count('answered-with-cite'),
    partial: count('partial'),
    cannotConfirm: count('cannot-confirm'),
    mustNotSayHits: rows.reduce((sum, row) => sum + row.mustNotSayHits.length, 0),
  };
}
