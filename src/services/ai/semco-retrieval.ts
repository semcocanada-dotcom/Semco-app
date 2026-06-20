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

const MAX_CHUNKS = 8;
const LOCAL_CONTEXT_CHARS = 1400;
const NEIGHBOR_CONTEXT_CHARS = 420;
const SEMANTIC_TIMEOUT_MS = 4500;

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
    const chunks = await withTimeout(retrieveRelevantChunks(query, MAX_CHUNKS), SEMANTIC_TIMEOUT_MS);
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
  const semanticChunks = await trySemanticSearch(query, isOnline);
  if (semanticChunks.length > 0) retrievalNotes.push(`semantic:${semanticChunks.length}`);

  const localHits = searchSipManual(query, MAX_CHUNKS);
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

  const chunks = uniqueBySource([...semanticChunks, ...localChunks])
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
