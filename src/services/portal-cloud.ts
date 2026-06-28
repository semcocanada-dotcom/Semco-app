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
  ] = await Promise.all([
    selectAll('installer_profiles', 'updated_at'),
    selectAll('projects', 'updated_at'),
    selectAll('order_requests', 'updated_at'),
    selectAll('project_photos', 'taken_at'),
    selectAll('project_signoffs', 'updated_at'),
    selectAll('purchase_receipts', 'updated_at'),
    selectAll('reward_credits', 'created_at'),
    selectAll('warranty_reviews', 'updated_at'),
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
  };
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
