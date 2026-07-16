import { useState, useCallback, useEffect } from 'react';
import { sendMessage } from '@/services/ai/assistant';
import { useNetworkStore } from '@/store/network';
import { useAuthStore } from '@/store/auth';
import { db } from '@/database/client';
import { conversations } from '@/database/schema/conversations';
import { and, desc, eq } from 'drizzle-orm';
import type { Conversation, ConversationMessage } from '@/database/schema/conversations';
import { createLocalId } from '@/utils/id';
import { hydrateCloudConversations, syncConversationToCloud } from '@/services/cloud-sync';
import { supabase } from '@/services/supabase';

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
  return createLocalId('conversation');
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
    if (!installerId) return undefined;
    const newConvId = generateConversationId();
    const now = new Date().toISOString();

    const createdConversation: Conversation = {
      id: newConvId,
      installerId,
      title: DEFAULT_CHAT_TITLE,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(conversations).values(createdConversation);
    return createdConversation;
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
        let cloudRows: Conversation[] = [];
        if (isOnline) {
          try {
            cloudRows = await hydrateCloudConversations(installerId);
          } catch (cloudError) {
            console.warn('[useAssistant] saved chats cloud hydration pending:', cloudError);
          }
        }

        let rows = await db
          .select()
          .from(conversations)
          .where(eq(conversations.installerId, installerId))
          .orderBy(desc(conversations.updatedAt));

        if (cloudRows.length > 0) {
          const mergedRows = new Map(rows.map((row) => [row.id, row]));
          for (const cloudRow of cloudRows) mergedRows.set(cloudRow.id, cloudRow);
          rows = [...mergedRows.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        }

        if (rows.length === 0) {
          const created = await createConversation();
          rows = created ? [created] : [];
        }

        setSavedChats(rows.map(summarizeConversation));

        const selected = rows.find((row) => row.id === preferredId)
          ?? rows.find((row) => normalizeMessages(row.messages).length > 0)
          ?? rows[0];
        if (selected) applyConversation(selected);
      } catch (err) {
        console.warn('[useAssistant] failed to load conversations:', err);
        const newConvId = generateConversationId();
        setConversationId(newConvId);
        setConversationTitle(DEFAULT_CHAT_TITLE);
        setMessages([]);
      }
    },
    [applyConversation, createConversation, installerId, isOnline],
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

  const persistConversationState = useCallback(
    async (
      targetConversationId: string,
      nextMessages: ConversationMessage[],
      nextTitle: string,
    ) => {
      if (!targetConversationId || !installerId) return;

      try {
        const [existing] = await db
          .select()
          .from(conversations)
          .where(and(eq(conversations.id, targetConversationId), eq(conversations.installerId, installerId)))
          .limit(1);

        const now = new Date().toISOString();
        const createdAt = existing?.createdAt ?? now;
        const normalizedTitle = nextTitle.trim() || DEFAULT_CHAT_TITLE;
        const normalizedMessages = nextMessages.slice(-80);

        if (existing) {
          await db
            .update(conversations)
            .set({
              messages: normalizedMessages,
              title: normalizedTitle,
              updatedAt: now,
            })
            .where(and(eq(conversations.id, targetConversationId), eq(conversations.installerId, installerId)));
        } else {
          await db.insert(conversations).values({
            id: targetConversationId,
            installerId,
            title: normalizedTitle,
            messages: normalizedMessages,
            createdAt,
            updatedAt: now,
          });
        }

        const conversationSnapshot: Conversation = {
          id: targetConversationId,
          installerId,
          title: normalizedTitle,
          messages: normalizedMessages,
          createdAt,
          updatedAt: now,
        };
        const cloudResult = await syncConversationToCloud(conversationSnapshot);
        if (!cloudResult.ok) console.warn('[useAssistant] conversation cloud sync pending:', cloudResult.error);

        setConversationTitle(normalizedTitle);
        setSavedChats((prev) => {
          const lastMessage = normalizedMessages[normalizedMessages.length - 1];
          const summary: AssistantConversationSummary = {
            id: targetConversationId,
            title: normalizedTitle,
            messageCount: normalizedMessages.length,
            lastMessagePreview: lastMessage?.content.replace(/\s+/g, ' ').trim().slice(0, 96) || 'No messages yet',
            updatedAt: now,
            createdAt,
          };
          const remaining = prev.filter((item) => item.id !== targetConversationId);
          return [summary, ...remaining].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        });
      } catch (err) {
        console.warn('[useAssistant] failed to persist conversation:', err);
      }
    },
    [installerId],
  );

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      setIsLoading(true);
      setError(null);

      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const created = await createConversation();
        if (!created) {
          setError('The chat could not be saved. Please try again.');
          setIsLoading(false);
          return;
        }
        activeConversationId = created.id;
        applyConversation(created);
        await refreshSavedChats();
      }

      const baseMessages = messages.slice(-80);
      const userMsg: ConversationMessage = {
        id: generateId(),
        role: 'user',
        content: text.trim(),
        source: 'claude',
        timestamp: new Date().toISOString(),
      };
      const messagesWithUser = [...baseMessages, userMsg].slice(-80);
      const nextTitle = shouldAutoTitle(conversationTitle)
        ? titleFromQuestion(userMsg.content)
        : conversationTitle;

      setMessages(messagesWithUser);
      await persistConversationState(activeConversationId, messagesWithUser, nextTitle);

      try {
        const response = await sendMessage(text, baseMessages, isOnline, installerId);

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
        const messagesWithAssistant = [...messagesWithUser, assistantMsg].slice(-80);

        setMessages(messagesWithAssistant);
        await persistConversationState(activeConversationId, messagesWithAssistant, nextTitle);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [
      applyConversation,
      conversationId,
      conversationTitle,
      createConversation,
      isLoading,
      isOnline,
      installerId,
      messages,
      persistConversationState,
      refreshSavedChats,
    ],
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
        await supabase.from('conversations').delete().eq('id', id).eq('installer_id', installerId);

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
      const [cleared] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
      if (cleared) await syncConversationToCloud(cleared);
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
