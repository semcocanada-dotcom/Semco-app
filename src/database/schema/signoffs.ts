import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type ProjectSignoffType =
  | 'mockup_color_acceptance'
  | 'project_change_order'
  | 'project_phase_acceptance'
  | 'final_project_acceptance'
  | 'surface_protection'
  | 'sample_approval'
  | 'project_signoff'
  | 'change_order'
  | 'warranty_handover';
export type ProjectSignoffStatus = 'draft' | 'signed';

export const projectSignoffs = sqliteTable(
  'project_signoffs',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    installerId: text('installer_id').notNull(),
    type: text('type').notNull(),
    status: text('status').notNull().default('draft'),
    title: text('title').notNull(),
    customerName: text('customer_name'),
    customerEmail: text('customer_email'),
    summary: text('summary'),
    notes: text('notes'),
    formData: text('form_data').notNull().default('{}'),
    signatureData: text('signature_data'),
    signedAt: text('signed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    projectIdx: index('project_signoffs_project_idx').on(t.projectId),
    typeIdx: index('project_signoffs_type_idx').on(t.type),
    statusIdx: index('project_signoffs_status_idx').on(t.status),
  }),
);

export type ProjectSignoff = typeof projectSignoffs.$inferSelect;
export type NewProjectSignoff = typeof projectSignoffs.$inferInsert;
