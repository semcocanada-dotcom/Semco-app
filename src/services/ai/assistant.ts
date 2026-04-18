import { retrieveRelevantChunks, buildContextBlock } from './rag';
import { askClaude } from './claude';
import { searchProductsOffline, formatOfflineResponse } from './offline-search';
import type { ConversationMessage, MessageSource } from '@/database/schema/conversations';

export interface AssistantResponse {
  content: string;
  source: MessageSource;
  isOffline: boolean;
}

/**
 * Routes a user message to Claude+RAG (online) or FTS5 search (offline).
 * The isOnline flag should come from useNetworkStatus hook.
 */
export async function sendMessage(
  userMessage: string,
  history: ConversationMessage[],
  isOnline: boolean,
): Promise<AssistantResponse> {
  if (!isOnline) {
    return handleOffline(userMessage);
  }

  try {
    return await handleOnline(userMessage, history);
  } catch (err) {
    console.warn('[assistant] online request failed, falling back to offline:', err);
    return handleOffline(userMessage);
  }
}

async function handleOnline(
  userMessage: string,
  history: ConversationMessage[],
): Promise<AssistantResponse> {
  const chunks = await retrieveRelevantChunks(userMessage);
  const contextBlock = buildContextBlock(chunks);
  const response = await askClaude(userMessage, contextBlock, history);

  return {
    content: response.content,
    source: 'claude',
    isOffline: false,
  };
}

async function handleOffline(userMessage: string): Promise<AssistantResponse> {
  const results = await searchProductsOffline(userMessage);
  const content = formatOfflineResponse(results);

  return {
    content,
    source: results.length > 0 ? 'offline_fts' : 'product_library',
    isOffline: true,
  };
}
