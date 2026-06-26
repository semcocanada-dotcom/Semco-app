import { sqliteTable, text, real, index } from 'drizzle-orm/sqlite-core';

export const installerProfiles = sqliteTable(
  'installer_profiles',
  {
    id: text('id').primaryKey(),
    installerId: text('installer_id').notNull(),
    companyName: text('company_name'),
    contactName: text('contact_name'),
    email: text('email'),
    phone: text('phone'),
    companyAddress: text('company_address'),
    city: text('city'),
    province: text('province'),
    postalCode: text('postal_code'),
    semcoAccountId: text('semco_account_id'),
    certificationStatus: text('certification_status').notNull().default('pending'),
    assignedDealerId: text('assigned_dealer_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    installerIdx: index('installer_profiles_installer_idx').on(t.installerId),
    postalIdx: index('installer_profiles_postal_idx').on(t.postalCode),
  }),
);

export type InstallerProfile = typeof installerProfiles.$inferSelect;
export type NewInstallerProfile = typeof installerProfiles.$inferInsert;

export type RewardCreditStatus = 'pending' | 'verified' | 'rejected';
export type RewardCreditSource = 'order_request' | 'receipt' | 'project_review';

export const rewardCredits = sqliteTable(
  'reward_credits',
  {
    id: text('id').primaryKey(),
    installerId: text('installer_id').notNull(),
    projectId: text('project_id'),
    sourceType: text('source_type').notNull(),
    sourceId: text('source_id'),
    sqft: real('sqft').notNull().default(0),
    status: text('status').notNull().default('pending'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    verifiedAt: text('verified_at'),
  },
  (t) => ({
    installerIdx: index('reward_credits_installer_idx').on(t.installerId),
    projectIdx: index('reward_credits_project_idx').on(t.projectId),
    statusIdx: index('reward_credits_status_idx').on(t.status),
  }),
);

export type RewardCredit = typeof rewardCredits.$inferSelect;
export type NewRewardCredit = typeof rewardCredits.$inferInsert;

export type WarrantyReviewStatus = 'not_submitted' | 'in_review' | 'needs_revision' | 'approved' | 'rejected';

export const warrantyReviews = sqliteTable(
  'warranty_reviews',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    installerId: text('installer_id').notNull(),
    status: text('status').notNull().default('in_review'),
    productsSummary: text('products_summary'),
    effectiveDate: text('effective_date'),
    reviewerName: text('reviewer_name'),
    reviewerSignatureUrl: text('reviewer_signature_url'),
    warrantyDocumentUrl: text('warranty_document_url'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    reviewedAt: text('reviewed_at'),
  },
  (t) => ({
    projectIdx: index('warranty_reviews_project_idx').on(t.projectId),
    installerIdx: index('warranty_reviews_installer_idx').on(t.installerId),
    statusIdx: index('warranty_reviews_status_idx').on(t.status),
  }),
);

export type WarrantyReview = typeof warrantyReviews.$inferSelect;
export type NewWarrantyReview = typeof warrantyReviews.$inferInsert;

export const purchaseReceipts = sqliteTable(
  'purchase_receipts',
  {
    id: text('id').primaryKey(),
    installerId: text('installer_id').notNull(),
    projectId: text('project_id'),
    dealerName: text('dealer_name'),
    receiptNumber: text('receipt_number'),
    receiptUrl: text('receipt_url'),
    sqftClaimed: real('sqft_claimed').notNull().default(0),
    status: text('status').notNull().default('pending'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    reviewedAt: text('reviewed_at'),
  },
  (t) => ({
    installerIdx: index('purchase_receipts_installer_idx').on(t.installerId),
    projectIdx: index('purchase_receipts_project_idx').on(t.projectId),
    statusIdx: index('purchase_receipts_status_idx').on(t.status),
  }),
);

export type PurchaseReceipt = typeof purchaseReceipts.$inferSelect;
export type NewPurchaseReceipt = typeof purchaseReceipts.$inferInsert;
