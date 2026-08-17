import { useState, useCallback } from 'react';
import { sendMessage } from '@/services/ai/assistant';
import { useNetworkStore } from '@/store/network';
import { useAuthStore } from '@/store/auth';
import type { ConversationMessage } from '@/database/schema/conversations';

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useAssistant() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useNetworkStore((s) => s.isOnline);
  const installerId = useAuthStore((s) => s.user?.id);

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
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, isOnline, installerId],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isLoading, error, send, clearMessages, isOnline };
}
