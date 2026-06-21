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
import { buildReasoningProfile, formatReasoningContext } from './reasoning';
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
  const retrievalQuestion = resolveFollowUpQuestion(userMessage, history);
  const retrieval = await retrieveSemcoChunks(retrievalQuestion, isOnline);
  const citations = citationsFromChunks(retrieval.chunks);
  const reasoningProfile = buildReasoningProfile(retrievalQuestion);
  const reasoningContext = formatReasoningContext(reasoningProfile);
  const fallbackOptions = { includeClosestSource: reasoningProfile.intent !== 'document_gap' };
  const retrievalNotes = retrievalQuestion === userMessage
    ? retrieval.retrievalNotes
    : [...retrieval.retrievalNotes, 'follow-up-context'];

  if (shouldAskForRequiredInputs(reasoningProfile)) {
    const content = reasoningProfile.localAnswer ?? 'I need the substrate and surface condition before I can answer that correctly.';
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: 'local-clarification',
      status: 'fallback',
      chunks: retrieval.chunks,
      retrievalNotes: [...retrievalNotes, 'clarification:required-inputs'],
      answer: content,
      sources: [],
    });

    return {
      content,
      source: 'ai_fallback',
      isOffline: false,
      citations: [],
      debugId,
      provider: 'local-clarification',
    };
  }

  if (shouldUseLocalFieldAnswer(reasoningProfile) && retrieval.chunks.length > 0) {
    const content = ensureSourceList(reasoningProfile.localAnswer ?? '', citations);
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: 'local-field-rules',
      status: 'fallback',
      chunks: retrieval.chunks,
      retrievalNotes: [...retrievalNotes, 'local-field-answer'],
      answer: content,
      sources: citations,
    });

    return {
      content,
      source: 'ai_fallback',
      isOffline: false,
      citations,
      debugId,
      provider: 'local-field-rules',
    };
  }

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
      reasoningProfile.localAnswer,
      fallbackOptions,
    );
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: 'local-documents',
      status: 'fallback',
      chunks: retrieval.chunks,
      retrievalNotes,
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

  const cached = await getCachedAnswer(retrievalQuestion, retrieval.chunks);
  if (cached) {
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: cached.provider,
      status: 'cached',
      chunks: retrieval.chunks,
      retrievalNotes,
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
    const content = formatLocalGroundedAnswer(retrieval.chunks, reason, reasoningProfile.localAnswer, fallbackOptions);
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: provider?.name ?? 'not-configured',
      status: 'fallback',
      chunks: retrieval.chunks,
      retrievalNotes,
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
      reasoningProfile.localAnswer,
      fallbackOptions,
    );
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: provider.name,
      status: 'blocked',
      chunks: retrieval.chunks,
      retrievalNotes,
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
    const prompt = buildGroundedPrompt(userMessage, retrieval.chunks, history, reasoningContext, retrievalQuestion);
    const result = await provider.generate({
      prompt,
      systemInstruction: SEMCO_ASSISTANT_SYSTEM_INSTRUCTION,
    });
    await incrementDailyAiUsage(installerId);

    const content = ensureSourceList(result.content, citations);
    await setCachedAnswer(retrievalQuestion, retrieval.chunks, {
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
      retrievalNotes,
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
      reasoningProfile.localAnswer,
      fallbackOptions,
    );
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: provider.name,
      status: 'fallback',
      chunks: retrieval.chunks,
      retrievalNotes,
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

function resolveFollowUpQuestion(userMessage: string, history: ConversationMessage[]): string {
  const clean = userMessage.replace(/\s+/g, ' ').trim();
  if (!clean || !isLikelyShortFollowUp(clean)) return clean;

  const recentUserMessages = history
    .filter((message) => message.role === 'user')
    .slice(-3)
    .map((message) => truncate(redactPrivateText(message.content), 180))
    .filter(Boolean);

  if (recentUserMessages.length === 0) return clean;

  return [
    `Previous installer question context: ${recentUserMessages.join(' | ')}`,
    `Follow-up question: ${redactPrivateText(clean)}`,
  ].join('\n');
}

function isLikelyShortFollowUp(message: string): boolean {
  const normalized = message.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = normalized.split(' ').filter(Boolean);
  if (words.length === 0 || words.length > 6) return false;

  const hasOwnSubstrate = /\b(concrete|tile|plywood|osb|wood|metal|drywall|gypsum|pool|shower|icf|block|cmu|x-bond|xbond)\b/.test(normalized);
  const explicitContinuation = /^(what about|and|then|also)\b/.test(normalized);
  if (hasOwnSubstrate && !explicitContinuation) return false;

  return /\b(prep|prepare|prepping|clean|cleaner|sealer|seal|mix|mixing|coverage|dry|cure|apply|install|warranty|photos|how much|what next)\b/.test(normalized)
    || /^(how|what|which|when|can|do|does|should|is|are)\b/.test(normalized);
}

function redactPrivateText(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted email]')
    .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[redacted phone]')
    .replace(/\b\d{2,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl|Way)\b/gi, '[redacted address]')
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function shouldAskForRequiredInputs(
  profile: ReturnType<typeof buildReasoningProfile>,
): boolean {
  if (!profile.localAnswer || profile.missingInputs.length === 0) return false;

  return ['prep_decision', 'install_build_up', 'material_estimate'].includes(profile.intent);
}

function shouldUseLocalFieldAnswer(
  profile: ReturnType<typeof buildReasoningProfile>,
): boolean {
  return ['prep_decision', 'install_build_up'].includes(profile.intent) && Boolean(profile.localAnswer);
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
