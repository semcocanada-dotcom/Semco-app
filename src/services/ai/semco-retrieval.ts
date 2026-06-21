import { TECHNICAL_DOCS, TECHNICAL_DOC_PAGES } from '@/knowledge/technical-docs';
import { searchSipManual } from './manual-knowledge';
import type { AssistantCitation } from '@/database/schema/conversations';
import type { RagChunk } from './rag';

export interface RetrievedSemcoChunk extends AssistantCitation {
  text: string;
  score: number;
  retrieval: 'semantic' | 'local';
}

export interface RetrievalResult {
  chunks: RetrievedSemcoChunk[];
  confidence: 'high' | 'low' | 'none';
  retrievalNotes: string[];
}

const MAX_CHUNKS = 10;
const LOCAL_CONTEXT_CHARS = 1800;
const NEIGHBOR_CONTEXT_CHARS = 520;
const SEMANTIC_TIMEOUT_MS = 4500;
const PROCESS_CONTEXT_SCORE = 80;

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function cleanText(text: string, maxLength = LOCAL_CONTEXT_CHARS): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}...`;
}

function normalizeQuery(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function findDocId(sourceDocument?: string, title?: string): string | undefined {
  const source = sourceDocument?.toLowerCase();
  const label = title?.toLowerCase();
  return TECHNICAL_DOCS.find((doc) => (
    (source && doc.sourceDocument.toLowerCase() === source)
    || (label && doc.title.toLowerCase() === label)
  ))?.id;
}

function findPage(sourceDocument: string, pageNumber: number) {
  return TECHNICAL_DOC_PAGES.find(
    (page) => page.sourceDocument === sourceDocument && page.pageNumber === pageNumber,
  );
}

function isProcessQuestion(query: string): boolean {
  const normalized = normalizeQuery(query);
  return /\b(process|procedure|steps?|start|finish|install|installation|apply|application|how|do|resurface)\b/.test(normalized);
}

function isConcreteQuestion(query: string): boolean {
  return /\b(concrete|cement|slab|floor)\b/.test(normalizeQuery(query));
}

function isXBondQuestion(query: string): boolean {
  return /\b(xbond|x-bond|microcement|micro cement|seamless stone|color bond|polished bond|ada)\b/.test(normalizeQuery(query));
}

function processSearchQuery(query: string): string {
  if (!isProcessQuestion(query)) return query;

  const contextTerms = [
    query,
    'X-Bond Seamless Stone over concrete floor detail',
    'surface preparation scratch coat liquid membrane fabric reinforcement brown coat',
    'Color Bond Polished Bond ADA Safety Floor Satin Stone sealer',
    'coverage drying recoat time',
  ];

  return contextTerms.join(' ');
}

function buildLocalContext(sourceDocument: string, pageNumber: number, fallbackExcerpt: string): string {
  const page = findPage(sourceDocument, pageNumber);
  if (!page) return cleanText(fallbackExcerpt);

  const previous = TECHNICAL_DOC_PAGES.find(
    (candidate) => candidate.docId === page.docId && candidate.pageNumber === page.pageNumber - 1,
  );
  const next = TECHNICAL_DOC_PAGES.find(
    (candidate) => candidate.docId === page.docId && candidate.pageNumber === page.pageNumber + 1,
  );

  const parts = [
    previous ? `Previous page context: ${cleanText(previous.text, NEIGHBOR_CONTEXT_CHARS)}` : '',
    `Matched page: ${cleanText(page.text, LOCAL_CONTEXT_CHARS)}`,
    next ? `Next page context: ${cleanText(next.text, NEIGHBOR_CONTEXT_CHARS)}` : '',
  ].filter(Boolean);

  return parts.join('\n');
}

function mapSemanticChunk(chunk: RagChunk, index: number): RetrievedSemcoChunk {
  const documentName =
    asString(chunk.metadata?.sourceDocument)
    ?? asString(chunk.metadata?.source)
    ?? asString(chunk.metadata?.documentName)
    ?? 'Semco technical document';
  const title = asString(chunk.metadata?.title) ?? asString(chunk.metadata?.section);
  const pageNumber = asNumber(chunk.metadata?.pageNumber) ?? asNumber(chunk.metadata?.page);
  const docId = asString(chunk.metadata?.docId) ?? findDocId(documentName, title);

  return {
    id: `semantic-${chunk.id || index}`,
    documentName,
    title,
    pageNumber,
    docId,
    score: chunk.similarity,
    retrieval: 'semantic',
    text: cleanText(chunk.chunkText, LOCAL_CONTEXT_CHARS),
  };
}

function pinnedPageChunk(sourceDocument: string, pageNumber: number, score: number): RetrievedSemcoChunk | null {
  const page = findPage(sourceDocument, pageNumber);
  if (!page) return null;

  return {
    id: `process-${page.id}`,
    documentName: page.sourceDocument,
    title: page.title,
    pageNumber: page.pageNumber,
    docId: page.docId,
    score,
    retrieval: 'local',
    text: cleanText(page.text),
  };
}

function getPinnedProcessChunks(query: string): RetrievedSemcoChunk[] {
  if (!isProcessQuestion(query)) return [];

  const normalized = normalizeQuery(query);
  const concrete = isConcreteQuestion(query);
  const xbond = isXBondQuestion(query);

  if (!concrete && !xbond) return [];

  const pinned: Array<[string, number]> = [
    ['Open SIP manual - master copy v2019-3 2.pdf', 20],
    ['X-BondoverConcreteFloorDetail-2025.pdf', 1],
    ['Open SIP manual - master copy v2019-3 2.pdf', 27],
    ['Open SIP manual - master copy v2019-3 2.pdf', 28],
    ['Open SIP manual - master copy v2019-3 2.pdf', 29],
    ['Open SIP manual - master copy v2019-3 2.pdf', 30],
    ['Tech_Sheet_X-Bond-2024-v3.pdf', 1],
    ['Tech_Sheet_X-Bond-2024-v3.pdf', 2],
  ];

  if (normalized.includes('shower')) {
    pinned.splice(1, 1, ['Shower-Detail-Concrete.pdf', 1]);
  }

  if (/\b(color bond|colour bond|finish|start to finish|xbond|x-bond)\b/.test(normalized)) {
    pinned.push(['Open SIP manual - master copy v2019-3 2.pdf', 33]);
    pinned.push(['Open SIP manual - master copy v2019-3 2.pdf', 45]);
  }

  return pinned
    .map(([sourceDocument, pageNumber], index) => (
      pinnedPageChunk(sourceDocument, pageNumber, PROCESS_CONTEXT_SCORE - index)
    ))
    .filter((chunk): chunk is RetrievedSemcoChunk => chunk !== null);
}

function uniqueBySource(chunks: RetrievedSemcoChunk[]): RetrievedSemcoChunk[] {
  const seen = new Set<string>();
  return chunks.filter((chunk) => {
    const key = `${chunk.documentName}|${chunk.pageNumber ?? 'na'}|${chunk.text.slice(0, 80)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function trySemanticSearch(query: string, isOnline: boolean): Promise<RetrievedSemcoChunk[]> {
  if (!isOnline) return [];

  try {
    const { retrieveRelevantChunks } = await import('./rag');
    const chunks = await withTimeout(retrieveRelevantChunks(processSearchQuery(query), MAX_CHUNKS), SEMANTIC_TIMEOUT_MS);
    return chunks
      .map(mapSemanticChunk)
      .filter((chunk) => chunk.text.length > 40 && chunk.score >= 0.18);
  } catch {
    return [];
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('semantic retrieval timed out')), timeoutMs);
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

export async function retrieveSemcoChunks(
  query: string,
  isOnline: boolean,
): Promise<RetrievalResult> {
  const retrievalNotes: string[] = [];
  const pinnedProcessChunks = getPinnedProcessChunks(query);
  if (pinnedProcessChunks.length > 0) retrievalNotes.push(`process:${pinnedProcessChunks.length}`);

  const semanticChunks = await trySemanticSearch(query, isOnline);
  if (semanticChunks.length > 0) retrievalNotes.push(`semantic:${semanticChunks.length}`);

  const localHits = searchSipManual(processSearchQuery(query), MAX_CHUNKS);
  const localChunks: RetrievedSemcoChunk[] = localHits.map((hit, index) => ({
    id: `local-${hit.sourceDocument}-${hit.pageNumber}-${index}`,
    documentName: hit.sourceDocument,
    title: hit.title,
    pageNumber: hit.pageNumber,
    docId: findDocId(hit.sourceDocument, hit.title),
    score: hit.score,
    retrieval: 'local',
    text: buildLocalContext(hit.sourceDocument, hit.pageNumber, hit.excerpt),
  }));
  if (localChunks.length > 0) retrievalNotes.push(`local:${localChunks.length}`);

  const chunks = uniqueBySource([...pinnedProcessChunks, ...semanticChunks, ...localChunks])
    .sort((a, b) => {
      if (a.retrieval !== b.retrieval) return a.retrieval === 'semantic' ? -1 : 1;
      return b.score - a.score;
    })
    .slice(0, MAX_CHUNKS);

  const topScore = chunks[0]?.score ?? 0;
  const confidence = chunks.length === 0 ? 'none' : chunks.length >= 2 || topScore >= 2 ? 'high' : 'low';

  return { chunks, confidence, retrievalNotes };
}

export function citationsFromChunks(chunks: RetrievedSemcoChunk[]): AssistantCitation[] {
  return chunks.map(({ id, documentName, title, pageNumber, docId, score, retrieval }) => ({
    id,
    documentName,
    title,
    pageNumber,
    docId,
    score,
    retrieval,
  }));
}

export function formatLocalGroundedAnswer(chunks: RetrievedSemcoChunk[], reason?: string): string {
  if (chunks.length === 0) {
    return 'I cannot confirm that from the approved Semco technical documents.';
  }

  const primary = chunks[0];
  const sourceLabel = `${primary.documentName}${primary.pageNumber ? ` p. ${primary.pageNumber}` : ''}`;
  const intro = reason
    ? `${reason} Showing the closest confirmed Semco document result instead.`
    : 'AI answer generation is not available right now. Showing the closest confirmed Semco document result instead.';

  return [
    intro,
    '',
    cleanText(primary.text, 520),
    '',
    `Source: ${sourceLabel}`,
  ].join('\n');
}
