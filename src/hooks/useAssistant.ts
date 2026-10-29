import { useState, useCallback, useEffect, useRef } from 'react';
import { sendMessage } from '@/services/ai/assistant';
import { useAuthStore } from '@/store/auth';
import { db } from '@/database/client';
import { conversations } from '@/database/schema/conversations';
import { and, desc, eq } from 'drizzle-orm';
import type { Conversation, ConversationMessage } from '@/database/schema/conversations';
import { createLocalId } from '@/utils/id';

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
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>('');
  const [conversationTitle, setConversationTitle] = useState(DEFAULT_CHAT_TITLE);
  const installerId = useAuthStore((s) => s.user?.id);
  const operationInFlight = useRef(false);
  const activeConversation = useRef({ id: '', title: DEFAULT_CHAT_TITLE, messages: [] as ConversationMessage[] });

  // A ref closes the same-render double-tap gap that a state flag cannot.
  // Reads, sends and destructive chat operations share this lock so an old
  // response cannot replace a newly selected job's conversation.
  const beginOperation = useCallback(() => {
    if (operationInFlight.current) return false;
    operationInFlight.current = true;
    setIsBusy(true);
    return true;
  }, []);
  const finishOperation = useCallback(() => {
    operationInFlight.current = false;
    setIsBusy(false);
  }, []);

  const applyConversation = useCallback((conv: Conversation) => {
    activeConversation.current = { id: conv.id, title: conv.title?.trim() || DEFAULT_CHAT_TITLE, messages: normalizeMessages(conv.messages) };
    setConversationId(conv.id);
    setConversationTitle(conv.title?.trim() || DEFAULT_CHAT_TITLE);
    setMessages(normalizeMessages(conv.messages));
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
      if (!beginOperation()) return;
      if (!installerId) {
        activeConversation.current = { id: '', title: DEFAULT_CHAT_TITLE, messages: [] };
        setConversationId('');
        setConversationTitle(DEFAULT_CHAT_TITLE);
        setMessages([]);
        setSavedChats([]);
        finishOperation();
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

        const selected = rows.find((row) => row.id === preferredId)
          ?? rows.find((row) => normalizeMessages(row.messages).length > 0)
          ?? rows[0];
        if (selected) applyConversation(selected);
      } catch (err) {
        console.warn('[useAssistant] failed to load conversations:', err);
        const newConvId = generateConversationId();
        activeConversation.current = { id: newConvId, title: DEFAULT_CHAT_TITLE, messages: [] };
        setConversationId(newConvId);
        setConversationTitle(DEFAULT_CHAT_TITLE);
        setMessages([]);
      } finally {
        finishOperation();
      }
    },
    [applyConversation, beginOperation, createConversation, finishOperation, installerId],
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
        const normalizedMessages = nextMessages;

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
        throw new Error('Your chat could not be saved on this device. Please try again before leaving this chat.');
      }
    },
    [installerId],
  );

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || !beginOperation()) return;
      setIsLoading(true);
      setError(null);

      try {
        // Read the current snapshot, not the state captured by an older handler.
        let current = activeConversation.current;
        if (!current.id) {
          const created = await createConversation();
          if (!created) {
            setError('The chat could not be saved. Please try again.');
            return;
          }
          applyConversation(created);
          current = activeConversation.current;
          await refreshSavedChats();
        }

        // This guide runs locally: no token window is needed. Older installer
        // facts must still be available when a long saved chat is reopened.
        const baseMessages = current.messages;
        const userMsg: ConversationMessage = {
          id: generateId(),
          role: 'user',
          content: text.trim(),
          source: 'local_guide',
          timestamp: new Date().toISOString(),
        };
        // Keep the full conversation; individual search excerpts remain bounded.
        const messagesWithUser = [...current.messages, userMsg];
        const nextTitle = shouldAutoTitle(current.title) ? titleFromQuestion(userMsg.content) : current.title;

        activeConversation.current = { id: current.id, title: nextTitle, messages: messagesWithUser };
        setMessages(messagesWithUser);
        await persistConversationState(current.id, messagesWithUser, nextTitle);

        const response = await sendMessage(text, baseMessages);

        const assistantMsg: ConversationMessage = {
          id: generateId(),
          role: 'assistant',
          content: response.content,
          source: response.source,
          timestamp: new Date().toISOString(),
          citations: response.citations,
          provider: response.provider,
          quickReplies: response.quickReplies,
          suggestedFollowUps: response.suggestedFollowUps,
          guideLesson: response.guideLesson,
          videos: response.videos,
          guideEducation: response.guideEducation,
        };
        const messagesWithAssistant = [...messagesWithUser, assistantMsg];

        activeConversation.current = { id: current.id, title: nextTitle, messages: messagesWithAssistant };
        setMessages(messagesWithAssistant);
        await persistConversationState(current.id, messagesWithAssistant, nextTitle);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
      } finally {
        setIsLoading(false);
        finishOperation();
      }
    },
    [
      applyConversation,
      beginOperation,
      createConversation,
      finishOperation,
      persistConversationState,
      refreshSavedChats,
    ],
  );

  const startNewChat = useCallback(async () => {
    if (!beginOperation()) return;
    if (!installerId) {
      const id = generateConversationId();
      activeConversation.current = { id, title: DEFAULT_CHAT_TITLE, messages: [] };
      setConversationId(id);
      setConversationTitle(DEFAULT_CHAT_TITLE);
      setMessages([]);
      finishOperation();
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
    } finally {
      finishOperation();
    }
  }, [applyConversation, beginOperation, createConversation, finishOperation, installerId, refreshSavedChats]);

  const selectChat = useCallback(
    async (id: string) => {
      if (!installerId || !beginOperation()) return;

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
      } finally {
        finishOperation();
      }
    },
    [applyConversation, beginOperation, finishOperation, installerId],
  );

  const deleteChat = useCallback(
    async (id: string) => {
      if (!installerId || !beginOperation()) return;

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
        if (id === activeConversation.current.id) applyConversation(rows[0]);
      } catch (err) {
        console.warn('[useAssistant] failed to delete conversation:', err);
        setError('Failed to delete saved chat');
      } finally {
        finishOperation();
      }
    },
    [applyConversation, beginOperation, createConversation, finishOperation, installerId],
  );

  const clearHistory = useCallback(async () => {
    if (!activeConversation.current.id || !installerId || !beginOperation()) return;

    try {
      const id = activeConversation.current.id;
      const now = new Date().toISOString();
      await db
        .update(conversations)
        .set({
          messages: [],
          title: DEFAULT_CHAT_TITLE,
          updatedAt: now,
        })
        .where(and(eq(conversations.id, id), eq(conversations.installerId, installerId)));
      activeConversation.current = { id, title: DEFAULT_CHAT_TITLE, messages: [] };
      setMessages([]);
      setConversationTitle(DEFAULT_CHAT_TITLE);
      await refreshSavedChats();
    } catch (err) {
      console.warn('[useAssistant] failed to clear history:', err);
      setError('Failed to clear conversation history');
    } finally {
      finishOperation();
    }
  }, [beginOperation, finishOperation, installerId, refreshSavedChats]);

  return {
    messages,
    savedChats,
    conversationId,
    conversationTitle,
    isLoading,
    isBusy,
    error,
    send,
    clearHistory,
    startNewChat,
    selectChat,
    deleteChat,
  };
}
