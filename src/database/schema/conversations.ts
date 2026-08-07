import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export type MessageRole = 'user' | 'assistant';
export type MessageSource =
  | 'local_guide'
  | 'offline_fts'
  | 'product_library'
  | 'sip_manual'
  | 'technical_docs';

export interface AssistantCitation {
  id: string;
  documentName: string;
  title?: string;
  pageNumber?: number;
  docId?: string;
  score?: number;
  retrieval?: 'local';
}

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  source: MessageSource;
  timestamp: string;
  citations?: AssistantCitation[];
  debugId?: string;
  provider?: string;
  /** Tap choices when the assistant asks a clarifying question. */
  quickReplies?: string[];
  /** Suggested next questions after a full answer. */
  suggestedFollowUps?: string[];
}

export const conversations = sqliteTable(
  'conversations',
  {
    id: text('id').primaryKey(),
    installerId: text('installer_id'),
    title: text('title'),
    // JSON: ConversationMessage[]
    messages: text('messages', { mode: 'json' }).notNull().default('[]'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    installerIdx: index('conversations_installer_idx').on(t.installerId),
  }),
);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
