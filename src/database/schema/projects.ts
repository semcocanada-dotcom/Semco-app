import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable(
  'projects',
  {
    id: text('id').primaryKey(),
    installerId: text('installer_id').notNull(),
    // Customer
    clientName: text('client_name'),
    clientEmail: text('client_email'),
    clientPhone: text('client_phone'),
    siteAddress: text('site_address'),
    // Application spec
    substrateType: text('substrate_type'),
    totalAreaSqm: real('total_area_sqm'),
    selectedColorId: text('selected_color_id'),
    finishType: text('finish_type'),
    sealerProductId: text('sealer_product_id'),
    // State
    status: text('status').notNull().default('active'),
    warrantyIssued: integer('warranty_issued', { mode: 'boolean' }).notNull().default(false),
    completionDate: text('completion_date'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    installerIdx: index('projects_installer_idx').on(t.installerId),
    statusIdx: index('projects_status_idx').on(t.status),
  }),
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectStatus = 'active' | 'complete' | 'on_hold';
export type FinishType = 'matte' | 'satin' | 'gloss';

export const projects_photos = sqliteTable(
  'project_photos',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    installerId: text('installer_id').notNull(),
    stage: text('stage').notNull(),
    photoUrl: text('photo_url').notNull(),
    storagePath: text('storage_path'),
    caption: text('caption'),
    takenAt: text('taken_at').notNull(),
  },
  (t) => ({
    projectIdx: index('project_photos_project_idx').on(t.projectId),
  }),
);

export type ProjectPhoto = typeof projects_photos.$inferSelect;
export type NewProjectPhoto = typeof projects_photos.$inferInsert;

export type PhotoStage = 'substrate' | 'primer' | 'base_coat' | 'finish_coat' | 'sealed' | 'final';

export const PHOTO_STAGES: { id: PhotoStage; label: string }[] = [
  { id: 'substrate', label: 'Substrate / Prep' },
  { id: 'primer', label: 'Liquid Membrane / Primer' },
  { id: 'base_coat', label: 'Scratch / Base Coat' },
  { id: 'finish_coat', label: 'Finish Coat' },
  { id: 'sealed', label: 'Sealer Applied' },
  { id: 'final', label: 'Final / Handover' },
];
