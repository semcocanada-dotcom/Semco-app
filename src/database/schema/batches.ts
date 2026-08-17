import { sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';

export const batchLogs = sqliteTable(
  'batch_logs',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    productId: text('product_id').notNull(),
    batchNumber: text('batch_number').notNull(),
    quantityKg: real('quantity_kg'),
    coverageAchievedSqm: real('coverage_achieved_sqm'),
    appliedAt: text('applied_at').notNull(),
    notes: text('notes'),
  },
  (t) => ({
    projectIdx: index('batch_logs_project_idx').on(t.projectId),
    productIdx: index('batch_logs_product_idx').on(t.productId),
  }),
);

export type BatchLog = typeof batchLogs.$inferSelect;
export type NewBatchLog = typeof batchLogs.$inferInsert;
