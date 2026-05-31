import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export type MessageRole = 'user' | 'assistant';
export type MessageSource = 'claude' | 'offline_fts' | 'product_library' | 'sip_manual';

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  source: MessageSource;
  timestamp: string;
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
