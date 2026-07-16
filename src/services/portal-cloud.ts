import { supabase } from '@/services/supabase';
import { resolveDealerContext } from '@/constants/dealers';

export type PortalRole = 'semco_admin' | 'dealer_admin';

export type PortalProfile = {
  userId: string;
  email: string;
  role: PortalRole;
  dealerId: string | null;
  displayName: string;
};

export type PortalRecord = Record<string, any>;

export type PortalData = {
  profile: PortalProfile;
  installers: PortalRecord[];
  projects: PortalRecord[];
  orders: PortalRecord[];
  photos: PortalRecord[];
  signoffs: PortalRecord[];
  receipts: PortalRecord[];
  rewards: PortalRecord[];
  warranty: PortalRecord[];
  deletions: PortalRecord[];
};

const SEMCO_ADMIN_EMAILS = new Set(['semcocanada@gmail.com']);

export async function getPortalSessionProfile(): Promise<PortalProfile | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data: adminRows } = await supabase
    .from('admin_profiles')
    .select('user_id, role, dealer_id, display_name')
    .eq('user_id', user.id)
    .limit(1);

  const adminProfile = adminRows?.[0];
  const email = user.email?.trim().toLowerCase() ?? '';
  const fallbackSemcoAdmin = SEMCO_ADMIN_EMAILS.has(email);
  const role = (adminProfile?.role === 'dealer_admin' || adminProfile?.role === 'semco_admin')
    ? adminProfile.role
    : fallbackSemcoAdmin ? 'semco_admin' : null;

  if (!role) return null;

  return {
    userId: user.id,
    email,
    role,
    dealerId: adminProfile?.dealer_id ?? null,
    displayName: adminProfile?.display_name ?? user.user_metadata?.name ?? email,
  };
}

export async function signInPortal(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  return error?.message ?? null;
}

export async function signOutPortal() {
  await supabase.auth.signOut();
}

export async function getPortalData(profile: PortalProfile): Promise<PortalData> {
  const [
    installers,
    projects,
    orders,
    photos,
    signoffs,
    receipts,
    rewards,
    warranty,
    deletions,
  ] = await Promise.all([
    selectAll('installer_profiles', 'updated_at'),
    selectAll('projects', 'updated_at'),
    selectAll('order_requests', 'updated_at'),
    selectAll('project_photos', 'taken_at'),
    selectAll('project_signoffs', 'updated_at'),
    selectAll('purchase_receipts', 'updated_at'),
    selectAll('reward_credits', 'created_at'),
    selectAll('warranty_reviews', 'updated_at'),
    selectAll('account_deletion_requests', 'requested_at'),
  ]);

  return {
    profile,
    installers,
    projects,
    orders,
    photos,
    signoffs,
    receipts,
    rewards,
    warranty,
    deletions,
  };
}

export async function reviewOrderRequest(id: string, status: 'needs_revision' | 'approved') {
  const now = new Date().toISOString();
  const { error } = await supabase.from('order_requests').update({
    status,
    dealer_submitted_at: status === 'approved' ? now : null,
    updated_at: now,
  }).eq('id', id);
  if (error) throw error;
  if (status === 'approved') {
    const { error: rewardError } = await supabase.from('reward_credits').update({
      status: 'verified',
      verified_at: now,
    }).eq('source_type', 'order_request').eq('source_id', id);
    if (rewardError) console.warn('[portal-cloud] order approved; reward verification requires Semco admin', rewardError);
  }
}

export async function reviewWarranty(id: string, projectId: string, status: 'needs_revision' | 'approved' | 'rejected', reviewerName: string) {
  const now = new Date().toISOString();
  const { data: existing, error: fetchError } = await supabase
    .from('warranty_reviews')
    .select('warranty_document_url')
    .eq('id', id)
    .maybeSingle();
  if (fetchError) throw fetchError;
  const hasIssuedDocument = status === 'approved' && Boolean(existing?.warranty_document_url);
  const { error } = await supabase.from('warranty_reviews').update({
    status,
    reviewer_name: reviewerName,
    effective_date: status === 'approved' ? now.slice(0, 10) : null,
    reviewed_at: now,
    updated_at: now,
  }).eq('id', id);
  if (error) throw error;
  const { error: projectError } = await supabase.from('projects').update({
    warranty_issued: hasIssuedDocument,
    updated_at: now,
  }).eq('id', projectId);
  if (projectError) throw projectError;
}

export async function issueWarrantyDocument(input: {
  reviewId: string;
  projectId: string;
  installerId: string;
  reviewerName: string;
  fileUri: string;
}) {
  const fileResponse = await fetch(input.fileUri);
  if (!fileResponse.ok) throw new Error('The selected warranty PDF could not be read.');
  const fileBytes = new Uint8Array(await fileResponse.arrayBuffer());
  const storagePath = `${input.installerId}/${input.projectId}/${input.reviewId}/issued-warranty.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('warranty-documents')
    .upload(storagePath, fileBytes, {
      contentType: 'application/pdf',
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const now = new Date().toISOString();
  const { error: reviewError } = await supabase.from('warranty_reviews').update({
    status: 'approved',
    reviewer_name: input.reviewerName,
    effective_date: now.slice(0, 10),
    reviewed_at: now,
    warranty_document_url: storagePath,
    updated_at: now,
  }).eq('id', input.reviewId);
  if (reviewError) throw reviewError;

  const { error: projectError } = await supabase.from('projects').update({
    warranty_issued: true,
    updated_at: now,
  }).eq('id', input.projectId);
  if (projectError) throw projectError;
}

export async function reviewReceipt(id: string, status: 'verified' | 'rejected') {
  const now = new Date().toISOString();
  const { error } = await supabase.from('purchase_receipts').update({ status, reviewed_at: now, updated_at: now }).eq('id', id);
  if (error) throw error;
  const { error: rewardError } = await supabase.from('reward_credits').update({
    status,
    verified_at: status === 'verified' ? now : null,
  }).eq('source_type', 'receipt').eq('source_id', id);
  if (rewardError) throw rewardError;
}

export async function completeDeletionRequest(id: string) {
  const { error } = await supabase.from('account_deletion_requests').update({
    status: 'processing',
  }).eq('id', id);
  if (error) throw error;
}

async function selectAll(table: string, orderColumn: string): Promise<PortalRecord[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order(orderColumn, { ascending: false })
    .limit(200);

  if (error) {
    console.error(`[portal-cloud] ${table} query failed`, error);
    return [];
  }
  return data ?? [];
}

export function getInstallerName(row: PortalRecord | undefined) {
  return row?.company_name || row?.contact_name || row?.email || 'Installer profile pending';
}

export function getProjectName(row: PortalRecord | undefined) {
  return row?.client_name || row?.site_address || 'Project';
}

export function getDealerLabel(installer: PortalRecord | undefined) {
  const dealer = resolveDealerContext({
    companyPostalCode: installer?.postal_code,
    companyProvince: installer?.province,
    companyAddress: installer?.company_address,
  });
  return dealer.dealerName;
}
