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
import {
  buildReasoningProfile,
  formatReasoningContext,
  shouldAskForRequiredInputs,
  shouldUseLocalFieldAnswer,
} from './reasoning';
import {
  buildClarifyingQuestion,
  buildSuggestedFollowUps,
  extractJobContext,
  formatJobContextLine,
  resolveContextualQuestion,
} from './job-context';
import { buildMathAnswer } from './assistant-math';
import type { AssistantCitation, ConversationMessage, MessageSource } from '@/database/schema/conversations';

export interface AssistantResponse {
  content: string;
  source: MessageSource;
  isOffline: boolean;
  citations?: AssistantCitation[];
  debugId?: string;
  provider?: string;
  quickReplies?: string[];
  suggestedFollowUps?: string[];
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
  const response = await handleKnowledgeAssistant(userMessage, history, isOnline, installerId);
  return { ...response, content: normalizeAssistantContent(response.content) };
}

async function handleKnowledgeAssistant(
  userMessage: string,
  history: ConversationMessage[],
  isOnline: boolean,
  installerId?: string,
): Promise<AssistantResponse> {
  const debugId = `ai-debug-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const jobContext = extractJobContext(history, userMessage);

  // Deterministic math first: quantities, mixing ratios, tint formulas, and
  // glossary answers come from the shared Calculator/colour formula data and
  // never need retrieval or AI generation.
  const mathAnswer = buildMathAnswer(jobContext, userMessage, history);
  if (mathAnswer) {
    const content = normalizeAssistantContent(mathAnswer.content);
    await writeDebugLog(debugId, {
      question: userMessage,
      provider: 'local-calculator',
      status: 'fallback',
      chunks: [],
      retrievalNotes: [`math:${mathAnswer.kind}`],
      answer: content,
      sources: [],
    });

    return {
      content,
      source: 'ai_fallback',
      isOffline: false,
      citations: [],
      debugId,
      provider: 'local-calculator',
      quickReplies: mathAnswer.quickReplies,
      suggestedFollowUps: mathAnswer.followUps,
    };
  }

  const retrievalQuestion = resolveContextualQuestion(userMessage, history, jobContext);
  const retrieval = await retrieveSemcoChunks(retrievalQuestion, isOnline);
  const citations = citationsFromChunks(retrieval.chunks);
  const reasoningProfile = buildReasoningProfile(retrievalQuestion);
  const reasoningContext = formatReasoningContext(reasoningProfile);
  const fallbackOptions = { includeClosestSource: reasoningProfile.intent !== 'document_gap' };
  const suggestedFollowUps = buildSuggestedFollowUps(reasoningProfile.intent, jobContext);
  const retrievalNotes = retrievalQuestion === userMessage
    ? retrieval.retrievalNotes
    : [...retrieval.retrievalNotes, 'follow-up-context'];

  if (shouldAskForRequiredInputs(reasoningProfile)) {
    const clarifying = buildClarifyingQuestion(jobContext, userMessage);
    const content = clarifying?.content
      ?? reasoningProfile.localAnswer
      ?? 'I need the substrate and surface condition before I can answer that correctly.';
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
      quickReplies: clarifying?.quickReplies ?? defaultSubstrateQuickReplies(reasoningProfile.missingInputs),
    };
  }

  if (shouldUseLocalFieldAnswer(reasoningProfile)) {
    const content = normalizeAssistantContent(reasoningProfile.localAnswer ?? '');
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
      suggestedFollowUps,
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

    return {
      content,
      source: 'ai_fallback',
      isOffline: true,
      citations,
      debugId,
      provider: 'local-documents',
      suggestedFollowUps,
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
      suggestedFollowUps,
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
      suggestedFollowUps,
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
      suggestedFollowUps,
    };
  }

  try {
    const prompt = buildGroundedPrompt(
      userMessage,
      retrieval.chunks,
      history,
      reasoningContext,
      retrievalQuestion,
      formatJobContextLine(jobContext),
    );
    const result = await provider.generate({
      prompt,
      systemInstruction: SEMCO_ASSISTANT_SYSTEM_INSTRUCTION,
    });
    await incrementDailyAiUsage(installerId);

    const content = normalizeAssistantContent(result.content);
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
      suggestedFollowUps,
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
      suggestedFollowUps,
    };
  }
}

function defaultSubstrateQuickReplies(missingInputs: string[]): string[] | undefined {
  if (!missingInputs.includes('substrate')) return undefined;
  return ['Concrete', 'Existing tile', 'Plywood / OSB', 'GlasRoc or similar board'];
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

function normalizeAssistantContent(content: string): string {
  const original = content.trim();
  let next = original.replace(/\r\n/g, '\n').trim();

  next = next
    .replace(/^\s*Direct answer\s*\n+/i, '')
    .replace(/^\s*Answer:\s*/i, '')
    .replace(/\n\s*Direct answer\s*\n/gi, '\n')
    .replace(/\n\s*Sources:\s*[\s\S]*$/i, '')
    .replace(/\n\s*Closest confirmed source:\s*[\s\S]*$/i, '')
    .replace(/\n\s*Source:\s*[^\n]+$/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return next || original;
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
