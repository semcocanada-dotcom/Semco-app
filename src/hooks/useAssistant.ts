import { useState, useCallback, useEffect } from 'react';
import { sendMessage } from '@/services/ai/assistant';
import { useNetworkStore } from '@/store/network';
import { useAuthStore } from '@/store/auth';
import { db } from '@/database/client';
import { conversations } from '@/database/schema/conversations';
import { and, desc, eq } from 'drizzle-orm';
import type { Conversation, ConversationMessage } from '@/database/schema/conversations';

const DEFAULT_CHAT_TITLE = 'New chat';

export interface AssistantConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastMessagePreview: string;
  updatedAt: string;
  createdAt: string;
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeMessages(value: unknown): ConversationMessage[] {
  let candidate = value;

  for (let i = 0; i < 2; i += 1) {
    if (Array.isArray(candidate)) return candidate as ConversationMessage[];
    if (typeof candidate !== 'string') return [];

    try {
      candidate = JSON.parse(candidate);
    } catch {
      return [];
    }
  }

  return Array.isArray(candidate) ? (candidate as ConversationMessage[]) : [];
}

function summarizeConversation(conv: Conversation): AssistantConversationSummary {
  const messages = normalizeMessages(conv.messages);
  const lastMessage = messages[messages.length - 1];

  return {
    id: conv.id,
    title: conv.title?.trim() || DEFAULT_CHAT_TITLE,
    messageCount: messages.length,
    lastMessagePreview: lastMessage?.content?.replace(/\s+/g, ' ').trim().slice(0, 96) || 'No messages yet',
    updatedAt: conv.updatedAt,
    createdAt: conv.createdAt,
  };
}

function titleFromQuestion(question: string): string {
  const clean = question.replace(/\s+/g, ' ').trim();
  if (!clean) return DEFAULT_CHAT_TITLE;

  const words = clean.split(' ').slice(0, 7).join(' ');
  return clean.length > words.length ? `${words}...` : words;
}

function shouldAutoTitle(title?: string | null): boolean {
  const clean = title?.trim().toLowerCase();
  return !clean || clean === 'chat' || clean === DEFAULT_CHAT_TITLE.toLowerCase();
}

export function useAssistant() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [savedChats, setSavedChats] = useState<AssistantConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>('');
  const [conversationTitle, setConversationTitle] = useState(DEFAULT_CHAT_TITLE);
  const isOnline = useNetworkStore((s) => s.isOnline);
  const installerId = useAuthStore((s) => s.user?.id);

  const applyConversation = useCallback((conv: Conversation) => {
    setConversationId(conv.id);
    setConversationTitle(conv.title?.trim() || DEFAULT_CHAT_TITLE);
    setMessages(normalizeMessages(conv.messages).slice(-80));
  }, []);

  const createConversation = useCallback(async () => {
    const newConvId = generateConversationId();
    const now = new Date().toISOString();

    await db.insert(conversations).values({
      id: newConvId,
      installerId,
      title: DEFAULT_CHAT_TITLE,
      messages: [],
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await db.select().from(conversations).where(eq(conversations.id, newConvId)).limit(1);
    return created;
  }, [installerId]);

  const loadConversationList = useCallback(
    async (preferredId?: string) => {
      if (!installerId) {
        setConversationId('');
        setConversationTitle(DEFAULT_CHAT_TITLE);
        setMessages([]);
        setSavedChats([]);
        return;
      }

      try {
        let rows = await db
          .select()
          .from(conversations)
          .where(eq(conversations.installerId, installerId))
          .orderBy(desc(conversations.updatedAt));

        if (rows.length === 0) {
          const created = await createConversation();
          rows = created ? [created] : [];
        }

        setSavedChats(rows.map(summarizeConversation));

        const selected = rows.find((row) => row.id === preferredId) ?? rows[0];
        if (selected) applyConversation(selected);
      } catch (err) {
        console.warn('[useAssistant] failed to load conversations:', err);
        const newConvId = generateConversationId();
        setConversationId(newConvId);
        setConversationTitle(DEFAULT_CHAT_TITLE);
        setMessages([]);
      }
    },
    [applyConversation, createConversation, installerId],
  );

  useEffect(() => {
    loadConversationList();
  }, [loadConversationList]);

  const refreshSavedChats = useCallback(async () => {
    if (!installerId) return;

    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.installerId, installerId))
      .orderBy(desc(conversations.updatedAt));

    setSavedChats(rows.map(summarizeConversation));
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
          const msgArray = normalizeMessages(conv.messages);
          const updated = [...msgArray, msg];
          const now = new Date().toISOString();
          const nextTitle = msg.role === 'user' && shouldAutoTitle(conv.title)
            ? titleFromQuestion(msg.content)
            : conv.title?.trim() || DEFAULT_CHAT_TITLE;

          await db
            .update(conversations)
            .set({
              messages: updated,
              title: nextTitle,
              updatedAt: now,
            })
            .where(eq(conversations.id, conversationId));

          setConversationTitle(nextTitle);
          setSavedChats((prev) => {
            const summary: AssistantConversationSummary = {
              id: conversationId,
              title: nextTitle,
              messageCount: updated.length,
              lastMessagePreview: msg.content.replace(/\s+/g, ' ').trim().slice(0, 96),
              updatedAt: now,
              createdAt: conv.createdAt,
            };
            const remaining = prev.filter((item) => item.id !== conversationId);
            return [summary, ...remaining].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          });
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
          quickReplies: response.quickReplies,
          suggestedFollowUps: response.suggestedFollowUps,
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

  const startNewChat = useCallback(async () => {
    if (!installerId) {
      setConversationId(generateConversationId());
      setConversationTitle(DEFAULT_CHAT_TITLE);
      setMessages([]);
      return;
    }

    try {
      const created = await createConversation();
      if (created) {
        applyConversation(created);
        await refreshSavedChats();
      }
    } catch (err) {
      console.warn('[useAssistant] failed to create conversation:', err);
      setError('Failed to create a new chat');
    }
  }, [applyConversation, createConversation, installerId, refreshSavedChats]);

  const selectChat = useCallback(
    async (id: string) => {
      if (!installerId) return;

      try {
        const [row] = await db
          .select()
          .from(conversations)
          .where(and(eq(conversations.id, id), eq(conversations.installerId, installerId)))
          .limit(1);

        if (row) {
          applyConversation(row);
          setError(null);
        }
      } catch (err) {
        console.warn('[useAssistant] failed to select conversation:', err);
        setError('Failed to open saved chat');
      }
    },
    [applyConversation, installerId],
  );

  const deleteChat = useCallback(
    async (id: string) => {
      if (!installerId) return;

      try {
        await db
          .delete(conversations)
          .where(and(eq(conversations.id, id), eq(conversations.installerId, installerId)));

        const rows = await db
          .select()
          .from(conversations)
          .where(eq(conversations.installerId, installerId))
          .orderBy(desc(conversations.updatedAt));

        if (rows.length === 0) {
          const created = await createConversation();
          if (created) {
            setSavedChats([summarizeConversation(created)]);
            applyConversation(created);
          }
          return;
        }

        setSavedChats(rows.map(summarizeConversation));
        if (id === conversationId) applyConversation(rows[0]);
      } catch (err) {
        console.warn('[useAssistant] failed to delete conversation:', err);
        setError('Failed to delete saved chat');
      }
    },
    [applyConversation, conversationId, createConversation, installerId],
  );

  const clearHistory = useCallback(async () => {
    if (!conversationId || !installerId) return;

    try {
      setMessages([]);
      const now = new Date().toISOString();
      await db
        .update(conversations)
        .set({
          messages: [],
          title: DEFAULT_CHAT_TITLE,
          updatedAt: now,
        })
        .where(eq(conversations.id, conversationId));
      setConversationTitle(DEFAULT_CHAT_TITLE);
      await refreshSavedChats();
    } catch (err) {
      console.warn('[useAssistant] failed to clear history:', err);
      setError('Failed to clear conversation history');
    }
  }, [conversationId, installerId, refreshSavedChats]);

  return {
    messages,
    savedChats,
    conversationId,
    conversationTitle,
    isLoading,
    error,
    send,
    clearHistory,
    startNewChat,
    selectChat,
    deleteChat,
    isOnline,
  };
}
