import { retrieveRelevantChunks, buildContextBlock } from './rag';
import { askClaude } from './claude';
import { searchProductsOffline, formatOfflineResponse } from './offline-search';
import { searchSipManual, buildSipManualContext, formatSipManualResponse } from './manual-knowledge';
import {
  extractTopicFromMessage,
  fetchUserProgress,
  recordTopicAsked,
  buildProgressContext,
} from './user-progress';
import type { ConversationMessage, MessageSource } from '@/database/schema/conversations';

export interface AssistantResponse {
  content: string;
  source: MessageSource;
  isOffline: boolean;
}

/**
 * Routes a user message to Claude+RAG (online) or FTS5 search (offline).
 * When online, fetches installer progress to build an adaptive system prompt.
 * Records the topic after each response to power future adaptations.
 */
export async function sendMessage(
  userMessage: string,
  history: ConversationMessage[],
  isOnline: boolean,
  installerId?: string,
): Promise<AssistantResponse> {
  if (!isOnline) {
    return handleOffline(userMessage);
  }

  try {
    return await handleOnline(userMessage, history, installerId);
  } catch (err) {
    console.warn('[assistant] online request failed, falling back to offline:', err);
    return handleOffline(userMessage);
  }
}

async function handleOnline(
  userMessage: string,
  history: ConversationMessage[],
  installerId?: string,
): Promise<AssistantResponse> {
  const topic = extractTopicFromMessage(userMessage);

  // Fetch adaptive context and knowledge-manual context in parallel
  const [manualHits, chunks, progress] = await Promise.all([
    Promise.resolve(searchSipManual(userMessage)),
    retrieveRelevantChunks(userMessage),
    installerId ? fetchUserProgress(installerId) : Promise.resolve([]),
  ]);

  const manualContext = buildSipManualContext(manualHits);
  const ragContext = buildContextBlock(chunks);
  const contextBlock = [manualContext, ragContext].filter(Boolean).join('\n\n---\n\n');
  const progressContext = buildProgressContext(progress);

  const response = await askClaude(userMessage, contextBlock, history, progressContext || undefined);

  // Record this topic asynchronously — don't block the response
  if (installerId) {
    recordTopicAsked(installerId, topic, 5).catch(() => {});
  }

  return {
    content: response.content,
    source: 'claude',
    isOffline: false,
  };
}

async function handleOffline(userMessage: string): Promise<AssistantResponse> {
  const manualHits = searchSipManual(userMessage);
  if (manualHits.length > 0) {
    return {
      content: formatSipManualResponse(manualHits),
      source: 'technical_docs',
      isOffline: true,
    };
  }

  const results = await searchProductsOffline(userMessage);
  const content = formatOfflineResponse(results);

  return {
    content,
    source: results.length > 0 ? 'offline_fts' : 'product_library',
    isOffline: true,
  };
}
