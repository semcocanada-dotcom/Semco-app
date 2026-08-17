import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    sku: text('sku').notNull().unique(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    coverageMinSqmPerKg: real('coverage_min_sqm_per_kg'),
    coverageMaxSqmPerKg: real('coverage_max_sqm_per_kg'),
    packSizeKg: real('pack_size_kg').default(1),
    potLifeMinutes: integer('pot_life_minutes'),
    cureTimeHours: integer('cure_time_hours'),
    tdsContent: text('tds_content').notNull().default(''),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    categoryIdx: index('products_category_idx').on(t.category),
    skuIdx: index('products_sku_idx').on(t.sku),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
