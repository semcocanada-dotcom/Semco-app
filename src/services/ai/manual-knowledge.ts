import { TECHNICAL_DOC_PAGES } from '../../knowledge/technical-docs';

export interface ManualKnowledgeHit {
  pageNumber: number;
  sourceDocument: string;
  title: string;
  category: string;
  excerpt: string;
  score: number;
}

const DEFAULT_LIMIT = 3;
const EXCERPT_PADDING = 120;
const RESPONSE_EXCERPT_LENGTH = 220;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(' ')
    .map((word) => word.trim())
    .filter((word) => word.length >= 3);
}

function extractExcerpt(text: string, terms: string[]): string {
  const lower = text.toLowerCase();
  let index = -1;

  for (const term of terms) {
    index = lower.indexOf(term.toLowerCase());
    if (index !== -1) break;
  }

  if (index === -1) {
    return text.slice(0, 360).trim();
  }

  const start = Math.max(0, index - EXCERPT_PADDING);
  const end = Math.min(text.length, index + 360);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

export function searchSipManual(query: string, limit = DEFAULT_LIMIT): ManualKnowledgeHit[] {
  const terms = tokenize(query);
  if (terms.length === 0 || TECHNICAL_DOC_PAGES.length === 0) return [];

  const normalizedQuery = normalize(query);

  const hits = TECHNICAL_DOC_PAGES.map((page) => {
    const title = normalize(page.title);
    const category = normalize(page.category);
    const sourceDocument = normalize(page.sourceDocument);
    const body = normalize(page.text);
    let score = 0;

    for (const term of terms) {
      if (title.includes(term)) score += 4;
      if (sourceDocument.includes(term)) score += 3;
      if (category.includes(term)) score += 2;
      if (body.includes(term)) score += 1;
    }

    if (title.includes(normalizedQuery) || sourceDocument.includes(normalizedQuery)) score += 8;
    if (score === 0) return null;

    return {
      pageNumber: page.pageNumber,
      sourceDocument: page.sourceDocument,
      title: page.title,
      category: page.category,
      excerpt: extractExcerpt(page.text, terms),
      score,
    } satisfies ManualKnowledgeHit;
  })
    .filter((hit): hit is ManualKnowledgeHit => hit !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.pageNumber - b.pageNumber)
    .slice(0, limit);

  return hits;
}

export function buildSipManualContext(hits: ManualKnowledgeHit[]): string {
  if (hits.length === 0) return '';

  return hits
    .map((hit) => `[${hit.title} | ${hit.sourceDocument} | p. ${hit.pageNumber}]\n${hit.excerpt}`)
    .join('\n\n---\n\n');
}

export function formatSipManualResponse(hits: ManualKnowledgeHit[]): string {
  if (hits.length === 0) {
    return '';
  }

  const topHit = hits[0];
  const extraHits = hits.slice(1).map((hit) => `- ${hit.title}, p. ${hit.pageNumber}`);

  return [
    'Answer: I found the closest Semco doc match.',
    '',
    `Best match: ${topHit.title}, p. ${topHit.pageNumber}`,
    summarizeExcerpt(topHit.excerpt),
    '',
    `Source: ${topHit.sourceDocument}`,
    ...(extraHits.length ? ['', 'Also relevant:', ...extraHits] : []),
  ].join('\n');
}

function summarizeExcerpt(excerpt: string): string {
  const cleaned = excerpt
    .replace(/\s+/g, ' ')
    .replace(/^\.\.\./, '')
    .replace(/\.\.\.$/, '')
    .trim();

  if (cleaned.length <= RESPONSE_EXCERPT_LENGTH) return cleaned;
  return `${cleaned.slice(0, RESPONSE_EXCERPT_LENGTH).trim()}...`;
}
