import { sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';

export interface MaterialLayer {
  productId: string;
  productSku: string;
  productName: string;
  category: string;
  coats: number;
  quantityKg: number;
  quantityPacks: number;
  packSizeKg: number;
  coverageRateSqmPerKg: number;
  quantityLabel?: string;
  purchaseLabel?: string;
  packLabel?: string;
  coverageLabel?: string;
  sourceDocument?: string;
  sourcePage?: number;
  sourceNote?: string;
  exactQuantity?: number;
  roundedQuantity?: number;
}

export interface CalculationResult {
  layers: MaterialLayer[];
  totalKg: number;
  wastePct: number;
  areaSqm: number;
  areaSqft?: number;
  sourceSummary?: string;
}

export const calculations = sqliteTable(
  'calculations',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id'),
    installerId: text('installer_id'),
    areaSqm: real('area_sqm').notNull(),
    substrateType: text('substrate_type').notNull(),
    wastePct: real('waste_pct').notNull().default(10),
    // JSON: CalculationResult
    result: text('result', { mode: 'json' }).notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => ({
    projectIdx: index('calculations_project_idx').on(t.projectId),
    installerIdx: index('calculations_installer_idx').on(t.installerId),
  }),
);

export type Calculation = typeof calculations.$inferSelect;
export type NewCalculation = typeof calculations.$inferInsert;
