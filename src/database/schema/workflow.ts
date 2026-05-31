import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export type OrderRequestStatus = 'draft' | 'in_review' | 'needs_revision' | 'approved';

export const orderRequests = sqliteTable(
  'order_requests',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    calculationId: text('calculation_id'),
    status: text('status').notNull().default('draft'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    projectIdx: index('order_requests_project_idx').on(t.projectId),
    statusIdx: index('order_requests_status_idx').on(t.status),
  }),
);

export type OrderRequest = typeof orderRequests.$inferSelect;
export type NewOrderRequest = typeof orderRequests.$inferInsert;
