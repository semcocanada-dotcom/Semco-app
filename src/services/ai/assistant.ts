import { searchProductsOffline, formatOfflineResponse } from './offline-search';
import { searchSipManual, formatSipManualResponse } from './manual-knowledge';
import { buildReasoningProfile } from './reasoning';
import type { ConversationMessage, MessageSource } from '@/database/schema/conversations';

export interface AssistantResponse {
  content: string;
  source: MessageSource;
  isOffline: boolean;
}

/**
 * Ask Semco is a coded knowledge assistant, not a free-form AI estimator.
 * It answers from Semco manuals, loaded product docs, and approved field rules.
 * Material quantities stay inside the deterministic Calculator formulas.
 */
export async function sendMessage(
  userMessage: string,
  _history: ConversationMessage[],
  _isOnline: boolean,
  _installerId?: string,
): Promise<AssistantResponse> {
  return handleKnowledgeAssistant(userMessage);
}

async function handleKnowledgeAssistant(userMessage: string): Promise<AssistantResponse> {
  const manualHits = searchSipManual(userMessage, 5);
  const reasoningProfile = buildReasoningProfile(userMessage, manualHits);

  if (reasoningProfile.localAnswer) {
    return {
      content: reasoningProfile.localAnswer,
      source: 'technical_docs',
      isOffline: true,
    };
  }

  if (manualHits.length > 0) {
    return {
      content: formatSipManualResponse(manualHits),
      source: 'technical_docs',
      isOffline: true,
    };
  }

  const results = await searchProductsOffline(userMessage);
  if (results.length === 0) {
    return {
      content: [
        'Answer: I do not have a confirmed Semco answer for that yet.',
        '',
        'Use Semco review before making that call.',
      ].join('\n'),
      source: 'product_library',
      isOffline: true,
    };
  }

  const content = formatOfflineResponse(results);

  return {
    content,
    source: 'offline_fts',
    isOffline: true,
  };
}
