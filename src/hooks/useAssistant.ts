import { useState, useCallback, useEffect } from 'react';
import { sendMessage } from '@/services/ai/assistant';
import { useNetworkStore } from '@/store/network';
import { useAuthStore } from '@/store/auth';
import { db } from '@/database/client';
import { conversations } from '@/database/schema/conversations';
import { eq } from 'drizzle-orm';
import type { ConversationMessage } from '@/database/schema/conversations';

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useAssistant() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>('');
  const isOnline = useNetworkStore((s) => s.isOnline);
  const installerId = useAuthStore((s) => s.user?.id);

  // Load conversation history on mount
  useEffect(() => {
    const loadConversation = async () => {
      if (!installerId) return;

      try {
        // Get the latest conversation for this installer
        const rows = await db
          .select()
          .from(conversations)
          .where(eq(conversations.installerId, installerId))
          .orderBy((c) => c.updatedAt)
          .limit(1);

        if (rows.length > 0) {
          const conv = rows[0];
          setConversationId(conv.id);
          const msgArray = Array.isArray(conv.messages) ? conv.messages : [];
          // Load last 50 messages
          setMessages(msgArray.slice(-50) as ConversationMessage[]);
        } else {
          // Create new conversation
          const newConvId = generateConversationId();
          setConversationId(newConvId);
          const now = new Date().toISOString();
          await db.insert(conversations).values({
            id: newConvId,
            installerId,
            title: 'Chat',
            messages: JSON.stringify([]),
            createdAt: now,
            updatedAt: now,
          });
        }
      } catch (err) {
        console.warn('[useAssistant] failed to load conversation:', err);
        // Fallback: create new conversation
        const newConvId = generateConversationId();
        setConversationId(newConvId);
      }
    };

    loadConversation();
  }, [installerId]);

  const persistMessage = useCallback(
    async (msg: ConversationMessage) => {
      if (!conversationId || !installerId) return;

      try {
        const rows = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conversationId));

        if (rows.length > 0) {
          const conv = rows[0];
          const msgArray = Array.isArray(conv.messages) ? conv.messages : [];
          const updated = [...msgArray, msg];
          const now = new Date().toISOString();

          await db
            .update(conversations)
            .set({
              messages: JSON.stringify(updated),
              updatedAt: now,
            })
            .where(eq(conversations.id, conversationId));
        }
      } catch (err) {
        console.warn('[useAssistant] failed to persist message:', err);
      }
    },
    [conversationId, installerId],
  );

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ConversationMessage = {
        id: generateId(),
        role: 'user',
        content: text.trim(),
        source: 'claude',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      await persistMessage(userMsg);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendMessage(text, messages, isOnline, installerId);

        const assistantMsg: ConversationMessage = {
          id: generateId(),
          role: 'assistant',
          content: response.content,
          source: response.source,
          timestamp: new Date().toISOString(),
          citations: response.citations,
          debugId: response.debugId,
          provider: response.provider,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        await persistMessage(assistantMsg);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, isOnline, installerId, persistMessage],
  );

  const clearHistory = useCallback(async () => {
    if (!conversationId || !installerId) return;

    try {
      setMessages([]);
      const now = new Date().toISOString();
      await db
        .update(conversations)
        .set({
          messages: JSON.stringify([]),
          updatedAt: now,
        })
        .where(eq(conversations.id, conversationId));
    } catch (err) {
      console.warn('[useAssistant] failed to clear history:', err);
      setError('Failed to clear conversation history');
    }
  }, [conversationId, installerId]);

  return { messages, isLoading, error, send, clearHistory, isOnline };
}
