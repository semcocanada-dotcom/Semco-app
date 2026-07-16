import { desc, eq } from 'drizzle-orm';
import { Platform } from 'react-native';
import { db } from '@/database/client';
import {
  batchLogs,
  calculations,
  colors,
  conversations,
  installerProfiles,
  orderRequests,
  projects,
  projects_photos,
  projectSignoffs,
  purchaseReceipts,
  rewardCredits,
  warrantyReviews,
} from '@/database/schema';
import type { BatchLog, Calculation, Color, Conversation, InstallerProfile, OrderRequest, Project, ProjectPhoto, ProjectSignoff, PurchaseReceipt, RewardCredit, WarrantyReview } from '@/database/schema';
import { claimPreviewRecords } from '@/database/cloud-migrations';
import { resolveDealerContext } from '@/constants/dealers';
import { createLocalId } from '@/utils/id';
import { uploadPrivatePhoto } from '@/services/camera';
import { createPrivateFileUrl } from '@/services/private-storage';
import { supabase } from '@/services/supabase';

type CloudResult = { ok: boolean; error?: string };

function toIso(value: unknown) {
  return typeof value === 'string' && value ? value : new Date().toISOString();
}

function isCloudNewer(cloudValue: unknown, localValue: unknown) {
  const cloudTime = Date.parse(String(cloudValue ?? ''));
  const localTime = Date.parse(String(localValue ?? ''));
  return Number.isFinite(cloudTime) && (!Number.isFinite(localTime) || cloudTime > localTime);
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return (value as T) ?? fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

async function cloudUpsert(table: string, row: Record<string, unknown>, onConflict = 'id'): Promise<CloudResult> {
  const { error } = await supabase.from(table).upsert(row, { onConflict });
  if (error) {
    console.error(`[cloud-sync] ${table} upsert failed`, error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function syncInstallerProfileToCloud(profile: InstallerProfile): Promise<CloudResult> {
  return cloudUpsert('installer_profiles', {
    installer_id: profile.installerId,
    company_name: profile.companyName,
    contact_name: profile.contactName,
    email: profile.email,
    phone: profile.phone,
    company_address: profile.companyAddress,
    city: profile.city,
    province: profile.province,
    postal_code: profile.postalCode,
    semco_account_id: profile.semcoAccountId,
    updated_at: profile.updatedAt,
  }, 'installer_id');
}

export async function syncProjectToCloud(project: Project): Promise<CloudResult> {
  return cloudUpsert('projects', {
    id: project.id,
    installer_id: project.installerId,
    client_name: project.clientName,
    client_email: project.clientEmail,
    client_phone: project.clientPhone,
    site_address: project.siteAddress,
    substrate_type: project.substrateType,
    total_area_sqm: project.totalAreaSqm,
    selected_color_id: null,
    selected_color_ref: project.selectedColorId,
    finish_type: project.finishType,
    sealer_product_id: null,
    sealer_product_ref: project.sealerProductId,
    status: project.status,
    warranty_issued: project.warrantyIssued,
    completion_date: project.completionDate,
    notes: project.notes,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  });
}

export async function fetchInstallerProjectsFromCloud(installerId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('installer_id', installerId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((cloud) => ({
    id: cloud.id,
    installerId,
    clientName: cloud.client_name,
    clientEmail: cloud.client_email,
    clientPhone: cloud.client_phone,
    siteAddress: cloud.site_address,
    substrateType: cloud.substrate_type,
    totalAreaSqm: cloud.total_area_sqm == null ? null : Number(cloud.total_area_sqm),
    selectedColorId: cloud.selected_color_ref,
    finishType: cloud.finish_type,
    sealerProductId: cloud.sealer_product_ref,
    status: cloud.status ?? 'active',
    warrantyIssued: Boolean(cloud.warranty_issued),
    completionDate: cloud.completion_date,
    notes: cloud.notes,
    createdAt: toIso(cloud.created_at),
    updatedAt: toIso(cloud.updated_at),
  }));
}

export async function hydrateProjectFromCloud(projectId: string, installerId: string): Promise<Project | null> {
  const { data: cloud, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('installer_id', installerId)
    .maybeSingle();

  if (error) {
    console.error('[cloud-sync] project hydration failed', error);
    return null;
  }
  if (!cloud) return null;

  const values = {
    installerId,
    clientName: cloud.client_name,
    clientEmail: cloud.client_email,
    clientPhone: cloud.client_phone,
    siteAddress: cloud.site_address,
    substrateType: cloud.substrate_type,
    totalAreaSqm: cloud.total_area_sqm == null ? null : Number(cloud.total_area_sqm),
    selectedColorId: cloud.selected_color_ref,
    finishType: cloud.finish_type,
    sealerProductId: cloud.sealer_product_ref,
    status: cloud.status ?? 'active',
    warrantyIssued: Boolean(cloud.warranty_issued),
    completionDate: cloud.completion_date,
    notes: cloud.notes,
    createdAt: toIso(cloud.created_at),
    updatedAt: toIso(cloud.updated_at),
  };
  const local = (await db.select().from(projects).where(eq(projects.id, projectId)).limit(1))[0];
  if (local) await db.update(projects).set(values).where(eq(projects.id, projectId));
  else await db.insert(projects).values({ id: projectId, ...values });

  return { id: projectId, ...values } as Project;
}

export type ProjectCloudWorkspace = {
  photos: ProjectPhoto[];
  batches: BatchLog[];
  calculation: Calculation | null;
  orderRequest: OrderRequest | null;
  warrantyReview: WarrantyReview | null;
  signoffs: ProjectSignoff[];
};

export async function fetchProjectWorkspaceFromCloud(
  projectId: string,
  installerId: string,
): Promise<ProjectCloudWorkspace> {
  const [photoResult, batchResult, calculationResult, orderResult, warrantyResult, signoffResult] = await Promise.all([
    supabase.from('project_photos').select('*').eq('project_id', projectId).order('taken_at', { ascending: false }),
    supabase.from('batch_logs').select('*').eq('project_id', projectId).order('applied_at', { ascending: false }),
    supabase.from('calculations').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(1),
    supabase.from('order_requests').select('*').eq('project_id', projectId).order('updated_at', { ascending: false }).limit(1),
    supabase.from('warranty_reviews').select('*').eq('project_id', projectId).order('updated_at', { ascending: false }).limit(1),
    supabase.from('project_signoffs').select('*').eq('project_id', projectId).order('updated_at', { ascending: false }),
  ]);

  for (const result of [photoResult, batchResult, calculationResult, orderResult, warrantyResult, signoffResult]) {
    if (result.error) throw result.error;
  }

  const photos = await Promise.all((photoResult.data ?? []).map(async (cloud) => ({
    id: cloud.id,
    projectId: cloud.project_id,
    installerId,
    stage: cloud.stage,
    photoUrl: (await createPrivateFileUrl('project-photos', cloud.photo_url)) ?? cloud.photo_url,
    storagePath: cloud.photo_url,
    caption: cloud.caption,
    takenAt: toIso(cloud.taken_at),
  } as ProjectPhoto)));

  const batches = (batchResult.data ?? []).map((cloud) => ({
    id: cloud.id,
    projectId: cloud.project_id,
    productId: cloud.product_ref ?? cloud.product_id,
    batchNumber: cloud.batch_number,
    quantityKg: cloud.quantity_kg == null ? null : Number(cloud.quantity_kg),
    coverageAchievedSqm: cloud.coverage_achieved_sqm == null ? null : Number(cloud.coverage_achieved_sqm),
    appliedAt: toIso(cloud.applied_at),
    notes: cloud.notes,
  } as BatchLog));

  const calculationCloud = calculationResult.data?.[0];
  const calculation = calculationCloud ? {
    id: calculationCloud.id,
    projectId: calculationCloud.project_id,
    installerId,
    areaSqm: Number(calculationCloud.area_sqm),
    substrateType: calculationCloud.substrate_type,
    wastePct: Number(calculationCloud.waste_pct ?? 10),
    result: calculationCloud.result,
    createdAt: toIso(calculationCloud.created_at),
  } as Calculation : null;

  const orderCloud = orderResult.data?.[0];
  const orderRequest = orderCloud ? {
    id: orderCloud.id,
    projectId: orderCloud.project_id,
    calculationId: orderCloud.calculation_id,
    status: orderCloud.status,
    notes: orderCloud.notes,
    createdAt: toIso(orderCloud.created_at),
    updatedAt: toIso(orderCloud.updated_at),
  } as OrderRequest : null;

  const warrantyCloud = warrantyResult.data?.[0];
  const warrantyReview = warrantyCloud ? {
    id: warrantyCloud.id,
    projectId: warrantyCloud.project_id,
    installerId,
    status: warrantyCloud.status,
    productsSummary: warrantyCloud.products_summary,
    effectiveDate: warrantyCloud.effective_date,
    reviewerName: warrantyCloud.reviewer_name,
    reviewerSignatureUrl: warrantyCloud.reviewer_signature_url,
    warrantyDocumentUrl: warrantyCloud.warranty_document_url,
    notes: warrantyCloud.notes,
    createdAt: toIso(warrantyCloud.created_at),
    updatedAt: toIso(warrantyCloud.updated_at),
    reviewedAt: warrantyCloud.reviewed_at,
  } as WarrantyReview : null;

  const signoffs = (signoffResult.data ?? []).map((cloud) => {
    const formData = { ...(cloud.form_data ?? {}), ...(cloud.pdf_url ? { cloudPdfUrl: cloud.pdf_url } : {}) };
    return {
      id: cloud.id,
      projectId: cloud.project_id,
      installerId,
      type: cloud.type,
      status: cloud.status,
      title: cloud.title,
      customerName: cloud.customer_name,
      customerEmail: cloud.customer_email,
      summary: cloud.summary,
      notes: cloud.notes,
      formData: JSON.stringify(formData),
      signatureData: cloud.signature_data,
      signedAt: cloud.signed_at,
      createdAt: toIso(cloud.created_at),
      updatedAt: toIso(cloud.updated_at),
    } as ProjectSignoff;
  });

  return { photos, batches, calculation, orderRequest, warrantyReview, signoffs };
}

export async function syncProjectPhotoToCloud(photo: ProjectPhoto): Promise<CloudResult> {
  let storagePath = photo.storagePath;
  if (!storagePath && !/^https?:\/\//i.test(photo.photoUrl)) {
    storagePath = `${photo.installerId}/${photo.projectId}/${photo.stage}/${photo.id}.jpg`;
    const uploaded = await uploadPrivatePhoto(photo.photoUrl, 'project-photos', storagePath);
    if (!uploaded) return { ok: false, error: 'Photo upload failed' };
    await db.update(projects_photos).set({ storagePath }).where(eq(projects_photos.id, photo.id));
  }
  if (!storagePath) return { ok: false, error: 'Photo storage path is unavailable' };
  return cloudUpsert('project_photos', {
    id: photo.id,
    project_id: photo.projectId,
    installer_id: photo.installerId,
    stage: photo.stage,
    photo_url: storagePath,
    caption: photo.caption,
    taken_at: photo.takenAt,
  });
}

export async function syncCalculationToCloud(calculation: Calculation): Promise<CloudResult> {
  return cloudUpsert('calculations', {
    id: calculation.id,
    project_id: calculation.projectId,
    installer_id: calculation.installerId,
    area_sqm: calculation.areaSqm,
    substrate_type: calculation.substrateType,
    waste_pct: calculation.wastePct,
    result: calculation.result,
    created_at: calculation.createdAt,
  });
}

export async function syncOrderRequestToCloud(order: OrderRequest, installerId: string, dealerId?: string | null): Promise<CloudResult> {
  return cloudUpsert('order_requests', {
    id: order.id,
    project_id: order.projectId,
    calculation_id: order.calculationId,
    status: order.status,
    dealer_id: dealerId ?? null,
    notes: order.notes,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  });
}

export async function syncWarrantyReviewToCloud(review: WarrantyReview): Promise<CloudResult> {
  return cloudUpsert('warranty_reviews', {
    id: review.id,
    project_id: review.projectId,
    installer_id: review.installerId,
    status: review.status,
    products_summary: review.productsSummary,
    effective_date: review.effectiveDate,
    notes: review.notes,
    created_at: review.createdAt,
    updated_at: review.updatedAt,
  });
}

export async function syncPurchaseReceiptToCloud(receipt: PurchaseReceipt): Promise<CloudResult> {
  return cloudUpsert('purchase_receipts', {
    id: receipt.id,
    installer_id: receipt.installerId,
    project_id: receipt.projectId,
    dealer_name: receipt.dealerName,
    receipt_number: receipt.receiptNumber,
    receipt_url: receipt.receiptUrl,
    sqft_claimed: receipt.sqftClaimed,
    status: receipt.status,
    notes: receipt.notes,
    created_at: receipt.createdAt,
    updated_at: receipt.updatedAt,
  });
}

export async function syncRewardCreditToCloud(credit: RewardCredit): Promise<CloudResult> {
  return cloudUpsert('reward_credits', {
    id: credit.id,
    installer_id: credit.installerId,
    project_id: credit.projectId,
    source_type: credit.sourceType,
    source_id: credit.sourceId,
    sqft: credit.sqft,
    status: credit.status,
    notes: credit.notes,
    created_at: credit.createdAt,
  });
}

export async function syncConversationToCloud(conversation: Conversation): Promise<CloudResult> {
  return cloudUpsert('conversations', {
    id: conversation.id,
    installer_id: conversation.installerId,
    title: conversation.title,
    messages: conversation.messages,
    created_at: conversation.createdAt,
    updated_at: conversation.updatedAt,
  });
}

export async function syncBatchLogToCloud(batch: BatchLog): Promise<CloudResult> {
  return cloudUpsert('batch_logs', {
    id: batch.id,
    project_id: batch.projectId,
    product_id: null,
    product_ref: batch.productId,
    batch_number: batch.batchNumber,
    quantity_kg: batch.quantityKg,
    coverage_achieved_sqm: batch.coverageAchievedSqm,
    applied_at: batch.appliedAt,
    notes: batch.notes,
  });
}

export async function syncCustomColorToCloud(color: Color): Promise<CloudResult> {
  return cloudUpsert('colors', {
    id: color.id,
    name: color.name,
    code: color.code,
    is_standard: false,
    installer_id: color.installerId,
    pigments: color.pigments,
    swatch_hex: color.swatchHex,
    photo_url: null,
    photo_storage_path: color.storagePath,
    notes: color.notes,
    created_at: color.createdAt,
    updated_at: color.updatedAt,
  });
}

async function syncSignoffToCloud(signoff: ProjectSignoff): Promise<CloudResult> {
  const formData = parseJson<Record<string, string>>(signoff.formData, {});
  return cloudUpsert('project_signoffs', {
    id: signoff.id,
    project_id: signoff.projectId,
    installer_id: signoff.installerId,
    type: signoff.type,
    status: signoff.status,
    title: signoff.title,
    customer_name: signoff.customerName,
    customer_email: signoff.customerEmail,
    summary: signoff.summary,
    notes: signoff.notes,
    form_data: formData,
    signature_data: signoff.signatureData,
    pdf_url: formData.cloudPdfUrl ?? null,
    signed_at: signoff.signedAt,
    created_at: signoff.createdAt,
    updated_at: signoff.updatedAt,
  });
}

export async function syncAllLocalData(installerId: string) {
  const [profileRows, projectRows, photoRows, batchRows, calculationRows, conversationRows, orderRows, warrantyRows, receiptRows, rewardRows, signoffRows, colorRows] = await Promise.all([
    db.select().from(installerProfiles).where(eq(installerProfiles.installerId, installerId)),
    db.select().from(projects).where(eq(projects.installerId, installerId)),
    db.select().from(projects_photos).where(eq(projects_photos.installerId, installerId)),
    db.select().from(batchLogs),
    db.select().from(calculations).where(eq(calculations.installerId, installerId)),
    db.select().from(conversations).where(eq(conversations.installerId, installerId)),
    db.select().from(orderRequests),
    db.select().from(warrantyReviews).where(eq(warrantyReviews.installerId, installerId)),
    db.select().from(purchaseReceipts).where(eq(purchaseReceipts.installerId, installerId)),
    db.select().from(rewardCredits).where(eq(rewardCredits.installerId, installerId)),
    db.select().from(projectSignoffs).where(eq(projectSignoffs.installerId, installerId)),
    db.select().from(colors).where(eq(colors.installerId, installerId)),
  ]);
  const ownedProjectIds = new Set(projectRows.map((project) => project.id));
  const ownedBatches = batchRows.filter((batch) => ownedProjectIds.has(batch.projectId));
  const ownedOrders = orderRows.filter((order) => ownedProjectIds.has(order.projectId));
  const profile = profileRows[0];
  const dealer = resolveDealerContext({
    companyPostalCode: profile?.postalCode,
    companyProvince: profile?.province,
    companyAddress: profile?.companyAddress,
  });

  for (const row of profileRows) await syncInstallerProfileToCloud(row);
  for (const row of projectRows) await syncProjectToCloud(row);
  for (const row of photoRows) await syncProjectPhotoToCloud(row);
  for (const row of ownedBatches) await syncBatchLogToCloud(row);
  for (const row of calculationRows) await syncCalculationToCloud(row);
  for (const row of conversationRows) await syncConversationToCloud(row);
  for (const row of ownedOrders) if (row.status === 'draft' || row.status === 'in_review') await syncOrderRequestToCloud(row, installerId, dealer.dealerId);
  for (const row of warrantyRows) if (row.status === 'not_submitted' || row.status === 'in_review') await syncWarrantyReviewToCloud(row);
  for (const row of receiptRows) if (row.status === 'pending') await syncPurchaseReceiptToCloud(row);
  for (const row of rewardRows) if (row.status === 'pending') await syncRewardCreditToCloud(row);
  for (const row of signoffRows) await syncSignoffToCloud(row);
  for (const row of colorRows) if (!row.isStandard) await syncCustomColorToCloud(row);
}

async function fetchCloud(table: string, installerId: string, installerColumn = 'installer_id') {
  const { data, error } = await supabase.from(table).select('*').eq(installerColumn, installerId);
  if (error) throw error;
  return data ?? [];
}

async function hydrateConversationRows(installerId: string, conversationRows: any[]) {
  const hydrated: Conversation[] = [];
  for (const cloud of conversationRows) {
    const local = (await db.select().from(conversations).where(eq(conversations.id, cloud.id)).limit(1))[0];
    const values = {
      installerId,
      title: cloud.title,
      messages: cloud.messages ?? [],
      createdAt: toIso(cloud.created_at),
      updatedAt: toIso(cloud.updated_at),
    };
    const cloudConversation: Conversation = { id: cloud.id, ...values };
    hydrated.push(local && !isCloudNewer(cloud.updated_at, local.updatedAt) ? local : cloudConversation);
    if (local && !isCloudNewer(cloud.updated_at, local.updatedAt)) continue;
    if (local) await db.update(conversations).set(values).where(eq(conversations.id, cloud.id));
    else await db.insert(conversations).values(cloudConversation);
  }
  return hydrated;
}

export async function hydrateCloudConversations(installerId: string) {
  const conversationRows = await fetchCloud('conversations', installerId);
  return hydrateConversationRows(installerId, conversationRows);
}

export async function hydrateCloudData(installerId: string) {
  const [profileRows, projectRows, photoRows, calculationRows, conversationRows, warrantyRows, receiptRows, rewardRows, signoffRows, customColorRows] = await Promise.all([
    fetchCloud('installer_profiles', installerId),
    fetchCloud('projects', installerId),
    fetchCloud('project_photos', installerId),
    fetchCloud('calculations', installerId),
    fetchCloud('conversations', installerId),
    fetchCloud('warranty_reviews', installerId),
    fetchCloud('purchase_receipts', installerId),
    fetchCloud('reward_credits', installerId),
    fetchCloud('project_signoffs', installerId),
    fetchCloud('colors', installerId),
  ]);
  if (profileRows[0]) {
    const cloud = profileRows[0];
    const local = (await db.select().from(installerProfiles).where(eq(installerProfiles.installerId, installerId)).limit(1))[0];
    if (!local || isCloudNewer(cloud.updated_at, local.updatedAt)) {
      const values = {
        installerId,
        companyName: cloud.company_name,
        contactName: cloud.contact_name,
        email: cloud.email,
        phone: cloud.phone,
        companyAddress: cloud.company_address,
        city: cloud.city,
        province: cloud.province,
        postalCode: cloud.postal_code,
        semcoAccountId: cloud.semco_account_id,
        certificationStatus: cloud.certification_status ?? 'pending',
        assignedDealerId: cloud.assigned_dealer_id,
        createdAt: toIso(cloud.created_at),
        updatedAt: toIso(cloud.updated_at),
      };
      if (local) await db.update(installerProfiles).set(values).where(eq(installerProfiles.id, local.id));
      else await db.insert(installerProfiles).values({ id: createLocalId('profile'), ...values });
    }
  }

  for (const cloud of projectRows) {
    const local = (await db.select().from(projects).where(eq(projects.id, cloud.id)).limit(1))[0];
    if (local && !isCloudNewer(cloud.updated_at, local.updatedAt)) continue;
    const values = {
      installerId,
      clientName: cloud.client_name,
      clientEmail: cloud.client_email,
      clientPhone: cloud.client_phone,
      siteAddress: cloud.site_address,
      substrateType: cloud.substrate_type,
      totalAreaSqm: cloud.total_area_sqm == null ? null : Number(cloud.total_area_sqm),
      selectedColorId: cloud.selected_color_ref,
      finishType: cloud.finish_type,
      sealerProductId: cloud.sealer_product_ref,
      status: cloud.status ?? 'active',
      warrantyIssued: Boolean(cloud.warranty_issued),
      completionDate: cloud.completion_date,
      notes: cloud.notes,
      createdAt: toIso(cloud.created_at),
      updatedAt: toIso(cloud.updated_at),
    };
    if (local) await db.update(projects).set(values).where(eq(projects.id, cloud.id));
    else await db.insert(projects).values({ id: cloud.id, ...values });
  }

  for (const cloud of photoRows) {
    const signedUrl = await createPrivateFileUrl('project-photos', cloud.photo_url);
    const local = (await db.select().from(projects_photos).where(eq(projects_photos.id, cloud.id)).limit(1))[0];
    const values = {
      projectId: cloud.project_id,
      installerId,
      stage: cloud.stage,
      photoUrl: signedUrl ?? local?.photoUrl ?? '',
      storagePath: cloud.photo_url,
      caption: cloud.caption,
      takenAt: toIso(cloud.taken_at),
    };
    if (local) await db.update(projects_photos).set(values).where(eq(projects_photos.id, cloud.id));
    else if (signedUrl) await db.insert(projects_photos).values({ id: cloud.id, ...values });
  }

  for (const cloud of calculationRows) {
    const local = (await db.select().from(calculations).where(eq(calculations.id, cloud.id)).limit(1))[0];
    if (!local) await db.insert(calculations).values({
      id: cloud.id, projectId: cloud.project_id, installerId, areaSqm: Number(cloud.area_sqm), substrateType: cloud.substrate_type,
      wastePct: Number(cloud.waste_pct ?? 10), result: cloud.result, createdAt: toIso(cloud.created_at),
    });
  }

  await hydrateConversationRows(installerId, conversationRows);

  const projectIds = projectRows.map((row) => row.id);
  if (projectIds.length) {
    const [{ data: orderCloud, error: orderError }, { data: batchCloud, error: batchError }] = await Promise.all([
      supabase.from('order_requests').select('*').in('project_id', projectIds),
      supabase.from('batch_logs').select('*').in('project_id', projectIds),
    ]);
    if (orderError) throw orderError;
    if (batchError) throw batchError;

    for (const cloud of batchCloud ?? []) {
      const local = (await db.select().from(batchLogs).where(eq(batchLogs.id, cloud.id)).limit(1))[0];
      const values = {
        projectId: cloud.project_id,
        productId: cloud.product_ref ?? cloud.product_id,
        batchNumber: cloud.batch_number,
        quantityKg: cloud.quantity_kg == null ? null : Number(cloud.quantity_kg),
        coverageAchievedSqm: cloud.coverage_achieved_sqm == null ? null : Number(cloud.coverage_achieved_sqm),
        appliedAt: toIso(cloud.applied_at),
        notes: cloud.notes,
      };
      if (local) await db.update(batchLogs).set(values).where(eq(batchLogs.id, cloud.id));
      else await db.insert(batchLogs).values({ id: cloud.id, ...values });
    }

    for (const cloud of orderCloud ?? []) {
      const local = (await db.select().from(orderRequests).where(eq(orderRequests.id, cloud.id)).limit(1))[0];
      if (local && !isCloudNewer(cloud.updated_at, local.updatedAt)) continue;
      const values = { projectId: cloud.project_id, calculationId: cloud.calculation_id, status: cloud.status, notes: cloud.notes, createdAt: toIso(cloud.created_at), updatedAt: toIso(cloud.updated_at) };
      if (local) await db.update(orderRequests).set(values).where(eq(orderRequests.id, cloud.id));
      else await db.insert(orderRequests).values({ id: cloud.id, ...values });
    }
  }

  for (const cloud of warrantyRows) {
    const local = (await db.select().from(warrantyReviews).where(eq(warrantyReviews.id, cloud.id)).limit(1))[0];
    if (local && !isCloudNewer(cloud.updated_at, local.updatedAt)) continue;
    const values = { projectId: cloud.project_id, installerId, status: cloud.status, productsSummary: cloud.products_summary, effectiveDate: cloud.effective_date, reviewerName: cloud.reviewer_name, reviewerSignatureUrl: cloud.reviewer_signature_url, warrantyDocumentUrl: cloud.warranty_document_url, notes: cloud.notes, createdAt: toIso(cloud.created_at), updatedAt: toIso(cloud.updated_at), reviewedAt: cloud.reviewed_at };
    if (local) await db.update(warrantyReviews).set(values).where(eq(warrantyReviews.id, cloud.id));
    else await db.insert(warrantyReviews).values({ id: cloud.id, ...values });
  }

  for (const cloud of receiptRows) {
    const local = (await db.select().from(purchaseReceipts).where(eq(purchaseReceipts.id, cloud.id)).limit(1))[0];
    const values = { installerId, projectId: cloud.project_id, dealerName: cloud.dealer_name, receiptNumber: cloud.receipt_number, receiptUrl: cloud.receipt_url, sqftClaimed: Number(cloud.sqft_claimed ?? 0), status: cloud.status, notes: cloud.notes, createdAt: toIso(cloud.created_at), updatedAt: toIso(cloud.updated_at), reviewedAt: cloud.reviewed_at };
    if (local) await db.update(purchaseReceipts).set(values).where(eq(purchaseReceipts.id, cloud.id));
    else await db.insert(purchaseReceipts).values({ id: cloud.id, ...values });
  }

  for (const cloud of rewardRows) {
    const local = (await db.select().from(rewardCredits).where(eq(rewardCredits.id, cloud.id)).limit(1))[0];
    const values = { installerId, projectId: cloud.project_id, sourceType: cloud.source_type, sourceId: cloud.source_id, sqft: Number(cloud.sqft ?? 0), status: cloud.status, notes: cloud.notes, createdAt: toIso(cloud.created_at), verifiedAt: cloud.verified_at };
    if (local) await db.update(rewardCredits).set(values).where(eq(rewardCredits.id, cloud.id));
    else await db.insert(rewardCredits).values({ id: cloud.id, ...values });
  }

  for (const cloud of signoffRows) {
    const local = (await db.select().from(projectSignoffs).where(eq(projectSignoffs.id, cloud.id)).limit(1))[0];
    if (local && !isCloudNewer(cloud.updated_at, local.updatedAt)) continue;
    const formData = { ...(cloud.form_data ?? {}), ...(cloud.pdf_url ? { cloudPdfUrl: cloud.pdf_url } : {}) };
    const values = { projectId: cloud.project_id, installerId, type: cloud.type, status: cloud.status, title: cloud.title, customerName: cloud.customer_name, customerEmail: cloud.customer_email, summary: cloud.summary, notes: cloud.notes, formData: JSON.stringify(formData), signatureData: cloud.signature_data, signedAt: cloud.signed_at, createdAt: toIso(cloud.created_at), updatedAt: toIso(cloud.updated_at) };
    if (local) await db.update(projectSignoffs).set(values).where(eq(projectSignoffs.id, cloud.id));
    else await db.insert(projectSignoffs).values({ id: cloud.id, ...values });
  }

  for (const cloud of customColorRows) {
    const local = (await db.select().from(colors).where(eq(colors.id, cloud.id)).limit(1))[0];
    if (local && !isCloudNewer(cloud.updated_at, local.updatedAt)) continue;
    const signedUrl = cloud.photo_storage_path
      ? await createPrivateFileUrl('color-samples', cloud.photo_storage_path)
      : null;
    const values = {
      name: cloud.name,
      code: cloud.code,
      isStandard: false,
      installerId,
      pigments: cloud.pigments ?? [],
      swatchHex: cloud.swatch_hex,
      photoUrl: signedUrl ?? local?.photoUrl ?? null,
      storagePath: cloud.photo_storage_path,
      notes: cloud.notes,
      createdAt: toIso(cloud.created_at),
      updatedAt: toIso(cloud.updated_at),
    };
    if (local) await db.update(colors).set(values).where(eq(colors.id, cloud.id));
    else await db.insert(colors).values({ id: cloud.id, ...values });
  }
}

export async function bootstrapContractorCloud(installerId: string) {
  await claimPreviewRecords(installerId);
  await hydrateCloudData(installerId);
  if (Platform.OS !== 'web') {
    await syncAllLocalData(installerId);
  }
}

export async function getLatestLocalProfile(installerId: string) {
  return (await db.select().from(installerProfiles).where(eq(installerProfiles.installerId, installerId)).orderBy(desc(installerProfiles.updatedAt)).limit(1))[0] ?? null;
}
