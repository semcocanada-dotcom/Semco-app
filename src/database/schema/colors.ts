import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const colors = sqliteTable(
  'colors',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    code: text('code'),
    isStandard: integer('is_standard', { mode: 'boolean' }).notNull().default(true),
    installerId: text('installer_id'),
    // JSON: [{pigmentSku: string, ratioGPerKg: number}]
    pigments: text('pigments', { mode: 'json' }).notNull().default('[]'),
    photoUrl: text('photo_url'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    installerIdx: index('colors_installer_idx').on(t.installerId),
    isStandardIdx: index('colors_is_standard_idx').on(t.isStandard),
  }),
);

export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;

export interface PigmentRatio {
  pigmentSku: string;
  pigmentName: string;
  ratioGPerKg: number;
}
