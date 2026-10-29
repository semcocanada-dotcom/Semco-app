import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** Only reviewed, bundled knowledge is seeded here. Chat text is never training data. */
export const guideKnowledge = sqliteTable('guide_knowledge', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  version: text('version').notNull(),
  content: text('content', { mode: 'json' }).notNull(),
});
