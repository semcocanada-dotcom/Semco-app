import { searchProductsOffline, formatOfflineResponse } from './offline-search';
import { buildGroundedPrompt, SEMCO_ASSISTANT_SYSTEM_INSTRUCTION } from './assistant-prompt';
import {
  citationsFromChunks,
  formatLocalGroundedAnswer,
  retrieveSemcoChunks,
  type RetrievedSemcoChunk,
} from './semco-retrieval';
import {
  appendAssistantDebugLog,
  DAILY_AI_LIMIT,
  getCachedAnswer,
  getDailyAiUsage,
  incrementDailyAiUsage,
  setCachedAnswer,
  type AssistantDebugLog,
} from './assistant-cache';
import { getAssistantGenerationProvider } from './providers';
import type { AssistantCitation, ConversationMessage, MessageSource } from '@/database/schema/conversations';

export interface AssistantResponse {
  content: string;
  source: MessageSource;
  isOffline: boolean;
  citations?: AssistantCitation[];
  debugId?: string;
  provider?: string;
}

/**
 * Ask Semco is a coded knowledge assistant, not a free-form AI estimator.
 * It answers from Semco manuals, loaded product docs, and approved field rules.
 * Material quantities stay inside the deterministic Calculator formulas.
 */
export async function sendMessage(
  userMessage: string,
  history: ConversationMessage[],
  isOnline: boolean,
  installerId?: string,
): Promise<AssistantResponse> {
  return handleKnowledgeAssistant(userMessage, history, isOnline, installerId);
}

async function handleKnowledgeAssistant(
  userMessage: string,
  history: ConversationMessage[],
  isOnline: boolean,
  installerId?: string,
): Promise<AssistantResponse> {
  const debugId = `ai-debug-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const retrieval = await retrieveSemcoChunks(userMessage, isOnline);
  const citations = citationsFromChunks(retrieval.chunks);

  if (retrieval.confidence !== 'high') {
    if (retrieval.chunks.length === 0) {
      const productFallback = await searchOfflineProducts(userMessage, debugId);
      if (productFallback) return productFallback;
    }

    const content = formatLocalGroundedAnswer(
      retrieval.chunks,
      retrieval.confidence === 'none'
        ? 'I cannot confirm that from the approved Semco technical documents.'
        : 'I cannot fully confirm that from the approved Semco technical documents.',
    );
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: 'local-documents',
      status: 'fallback',
      chunks: retrieval.chunks,
      retrievalNotes: retrieval.retrievalNotes,
      answer: content,
      sources: citations,
    });

    if (retrieval.chunks.length > 0) {
      return {
        content,
        source: 'ai_fallback',
        isOffline: true,
        citations,
        debugId,
        provider: 'local-documents',
      };
    }

    return {
      content,
      source: 'ai_fallback',
      isOffline: true,
      citations,
      debugId,
      provider: 'local-documents',
    };
  }

  const cached = await getCachedAnswer(userMessage, retrieval.chunks);
  if (cached) {
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: cached.provider,
      status: 'cached',
      chunks: retrieval.chunks,
      retrievalNotes: retrieval.retrievalNotes,
      answer: cached.content,
      sources: cached.citations,
    });

    return {
      content: cached.content,
      source: 'ai_cache',
      isOffline: false,
      citations: cached.citations,
      debugId,
      provider: cached.provider,
    };
  }

  const provider = getAssistantGenerationProvider();
  if (!isOnline || !provider) {
    const reason = !isOnline
      ? 'The AI model is unavailable offline.'
      : 'Firebase AI Logic is not configured in this build.';
    const content = formatLocalGroundedAnswer(retrieval.chunks, reason);
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: provider?.name ?? 'not-configured',
      status: 'fallback',
      chunks: retrieval.chunks,
      retrievalNotes: retrieval.retrievalNotes,
      answer: content,
      sources: citations,
      error: reason,
    });

    return {
      content,
      source: 'ai_fallback',
      isOffline: true,
      citations,
      debugId,
      provider: provider?.name ?? 'not-configured',
    };
  }

  const usage = await getDailyAiUsage(installerId);
  if (usage >= DAILY_AI_LIMIT) {
    const content = formatLocalGroundedAnswer(
      retrieval.chunks,
      `Daily AI limit reached (${DAILY_AI_LIMIT}).`,
    );
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: provider.name,
      status: 'blocked',
      chunks: retrieval.chunks,
      retrievalNotes: retrieval.retrievalNotes,
      answer: content,
      sources: citations,
      error: 'daily-limit',
    });

    return {
      content,
      source: 'ai_fallback',
      isOffline: true,
      citations,
      debugId,
      provider: provider.name,
    };
  }

  try {
    const prompt = buildGroundedPrompt(userMessage, retrieval.chunks, history);
    const result = await provider.generate({
      prompt,
      systemInstruction: SEMCO_ASSISTANT_SYSTEM_INSTRUCTION,
    });
    await incrementDailyAiUsage(installerId);

    const content = ensureSourceList(result.content, citations);
    await setCachedAnswer(userMessage, retrieval.chunks, {
      content,
      citations,
      provider: `${result.provider}:${result.model}`,
      createdAt: new Date().toISOString(),
    });
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: `${result.provider}:${result.model}`,
      status: 'generated',
      chunks: retrieval.chunks,
      retrievalNotes: retrieval.retrievalNotes,
      answer: content,
      sources: citations,
    });

    return {
      content,
      source: 'gemini',
      isOffline: false,
      citations,
      debugId,
      provider: `${result.provider}:${result.model}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gemini unavailable.';
    const content = formatLocalGroundedAnswer(
      retrieval.chunks,
      'Gemini is unavailable right now.',
    );
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: provider.name,
      status: 'fallback',
      chunks: retrieval.chunks,
      retrievalNotes: retrieval.retrievalNotes,
      answer: content,
      sources: citations,
      error: message,
    });

    return {
      content,
      source: 'ai_fallback',
      isOffline: true,
      citations,
      debugId,
      provider: provider.name,
    };
  }
}

async function searchOfflineProducts(
  userMessage: string,
  debugId: string,
): Promise<AssistantResponse | null> {
  const results = await searchProductsOffline(userMessage);
  if (results.length === 0) {
    return null;
  }

  const content = formatOfflineResponse(results);
  await appendAssistantDebugLog({
    id: debugId,
    timestamp: new Date().toISOString(),
    question: userMessage,
    provider: 'offline-product-library',
    status: 'fallback',
    retrievalNotes: ['product-fts'],
    chunks: [],
    answerPreview: content.slice(0, 600),
    sources: [],
  });

  return {
    content,
    source: 'offline_fts',
    isOffline: true,
    debugId,
    provider: 'offline-product-library',
  };
}

function ensureSourceList(content: string, citations: AssistantCitation[]): string {
  if (/sources:/i.test(content) || citations.length === 0) return content;

  const sourceLines = citations
    .slice(0, 5)
    .map((citation) => `- ${citation.documentName}${citation.pageNumber ? ` p. ${citation.pageNumber}` : ''}`)
    .join('\n');

  return `${content.trim()}\n\nSources:\n${sourceLines}`;
}

async function writeDebugLog(
  id: string,
  payload: {
    question: string;
    provider: string;
    status: AssistantDebugLog['status'];
    chunks: RetrievedSemcoChunk[];
    retrievalNotes: string[];
    answer: string;
    sources: AssistantCitation[];
    error?: string;
  },
): Promise<void> {
  await appendAssistantDebugLog({
    id,
    timestamp: new Date().toISOString(),
    question: payload.question,
    provider: payload.provider,
    status: payload.status,
    retrievalNotes: payload.retrievalNotes,
    chunks: payload.chunks.map((chunk) => ({
      id: chunk.id,
      documentName: chunk.documentName,
      title: chunk.title,
      pageNumber: chunk.pageNumber,
      score: chunk.score,
      retrieval: chunk.retrieval,
      preview: chunk.text.slice(0, 420),
    })),
    answerPreview: payload.answer.slice(0, 900),
    sources: payload.sources,
    error: payload.error,
  });
}
