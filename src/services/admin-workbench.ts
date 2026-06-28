import { desc, eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { calculations, type Calculation, type CalculationResult } from '@/database/schema/calculations';
import {
  installerProfiles,
  purchaseReceipts,
  rewardCredits,
  warrantyReviews,
  type InstallerProfile,
  type PurchaseReceipt,
  type RewardCredit,
  type RewardCreditStatus,
  type WarrantyReview,
  type WarrantyReviewStatus,
} from '@/database/schema/installers';
import {
  projects,
  projects_photos,
  type Project,
  type ProjectPhoto,
} from '@/database/schema/projects';
import { orderRequests, type OrderRequest, type OrderRequestStatus } from '@/database/schema/workflow';
import { resolveDealerContext, type DealerContext } from '@/constants/dealers';
import { getWarrantyPhotoStatus, type WarrantyPhotoStatus } from '@/services/warranty';
import { sqmToSqft } from '@/utils/area';

type CertificationStatus = 'pending' | 'certified' | 'suspended';

export interface AdminInstallerRecord {
  installerId: string;
  profile: InstallerProfile | null;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  dealer: DealerContext;
  certificationStatus: string;
  projectCount: number;
  warrantyPendingCount: number;
  orderPendingCount: number;
  receiptPendingCount: number;
  verifiedSqft: number;
  pendingSqft: number;
}

export interface AdminWarrantyItem {
  project: Project;
  profile: InstallerProfile | null;
  review: WarrantyReview | null;
  photos: ProjectPhoto[];
  photoStatus: WarrantyPhotoStatus;
}

export interface AdminOrderItem {
  order: OrderRequest;
  project: Project | null;
  profile: InstallerProfile | null;
  calculation: Calculation | null;
  result: CalculationResult | null;
  dealer: DealerContext;
}

export interface AdminReceiptItem {
  receipt: PurchaseReceipt;
  profile: InstallerProfile | null;
  project: Project | null;
  linkedCredit: RewardCredit | null;
}

export interface AdminRewardItem {
  credit: RewardCredit;
  profile: InstallerProfile | null;
  project: Project | null;
}

export interface AdminWorkbenchData {
  installers: AdminInstallerRecord[];
  warrantyQueue: AdminWarrantyItem[];
  orderQueue: AdminOrderItem[];
  receiptQueue: AdminReceiptItem[];
  rewardQueue: AdminRewardItem[];
  stats: {
    installers: number;
    activeProjects: number;
    warrantyPending: number;
    orderPending: number;
    receiptPending: number;
    pendingSqft: number;
    verifiedSqft: number;
  };
}

export async function getAdminWorkbenchData(): Promise<AdminWorkbenchData> {
  const [
    profileRows,
    projectRows,
    photoRows,
    calculationRows,
    orderRows,
    warrantyRows,
    receiptRows,
    rewardRows,
  ] = await Promise.all([
    db.select().from(installerProfiles),
    db.select().from(projects).orderBy(desc(projects.updatedAt)),
    db.select().from(projects_photos),
    db.select().from(calculations).orderBy(desc(calculations.createdAt)),
    db.select().from(orderRequests).orderBy(desc(orderRequests.updatedAt)),
    db.select().from(warrantyReviews).orderBy(desc(warrantyReviews.updatedAt)),
    db.select().from(purchaseReceipts).orderBy(desc(purchaseReceipts.updatedAt)),
    db.select().from(rewardCredits).orderBy(desc(rewardCredits.createdAt)),
  ]);

  const profilesByInstaller = new Map(profileRows.map((profile) => [profile.installerId, profile]));
  const projectsById = new Map(projectRows.map((project) => [project.id, project]));
  const projectIdsByInstaller = groupBy(projectRows, (project) => project.installerId);
  const photosByProject = groupBy(photoRows, (photo) => photo.projectId);
  const latestCalculationByProject = latestBy(calculationRows, (calculation) => calculation.projectId ?? '');
  const latestWarrantyByProject = latestBy(warrantyRows, (review) => review.projectId);
  const rewardsByInstaller = groupBy(rewardRows, (credit) => credit.installerId);
  const rewardsBySourceId = latestBy(rewardRows, (credit) => credit.sourceId ?? '');
  const receiptsByInstaller = groupBy(receiptRows, (receipt) => receipt.installerId);

  const installerIds = new Set<string>();
  profileRows.forEach((profile) => installerIds.add(profile.installerId));
  projectRows.forEach((project) => installerIds.add(project.installerId));
  receiptRows.forEach((receipt) => installerIds.add(receipt.installerId));
  rewardRows.forEach((credit) => installerIds.add(credit.installerId));

  const installers = [...installerIds].map((installerId) => {
    const profile = profilesByInstaller.get(installerId) ?? null;
    const installerProjects = projectIdsByInstaller.get(installerId) ?? [];
    const installerRewards = rewardsByInstaller.get(installerId) ?? [];
    const installerReceipts = receiptsByInstaller.get(installerId) ?? [];
    const dealer = resolveDealerContext({
      companyPostalCode: profile?.postalCode,
      companyProvince: profile?.province,
      companyAddress: profile?.companyAddress,
    });

    return {
      installerId,
      profile,
      companyName: profile?.companyName ?? 'Company profile needed',
      contactName: profile?.contactName ?? 'Installer',
      email: profile?.email ?? 'No email saved',
      phone: profile?.phone ?? '',
      dealer,
      certificationStatus: profile?.certificationStatus ?? 'pending',
      projectCount: installerProjects.length,
      warrantyPendingCount: installerProjects.filter((project) => {
        const review = latestWarrantyByProject.get(project.id);
        return review?.status === 'in_review' || review?.status === 'needs_revision';
      }).length,
      orderPendingCount: orderRows.filter((order) => {
        const project = projectsById.get(order.projectId);
        return project?.installerId === installerId && order.status === 'in_review';
      }).length,
      receiptPendingCount: installerReceipts.filter((receipt) => receipt.status === 'pending').length,
      verifiedSqft: sumCreditSqft(installerRewards, 'verified'),
      pendingSqft: sumCreditSqft(installerRewards, 'pending'),
    } satisfies AdminInstallerRecord;
  }).sort((a, b) => b.pendingSqft - a.pendingSqft || a.companyName.localeCompare(b.companyName));

  const warrantyQueue = projectRows.map((project) => {
    const photos = photosByProject.get(project.id) ?? [];
    return {
      project,
      profile: profilesByInstaller.get(project.installerId) ?? null,
      review: latestWarrantyByProject.get(project.id) ?? null,
      photos,
      photoStatus: getWarrantyPhotoStatus(photos),
    } satisfies AdminWarrantyItem;
  }).sort((a, b) => {
    const aPriority = getWarrantyPriority(a.review, a.photoStatus);
    const bPriority = getWarrantyPriority(b.review, b.photoStatus);
    return bPriority - aPriority || b.project.updatedAt.localeCompare(a.project.updatedAt);
  });

  const orderQueue = orderRows.map((order) => {
    const project = projectsById.get(order.projectId) ?? null;
    const profile = project ? profilesByInstaller.get(project.installerId) ?? null : null;
    const calculation = order.calculationId
      ? calculationRows.find((row) => row.id === order.calculationId) ?? null
      : project ? latestCalculationByProject.get(project.id) ?? null : null;
    const result = isCalculationResult(calculation?.result) ? calculation.result : null;
    const dealer = resolveDealerContext({
      companyPostalCode: profile?.postalCode,
      companyProvince: profile?.province,
      companyAddress: profile?.companyAddress,
      projectAddress: project?.siteAddress,
    });
    return { order, project, profile, calculation, result, dealer } satisfies AdminOrderItem;
  });

  const receiptQueue = receiptRows.map((receipt) => ({
    receipt,
    profile: profilesByInstaller.get(receipt.installerId) ?? null,
    project: receipt.projectId ? projectsById.get(receipt.projectId) ?? null : null,
    linkedCredit: rewardsBySourceId.get(receipt.id) ?? null,
  } satisfies AdminReceiptItem));

  const rewardQueue = rewardRows.map((credit) => ({
    credit,
    profile: profilesByInstaller.get(credit.installerId) ?? null,
    project: credit.projectId ? projectsById.get(credit.projectId) ?? null : null,
  } satisfies AdminRewardItem));

  return {
    installers,
    warrantyQueue,
    orderQueue,
    receiptQueue,
    rewardQueue,
    stats: {
      installers: installerIds.size,
      activeProjects: projectRows.filter((project) => project.status === 'active').length,
      warrantyPending: warrantyRows.filter((review) => review.status === 'in_review').length,
      orderPending: orderRows.filter((order) => order.status === 'in_review').length,
      receiptPending: receiptRows.filter((receipt) => receipt.status === 'pending').length,
      pendingSqft: sumCreditSqft(rewardRows, 'pending'),
      verifiedSqft: sumCreditSqft(rewardRows, 'verified'),
    },
  };
}

export async function setInstallerCertification(
  installerId: string,
  status: CertificationStatus,
): Promise<void> {
  const rows = await db
    .select()
    .from(installerProfiles)
    .where(eq(installerProfiles.installerId, installerId))
    .limit(1);
  const now = new Date().toISOString();

  if (rows[0]) {
    await db
      .update(installerProfiles)
      .set({ certificationStatus: status, updatedAt: now })
      .where(eq(installerProfiles.id, rows[0].id));
    return;
  }

  await db.insert(installerProfiles).values({
    id: `profile-${Date.now()}`,
    installerId,
    companyName: null,
    contactName: null,
    email: null,
    phone: null,
    companyAddress: null,
    city: null,
    province: null,
    postalCode: null,
    semcoAccountId: null,
    certificationStatus: status,
    assignedDealerId: null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function setWarrantyProjectStatus(
  projectId: string,
  status: Extract<WarrantyReviewStatus, 'approved' | 'needs_revision' | 'rejected'>,
): Promise<void> {
  const now = new Date().toISOString();
  const projectRows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const project = projectRows[0];
  if (!project) return;

  const reviewRows = await db
    .select()
    .from(warrantyReviews)
    .where(eq(warrantyReviews.projectId, projectId))
    .orderBy(desc(warrantyReviews.updatedAt))
    .limit(1);

  const existing = reviewRows[0];
  const approved = status === 'approved';
  const warrantyDocumentUrl = approved ? `semco-warranty://${projectId}/${existing?.id ?? 'new'}` : existing?.warrantyDocumentUrl ?? null;

  if (existing) {
    await db
      .update(warrantyReviews)
      .set({
        status,
        reviewerName: 'Semco Admin',
        reviewerSignatureUrl: approved ? 'semco-canada-signature' : existing.reviewerSignatureUrl,
        warrantyDocumentUrl,
        effectiveDate: approved ? new Date().toISOString().slice(0, 10) : existing.effectiveDate,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(warrantyReviews.id, existing.id));
  } else {
    const reviewId = `warranty-${Date.now()}`;
    await db.insert(warrantyReviews).values({
      id: reviewId,
      projectId,
      installerId: project.installerId,
      status,
      productsSummary: null,
      effectiveDate: approved ? new Date().toISOString().slice(0, 10) : null,
      reviewerName: 'Semco Admin',
      reviewerSignatureUrl: approved ? 'semco-canada-signature' : null,
      warrantyDocumentUrl: approved ? `semco-warranty://${projectId}/${reviewId}` : null,
      notes: null,
      createdAt: now,
      updatedAt: now,
      reviewedAt: now,
    });
  }

  await db
    .update(projects)
    .set({ warrantyIssued: approved, updatedAt: now })
    .where(eq(projects.id, projectId));

  if (approved) {
    await upsertProjectReviewReward(project, now);
  }
}

export async function setOrderStatus(orderId: string, status: OrderRequestStatus): Promise<void> {
  const now = new Date().toISOString();
  await db.update(orderRequests).set({ status, updatedAt: now }).where(eq(orderRequests.id, orderId));

  const rewardRows = await db.select().from(rewardCredits).where(eq(rewardCredits.sourceId, orderId));
  await Promise.all(rewardRows.map((credit) => (
    db
      .update(rewardCredits)
      .set({
        status: status === 'approved' ? 'verified' : 'pending',
        verifiedAt: status === 'approved' ? now : null,
      })
      .where(eq(rewardCredits.id, credit.id))
  )));
}

export async function setReceiptReviewStatus(
  receiptId: string,
  status: Extract<RewardCreditStatus, 'verified' | 'rejected'>,
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .update(purchaseReceipts)
    .set({ status, reviewedAt: now, updatedAt: now })
    .where(eq(purchaseReceipts.id, receiptId));
  await setCreditsBySourceStatus(receiptId, status, now);
}

export async function setRewardCreditStatus(
  creditId: string,
  status: RewardCreditStatus,
): Promise<void> {
  await db
    .update(rewardCredits)
    .set({ status, verifiedAt: status === 'verified' ? new Date().toISOString() : null })
    .where(eq(rewardCredits.id, creditId));
}

async function setCreditsBySourceStatus(sourceId: string, status: RewardCreditStatus, now: string) {
  const rows = await db.select().from(rewardCredits).where(eq(rewardCredits.sourceId, sourceId));
  await Promise.all(rows.map((credit) => (
    db
      .update(rewardCredits)
      .set({ status, verifiedAt: status === 'verified' ? now : null })
      .where(eq(rewardCredits.id, credit.id))
  )));
}

async function upsertProjectReviewReward(project: Project, now: string) {
  const sqft = project.totalAreaSqm ? sqmToSqft(project.totalAreaSqm) : 0;
  if (!Number.isFinite(sqft) || sqft <= 0) return;

  const sourceId = `warranty-${project.id}`;
  const rows = await db.select().from(rewardCredits).where(eq(rewardCredits.sourceId, sourceId)).limit(1);

  if (rows[0]) {
    await db
      .update(rewardCredits)
      .set({
        sqft,
        status: 'verified',
        verifiedAt: now,
        notes: 'Warranty project review approved by Semco.',
      })
      .where(eq(rewardCredits.id, rows[0].id));
    return;
  }

  await db.insert(rewardCredits).values({
    id: `reward-${Date.now()}`,
    installerId: project.installerId,
    projectId: project.id,
    sourceType: 'project_review',
    sourceId,
    sqft,
    status: 'verified',
    notes: 'Warranty project review approved by Semco.',
    createdAt: now,
    verifiedAt: now,
  });
}

function groupBy<T>(rows: T[], key: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  rows.forEach((row) => {
    const id = key(row);
    if (!id) return;
    const list = map.get(id) ?? [];
    list.push(row);
    map.set(id, list);
  });
  return map;
}

function latestBy<T>(rows: T[], key: (row: T) => string): Map<string, T> {
  const map = new Map<string, T>();
  rows.forEach((row) => {
    const id = key(row);
    if (id && !map.has(id)) map.set(id, row);
  });
  return map;
}

function sumCreditSqft(rows: RewardCredit[], status: RewardCreditStatus): number {
  return rows
    .filter((credit) => credit.status === status)
    .reduce((sum, credit) => sum + (credit.sqft ?? 0), 0);
}

function getWarrantyPriority(review: WarrantyReview | null, photoStatus: WarrantyPhotoStatus): number {
  if (review?.status === 'in_review') return 5;
  if (photoStatus.isQualified && !review) return 4;
  if (review?.status === 'needs_revision') return 3;
  if (!photoStatus.isQualified) return 2;
  if (review?.status === 'approved') return 1;
  return 0;
}

function isCalculationResult(value: unknown): value is CalculationResult {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as CalculationResult).layers));
}
