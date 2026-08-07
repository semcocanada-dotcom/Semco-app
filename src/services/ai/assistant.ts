import { searchProductsOffline, formatOfflineResponse } from './offline-search';
import {
  citationsFromChunks,
  formatLocalGroundedAnswer,
  retrieveSemcoChunks,
} from './semco-retrieval';
import {
  buildReasoningProfile,
  shouldAskForRequiredInputs,
  shouldUseLocalFieldAnswer,
} from './reasoning';
import {
  buildClarifyingQuestion,
  buildSuggestedFollowUps,
  extractJobContext,
  resolveContextualQuestion,
} from './job-context';
import { buildMathAnswer } from './assistant-math';
import type { AssistantCitation, ConversationMessage, MessageSource } from '@/database/schema/conversations';

export interface AssistantResponse {
  content: string;
  source: MessageSource;
  isOffline: boolean;
  citations?: AssistantCitation[];
  provider?: string;
  quickReplies?: string[];
  suggestedFollowUps?: string[];
}

/**
 * Semco Guide is an entirely local knowledge tool. It uses deterministic
 * calculators, installed Semco reference text, and coded field rules. The
 * network arguments remain in the public signature for backwards-compatible
 * callers, but no question or conversation content leaves the device.
 */
export async function sendMessage(
  userMessage: string,
  history: ConversationMessage[],
  _isOnline = false,
  _installerId?: string,
): Promise<AssistantResponse> {
  const jobContext = extractJobContext(history, userMessage);

  const mathAnswer = buildMathAnswer(jobContext, userMessage, history);
  if (mathAnswer) {
    return {
      content: normalizeAssistantContent(mathAnswer.content),
      source: 'local_guide',
      isOffline: true,
      citations: [],
      provider: 'local-calculator',
      quickReplies: mathAnswer.quickReplies,
      suggestedFollowUps: mathAnswer.followUps,
    };
  }

  const retrievalQuestion = resolveContextualQuestion(userMessage, history, jobContext);
  const retrieval = await retrieveSemcoChunks(retrievalQuestion);
  const citations = citationsFromChunks(retrieval.chunks);
  const reasoningProfile = buildReasoningProfile(retrievalQuestion);
  const suggestedFollowUps = buildSuggestedFollowUps(reasoningProfile.intent, jobContext);

  if (shouldAskForRequiredInputs(reasoningProfile)) {
    const clarifying = buildClarifyingQuestion(jobContext, userMessage);
    return {
      content: normalizeAssistantContent(
        clarifying?.content
          ?? reasoningProfile.localAnswer
          ?? 'I need the substrate and surface condition before I can answer that correctly.',
      ),
      source: 'local_guide',
      isOffline: true,
      citations: [],
      provider: 'local-clarification',
      quickReplies: clarifying?.quickReplies
        ?? defaultSubstrateQuickReplies(reasoningProfile.missingInputs),
    };
  }

  if (shouldUseLocalFieldAnswer(reasoningProfile)) {
    return {
      content: normalizeAssistantContent(reasoningProfile.localAnswer ?? ''),
      source: 'local_guide',
      isOffline: true,
      citations,
      provider: 'local-field-rules',
      suggestedFollowUps,
    };
  }

  if (retrieval.chunks.length === 0) {
    const products = await searchProductsOffline(userMessage);
    if (products.length > 0) {
      return {
        content: normalizeAssistantContent(formatOfflineResponse(products)),
        source: 'offline_fts',
        isOffline: true,
        citations: [],
        provider: 'local-product-library',
      };
    }
  }

  const content = formatLocalGroundedAnswer(
    retrieval.chunks,
    retrieval.confidence === 'none'
      ? 'I cannot confirm that from the installed Semco technical references.'
      : 'Semco Guide found relevant information in the installed technical references.',
    reasoningProfile.localAnswer,
    { includeClosestSource: reasoningProfile.intent !== 'document_gap' },
  );

  return {
    content: normalizeAssistantContent(content),
    source: 'local_guide',
    isOffline: true,
    citations,
    provider: 'local-documents',
    suggestedFollowUps,
  };
}

function defaultSubstrateQuickReplies(missingInputs: string[]): string[] | undefined {
  if (!missingInputs.includes('substrate')) return undefined;
  return ['Concrete', 'Existing tile', 'Plywood / OSB', 'GlasRoc or similar board'];
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
