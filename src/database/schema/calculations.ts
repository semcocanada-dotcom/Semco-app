import { sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';
import type { InstallationScope, PrepConditionId } from '@/constants/prep-systems';

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
  quantityRangeMin?: number;
  quantityRangeMax?: number;
  prepStep?: number;
  dilutionLabel?: string;
}

export type TintBatchSize = 'quart' | 'gallon' | 'five_gallon';
export type TintFormulaBasis = 'direct_source' | 'derived_from_gallon_div_4';

export interface TintBatchPlanLine {
  batchSize: TintBatchSize;
  batchLabel: string;
  batchGallons: 0.25 | 1 | 5;
  quantity: number;
  preparedGallons: number;
  tintOuncesPerBatch?: number;
  totalTintOunces?: number;
  chargeCadPerBatch?: number;
  lineTotalCad?: number;
  formulaBasis?: TintFormulaBasis;
  /** Dispenser formula for one batch/container; repeat it `quantity` times. */
  pigments?: TintPigmentPlanLine[];
}

export interface TintPigmentPlanLine {
  pigmentCode: string;
  pigmentName: string;
  dispenserY48: number;
  dispenserAmount: string;
  tintOunces: number;
}

export interface ColourTintAllocation {
  colourId: string;
  colourCode: string;
  colourName: string;
  formulaCode: string;
  swatchHex?: string;
  areaSqft: number;
  exactLiquidGallons: number;
  preparedLiquidGallons: number;
  batches: TintBatchPlanLine[];
  pigments: TintPigmentPlanLine[];
  totalTintOunces?: number;
  totalChargeCad?: number;
  pricingStatus: 'priced' | 'dealer_review';
  reviewReason?: string;
  preparationNote?: string;
}

export interface ColourTintSampleLine {
  colourId: string;
  colourCode: string;
  colourName: string;
  formulaCode: string;
  swatchHex?: string;
  sampleSize: 'quart';
  sampleLabel: string;
  liquidGallons: 0.25;
  batch?: TintBatchPlanLine;
  pigments: TintPigmentPlanLine[];
  totalTintOunces?: number;
  /** Flat customer price including sample liquid and pigment. */
  flatRateCad?: number;
  /** Legacy v1/v2 pigment-only charge. */
  pigmentChargeCad?: number;
  /** Legacy v1/v2 prepared-quart fee. */
  preparationFeeCad?: number;
  /** Flat rate before any project-size discount. */
  subtotalChargeCad?: number;
  /** Flat-rate amount waived under the project-size policy. */
  discountCad?: number;
  /** Final sample charge. Retains the legacy total field for stored snapshots. */
  totalChargeCad?: number;
  isSampleComplimentary?: boolean;
  /** Legacy v1/v2 snapshot field. */
  isComplimentary?: boolean;
  pricingStatus: 'priced' | 'dealer_review';
  reviewReason?: string;
}

export interface ColourTintSamplePlan {
  samples: ColourTintSampleLine[];
  sampleSize: 'quart';
  sampleLabel: string;
  /** Snapshot used to recalculate plans with older fee or liquid-source rules. */
  pricingPolicyVersion?: string;
  /** Source of the X-Bond Liquid used to prepare samples. */
  liquidSource?: 'dealer_sample_stock' | 'ordered_project_material';
  /** Amount the dealer supplies from sample stock for sample preparation. */
  totalLiquidGallons: number;
  totalTintOunces?: number;
  /** Aggregate flat price for every selected sample before any waiver. */
  totalFlatRateCad?: number;
  /** Legacy v1/v2 aggregate pigment charge. */
  totalPigmentChargeCad?: number;
  /** Legacy v1/v2 aggregate prepared-quart fee. */
  totalPreparationFeeCad?: number;
  subtotalChargeCad?: number;
  totalDiscountCad?: number;
  /** Final aggregate sample charge. Retains the legacy total field for stored snapshots. */
  totalChargeCad?: number;
  isSampleComplimentary?: boolean;
  sampleComplimentaryThresholdSqft?: number;
  /** Legacy v1/v2 snapshot fields. */
  isComplimentary?: boolean;
  complimentaryThresholdSqft?: number;
  isFullyPriced: boolean;
}

export interface ColourTintPlan {
  allocations: ColourTintAllocation[];
  samplePlan?: ColourTintSamplePlan;
  exactLiquidGallons: number;
  preparedLiquidGallons: number;
  baseLiquidPurchaseGallons: number;
  totalTintOunces?: number;
  totalChargeCad?: number;
  ratePerTintOunceCad: number;
  pricingUnit: string;
  isFullyPriced: boolean;
}

export interface CalculationResult {
  layers: MaterialLayer[];
  totalKg: number;
  wastePct: number;
  areaSqm: number;
  areaSqft?: number;
  sourceSummary?: string;
  prepCondition?: PrepConditionId;
  prepSystemLabel?: string;
  liquidMembraneRequired?: boolean;
  installationScope?: InstallationScope;
  colourTintPlan?: ColourTintPlan;
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
