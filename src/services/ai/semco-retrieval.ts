import { TECHNICAL_DOCS, TECHNICAL_DOC_PAGES } from '@/knowledge/technical-docs';
import {
  STOCKED_SEALER_POLICY_PAGE,
  STOCKED_SEALER_POLICY_SOURCE,
  STOCKED_SEALER_POLICY_TEXT,
} from '@/constants/stocked-sealers';
import {
  STANDARD_SHOWER_POLICY_PAGE,
  STANDARD_SHOWER_POLICY_SOURCE,
  STANDARD_SHOWER_POLICY_TEXT,
} from '@/constants/shower-policy';
import { searchSipManual } from './manual-knowledge';
import type { AssistantCitation } from '@/database/schema/conversations';

export interface RetrievedSemcoChunk extends AssistantCitation {
  text: string;
  score: number;
  retrieval: 'local';
}

export interface RetrievalResult {
  chunks: RetrievedSemcoChunk[];
  confidence: 'high' | 'low' | 'none';
  retrievalNotes: string[];
}

const MAX_CHUNKS = 16;
const LOCAL_CONTEXT_CHARS = 1800;
const NEIGHBOR_CONTEXT_CHARS = 520;
const PROCESS_CONTEXT_SCORE = 120;
const SIP_MANUAL = 'Open SIP manual - master copy v2019-3 2.pdf';

function cleanText(text: string, maxLength = LOCAL_CONTEXT_CHARS): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}...`;
}

function normalizeQuery(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
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
  return /\b(process|procedure|steps?|start|finish|install|installation|apply|application|how|do|resurface|clean|cleaning|prep|preparation|substrate|sealer|seal|mix|mixing|speed)\b/.test(normalized);
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
    'surface preparation cleaning substrate Stone Soap Power Cleaner Nu-Lift Cleaner',
    'X-Bond Seamless Stone over concrete floor detail',
    'standard shower X-Bond substrate GlasRoc GlassRoc concrete construction board plywood OSB tile grouted block CMU',
    'standard shower Liquid Membrane 2 coats fabric joints inside corners Satin Stone 2 coats',
    'surface preparation scratch coat liquid membrane fabric reinforcement brown coat',
    'Color Bond Polished Bond ADA Safety Floor Natural Shield Satin Stone Titan Gloss Matte sealer',
    'current stocked sealers pool pond fountain water containment submerged exterior penetrating sealer Natural Shield',
    'underwater submerged pond pool fountain Liquid Membrane 3 coats water containment',
    'coverage drying recoat time low speed mixer square mixing paddle 180-200 RPM',
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

function pushPinned(pinned: [string, number][], sourceDocument: string, pageNumber: number) {
  if (!pinned.some(([source, page]) => source === sourceDocument && page === pageNumber)) {
    pinned.push([sourceDocument, pageNumber]);
  }
}

function addSubstratePrepPages(query: string, pinned: [string, number][]) {
  const normalized = normalizeQuery(query);
  const asksAllPrep = (
    includesAny(normalized, ['all types of surfaces', 'all types surfaces', 'each type surface', 'each type substrate', 'each substrate', 'all substrate', 'all surface', 'all surfaces', 'every surface', 'every substrate', 'surface types', 'substrate types', 'all prep', 'prep procedures', 'cleaning procedures'])
    || (normalized.includes('substrate') && includesAny(normalized, ['clean', 'prep', 'preparation']))
  );

  if (asksAllPrep) {
    [15, 20, 21, 22, 23, 24, 27, 28, 29, 30, 35].forEach((page) => pushPinned(pinned, SIP_MANUAL, page));
    return;
  }

  if (includesAny(normalized, ['concrete', 'cement', 'slab', 'natural stone', 'vinyl', 'vct', 'metal', 'steel', 'aluminum', 'aluminium', 'formica', 'glass', 'plexiglass'])) {
    pushPinned(pinned, SIP_MANUAL, 20);
  }

  if (includesAny(normalized, ['concrete', 'cement', 'slab'])) {
    pushPinned(pinned, SIP_MANUAL, 22);
  }

  if (includesAny(normalized, ['commercial kitchen', 'epoxy', 'terrazzo', 'carpet glue', 'wax', 'waxed', 'paint', 'painted', 'coating', 'coated', 'sealer residue', 'oil', 'grease', 'glue'])) {
    pushPinned(pinned, SIP_MANUAL, 21);
  }

  if (includesAny(normalized, ['unsure', 'unknown', 'stamped concrete', 'stamped', 'exterior', 'outside'])) {
    pushPinned(pinned, SIP_MANUAL, 22);
  }

  if (includesAny(normalized, ['block', 'cmu', 'stucco', 'masonry', 'below grade plaster', 'plaster', 'tile', 'ceramic', 'porcelain', 'grout', 'pool', 'pond', 'fountain', 'water containment', 'jacuzzi', 'magnesium', 'efflorescence', 'efflorescent', 'calcium', 'mineral', 'alkali'])) {
    pushPinned(pinned, SIP_MANUAL, 23);
  }

  if (includesAny(normalized, ['wood', 'plywood', 'osb', 'deck', 'decks'])) {
    pushPinned(pinned, SIP_MANUAL, 24);
  }

  if (includesAny(normalized, ['drywall', 'gypsum', 'wallboard', 'cement board', 'backer board', 'concrete board', 'concrete panel', 'icf', 'insulated concrete form', 'wall', 'walls', 'vertical'])) {
    pushPinned(pinned, SIP_MANUAL, 35);
  }
}

function addXBondProcedurePages(query: string, pinned: [string, number][]) {
  const normalized = normalizeQuery(query);
  const concrete = isConcreteQuestion(query);
  const xbond = isXBondQuestion(query);
  const asksInstallProcess = isProcessQuestion(query);
  const substrateProcess = includesAny(normalized, [
    'tile',
    'ceramic',
    'porcelain',
    'wood',
    'plywood',
    'osb',
    'deck',
    'metal',
    'steel',
    'aluminum',
    'aluminium',
    'vinyl',
    'vct',
    'natural stone',
    'formica',
    'glass',
    'plexiglass',
    'paint',
    'coating',
    'epoxy',
    'terrazzo',
    'pool',
    'pond',
    'fountain',
    'water containment',
    'jacuzzi',
    'submerged',
    'drywall',
    'gypsum',
    'glasroc',
    'glassroc',
    'cement board',
    'backer board',
    'concrete board',
    'block',
    'cmu',
    'stucco',
    'icf',
    'heated floor',
    'radiant floor',
  ]);

  if (!asksInstallProcess || (!concrete && !xbond && !substrateProcess)) return;

  pushPinned(pinned, 'X-BondoverConcreteFloorDetail-2025.pdf', 1);
  [27, 28, 29, 30].forEach((page) => pushPinned(pinned, SIP_MANUAL, page));
  pushPinned(pinned, 'Tech_Sheet_X-Bond-2024-v3.pdf', 1);
  pushPinned(pinned, 'Tech_Sheet_X-Bond-2024-v3.pdf', 2);

  if (includesAny(normalized, ['tile', 'ceramic', 'porcelain', 'grout'])) {
    pushPinned(pinned, 'X-Bond-Over-Tile-Detail.pdf', 1);
  }

  if (includesAny(normalized, ['wood', 'plywood', 'osb', 'deck', 'decks'])) {
    pushPinned(pinned, 'Wood-Detail.pdf', 1);
    pushPinned(pinned, 'Cove-Base-Detail-Plywood.pdf', 1);
  }

  if (includesAny(normalized, ['pool', 'pond', 'fountain', 'water feature', 'water containment', 'jacuzzi', 'submerged'])) {
    pushPinned(pinned, 'Natural-Shield-Tech-Sheet.pdf', 1);
    pushPinned(pinned, 'Natural-Shield-Tech-Sheet.pdf', 2);
  }

  if (includesAny(normalized, ['shower', 'wet room', 'wetroom'])) {
    pushPinned(pinned, 'Shower-Detail-Concrete.pdf', 1);
    pushPinned(pinned, 'Shower-Detail-Wood.pdf', 1);
    pushPinned(pinned, 'Shower-Detail.pdf', 1);
    pushPinned(pinned, 'Satin+Stone+Tech+Sheet.pdf', 1);
    pushPinned(pinned, 'Satin+Stone+Tech+Sheet.pdf', 2);
  }

  if (includesAny(normalized, ['polished bond', 'polished'])) {
    pushPinned(pinned, SIP_MANUAL, 31);
  }

  if (includesAny(normalized, ['natural grain', 'grain'])) {
    pushPinned(pinned, SIP_MANUAL, 32);
  }

  if (includesAny(normalized, ['color bond', 'colour bond', 'finish', 'start to finish', 'xbond', 'x-bond'])) {
    pushPinned(pinned, SIP_MANUAL, 33);
  }

  if (includesAny(normalized, ['ada', 'safety floor', 'broadcast'])) {
    pushPinned(pinned, SIP_MANUAL, 34);
  }

  if (includesAny(normalized, ['wall', 'walls', 'vertical'])) {
    pushPinned(pinned, SIP_MANUAL, 35);
  }
}

function addSealerPages(query: string, pinned: [string, number][]) {
  const normalized = normalizeQuery(query);
  const asksSealer = includesAny(normalized, [
    'sealer',
    'seal ',
    'sealing',
    'finish coat',
    'top coat',
    'topcoat',
    'satin stone',
    'natural shield',
    'titan',
    'titan gloss',
    'titan shield',
    'matte',
    'pool',
    'pond',
    'fountain',
    'water containment',
    'submerged',
    'exterior',
    'outside',
    'wet room',
    'wetroom',
    'shower',
    'x-crete',
    'xcrete',
    'x-tra',
    'xtra',
    'xtreme',
    'crystal coat',
    'colour coat',
    'color coat',
    'color gloss',
  ]);
  const broadXBondProcess = isXBondQuestion(query) && includesAny(normalized, ['start to finish', 'process', 'steps', 'finish']);

  if (!asksSealer && !broadXBondProcess) return;

  if (!asksSealer && broadXBondProcess) {
    pushPinned(pinned, SIP_MANUAL, 45);
    return;
  }

  if (includesAny(normalized, [
    'natural shield',
    'flat finish',
    'flat sealer',
    'pool',
    'pond',
    'fountain',
    'water containment',
    'submerged',
    'under water',
    'underwater',
    'exterior',
    'outside',
  ])) {
    pushPinned(pinned, SIP_MANUAL, 40);
    pushPinned(pinned, 'Natural-Shield-Tech-Sheet.pdf', 1);
    pushPinned(pinned, 'Natural-Shield-Tech-Sheet.pdf', 2);
    pushPinned(pinned, 'Natural-Shield-Tech-Sheet.pdf', 3);
  }

  if (includesAny(normalized, ['satin stone', 'satin', 'shower', 'wet room', 'wetroom'])) {
    pushPinned(pinned, SIP_MANUAL, 45);
    pushPinned(pinned, 'Satin+Stone+Tech+Sheet.pdf', 1);
    pushPinned(pinned, 'Satin+Stone+Tech+Sheet.pdf', 2);
    pushPinned(pinned, 'Satin+Stone+Tech+Sheet.pdf', 3);
  }

  if (includesAny(normalized, ['titan', 'titan gloss', 'titan shield', 'gloss', 'high gloss'])) {
    pushPinned(pinned, 'Tech_Sheet_TitanShield-v8.pdf', 1);
    pushPinned(pinned, 'Tech_Sheet_TitanShield-v8.pdf', 2);
    pushPinned(pinned, 'Tech_Sheet_TitanShield-v8.pdf', 3);
  }

  if (includesAny(normalized, ['matte'])) {
    pushPinned(pinned, 'Tech_Sheet_TitanShield-v8.pdf', 1);
    pushPinned(pinned, 'Tech_Sheet_TitanShield-v8.pdf', 2);
    pushPinned(pinned, 'Tech_Sheet_TitanShield-v8.pdf', 3);
  }

  if (!pinned.some(([source, page]) => source === SIP_MANUAL && page >= 40 && page <= 49)) {
    [40, 45].forEach((page) => pushPinned(pinned, SIP_MANUAL, page));
    pushPinned(pinned, 'Natural-Shield-Tech-Sheet.pdf', 1);
    pushPinned(pinned, 'Satin+Stone+Tech+Sheet.pdf', 1);
    pushPinned(pinned, 'Tech_Sheet_TitanShield-v8.pdf', 1);
  }
}

function shouldAddStockedSealerPolicy(query: string): boolean {
  const normalized = normalizeQuery(query);
  return includesAny(normalized, [
    'sealer',
    'seal ',
    'sealing',
    'finish',
    'top coat',
    'topcoat',
    'natural shield',
    'satin stone',
    'titan',
    'matte',
    'pool',
    'pond',
    'fountain',
    'water containment',
    'submerged',
    'exterior',
    'outside',
    'shower',
    'wet room',
    'wetroom',
    'x-crete',
    'xcrete',
    'xtreme',
    'x-tra',
    'xtra',
    'crystal coat',
    'colour coat',
    'color coat',
    'color gloss',
  ]);
}

function shouldAddShowerPolicy(query: string): boolean {
  const normalized = normalizeQuery(query);
  return includesAny(normalized, [
    'shower',
    'wet room',
    'wetroom',
    'glasroc',
    'glassroc',
    'bathroom wall',
    'inside corner',
    'shower substrate',
  ]);
}

function showerPolicyChunk(query: string): RetrievedSemcoChunk[] {
  if (!shouldAddShowerPolicy(query)) return [];

  return [{
    id: 'policy-standard-shower-xbond',
    documentName: STANDARD_SHOWER_POLICY_SOURCE,
    title: 'Current standard shower X-Bond rule',
    pageNumber: STANDARD_SHOWER_POLICY_PAGE,
    score: PROCESS_CONTEXT_SCORE + 18,
    retrieval: 'local',
    text: STANDARD_SHOWER_POLICY_TEXT,
  }];
}

function stockedSealerPolicyChunk(query: string): RetrievedSemcoChunk[] {
  if (!shouldAddStockedSealerPolicy(query)) return [];

  return [{
    id: 'policy-stocked-sealers',
    documentName: STOCKED_SEALER_POLICY_SOURCE,
    title: 'Current stocked sealers',
    pageNumber: STOCKED_SEALER_POLICY_PAGE,
    score: PROCESS_CONTEXT_SCORE + 20,
    retrieval: 'local',
    text: STOCKED_SEALER_POLICY_TEXT,
  }];
}

function getPinnedProcessChunks(query: string): RetrievedSemcoChunk[] {
  if (!isProcessQuestion(query)) return [];

  const pinned: [string, number][] = [];
  addSubstratePrepPages(query, pinned);
  const hasPrepPage = pinned.some(([source, page]) => source === SIP_MANUAL && page >= 20 && page <= 24);
  if (!hasPrepPage && isXBondQuestion(query)) {
    [20, 21, 22, 23, 24].forEach((page) => pushPinned(pinned, SIP_MANUAL, page));
  }
  addXBondProcedurePages(query, pinned);
  addSealerPages(query, pinned);

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

export async function retrieveSemcoChunks(
  query: string,
): Promise<RetrievalResult> {
  const retrievalNotes: string[] = [];
  const policyChunks = stockedSealerPolicyChunk(query);
  if (policyChunks.length > 0) retrievalNotes.push('policy:stocked-sealers');
  const showerPolicyChunks = showerPolicyChunk(query);
  if (showerPolicyChunks.length > 0) retrievalNotes.push('policy:standard-shower');
  const pinnedProcessChunks = getPinnedProcessChunks(query);
  if (pinnedProcessChunks.length > 0) retrievalNotes.push(`process:${pinnedProcessChunks.length}`);

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

  const chunks = uniqueBySource([...policyChunks, ...showerPolicyChunks, ...pinnedProcessChunks, ...localChunks])
    .sort((a, b) => {
      const policyRank = (id: string) => {
        if (id === 'policy-stocked-sealers') return 0;
        if (id === 'policy-standard-shower-xbond') return 1;
        return 2;
      };
      const rankDiff = policyRank(a.id) - policyRank(b.id);
      if (rankDiff !== 0) return rankDiff;
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

export function formatLocalGroundedAnswer(
  chunks: RetrievedSemcoChunk[],
  reason?: string,
  reasonedAnswer?: string,
  options: { includeClosestSource?: boolean } = {},
): string {
  if (chunks.length === 0) {
    return reasonedAnswer
      ? `${reasonedAnswer}\n\nI cannot confirm more detail from the approved Semco technical documents.`
      : 'I cannot confirm that from the approved Semco technical documents.';
  }

  // Never surface raw document/OCR text in the user-facing answer. When a
  // local rule answer exists it carries the response; otherwise offer the
  // closest document matches for the installer to open.
  const reasonOnly = reason ?? 'Semco Guide found the closest matching installed references.';

  if (reasonedAnswer) {
    if (options.includeClosestSource === false) {
      return [
        reasonOnly,
        '',
        reasonedAnswer,
      ].join('\n');
    }

    const primary = chunks[0];
    const sourceLabel = `${primary.documentName}${primary.pageNumber ? ` p. ${primary.pageNumber}` : ''}`;
    return [
      reasonOnly,
      '',
      reasonedAnswer,
      '',
      `Source: ${sourceLabel}`,
    ].join('\n');
  }

  const matchLines = chunks.slice(0, 3).map((chunk) => {
    const label = chunk.title && chunk.title !== chunk.documentName
      ? `${chunk.documentName} - ${chunk.title}`
      : chunk.documentName;
    return `- ${label}${chunk.pageNumber ? ` p. ${chunk.pageNumber}` : ''}`;
  });

  return [
    `${reasonOnly} I cannot build the full guided answer, so here is the closest approved Semco documentation instead.`,
    '',
    'Semco document matches you can open:',
    ...matchLines,
  ].join('\n');
}
