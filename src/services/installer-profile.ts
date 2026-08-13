import { eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { installerProfiles } from '@/database/schema/installers';
import type { InstallerProfile, NewInstallerProfile } from '@/database/schema/installers';
import { normalizeCanadianProvince, resolveDealerContext } from '@/constants/dealers';
import { createLocalId } from '@/utils/id';
import { syncInstallerProfileToCloud } from '@/services/cloud-sync';
import { supabase } from '@/services/supabase';

export const LOCAL_INSTALLER_ID = 'local';

export async function getInstallerProfile(installerId = LOCAL_INSTALLER_ID): Promise<InstallerProfile | null> {
  const rows = await db
    .select()
    .from(installerProfiles)
    .where(eq(installerProfiles.installerId, installerId))
    .limit(1);

  const local = rows[0] ?? null;
  if (installerId === LOCAL_INSTALLER_ID) return local;

  try {
    const { data: cloud, error } = await supabase
      .from('installer_profiles')
      .select('*')
      .eq('installer_id', installerId)
      .maybeSingle();
    if (error) throw error;
    if (!cloud) return local;

    const cloudProfile: InstallerProfile = {
      id: local?.id ?? createLocalId('profile'),
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
      createdAt: typeof cloud.created_at === 'string' ? cloud.created_at : new Date().toISOString(),
      updatedAt: typeof cloud.updated_at === 'string' ? cloud.updated_at : new Date().toISOString(),
    };
    if (!local) return cloudProfile;

    const localIsNewer = Date.parse(local.updatedAt) > Date.parse(cloudProfile.updatedAt);
    const newer = localIsNewer ? local : cloudProfile;
    const older = localIsNewer ? cloudProfile : local;
    return {
      ...newer,
      companyName: newer.companyName || older.companyName,
      contactName: newer.contactName || older.contactName,
      email: newer.email || older.email,
      phone: newer.phone || older.phone,
      companyAddress: newer.companyAddress || older.companyAddress,
      city: newer.city || older.city,
      province: newer.province || older.province,
      postalCode: newer.postalCode || older.postalCode,
      semcoAccountId: newer.semcoAccountId || older.semcoAccountId,
      assignedDealerId: cloudProfile.assignedDealerId ?? local.assignedDealerId,
      certificationStatus: cloudProfile.certificationStatus,
    };
  } catch (error) {
    console.error('[profile] cloud lookup failed; using offline profile', error);
    return local;
  }
}

export async function upsertInstallerProfile(
  installerId: string,
  values: Partial<Omit<NewInstallerProfile, 'id' | 'installerId' | 'createdAt' | 'updatedAt'>>,
): Promise<InstallerProfile> {
  const existing = await getInstallerProfile(installerId);
  const now = new Date().toISOString();
  const normalizedValues = normalizeProfileValues(values);
  const dealer = resolveDealerContext({
    companyPostalCode: normalizedValues.postalCode === undefined ? existing?.postalCode : normalizedValues.postalCode,
    companyProvince: normalizedValues.province === undefined ? existing?.province : normalizedValues.province,
    companyAddress: normalizedValues.companyAddress === undefined ? existing?.companyAddress : normalizedValues.companyAddress,
  });

  if (existing) {
    await db
      .update(installerProfiles)
      .set({
        ...normalizedValues,
        assignedDealerId: dealer.dealerId,
        updatedAt: now,
      })
      .where(eq(installerProfiles.id, existing.id));

    const updated = {
      ...existing,
      ...normalizedValues,
      assignedDealerId: dealer.dealerId,
      updatedAt: now,
    };
    const cloudResult = await syncInstallerProfileToCloud(updated as InstallerProfile);
    if (!cloudResult.ok) {
      throw new Error(cloudResult.error ?? 'Profile saved on this device, but cloud sync is still pending.');
    }
    return updated as InstallerProfile;
  }

  const created: NewInstallerProfile = {
    id: createLocalId('profile'),
    installerId,
    companyName: normalizedValues.companyName ?? null,
    contactName: normalizedValues.contactName ?? null,
    email: normalizedValues.email ?? null,
    phone: normalizedValues.phone ?? null,
    companyAddress: normalizedValues.companyAddress ?? null,
    city: normalizedValues.city ?? null,
    province: normalizedValues.province ?? null,
    postalCode: normalizedValues.postalCode ?? null,
    semcoAccountId: normalizedValues.semcoAccountId ?? null,
    certificationStatus: normalizedValues.certificationStatus ?? 'pending',
    assignedDealerId: dealer.dealerId,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(installerProfiles).values(created);
  const cloudResult = await syncInstallerProfileToCloud(created as InstallerProfile);
  if (!cloudResult.ok) {
    throw new Error(cloudResult.error ?? 'Profile saved on this device, but cloud sync is still pending.');
  }
  return created as InstallerProfile;
}

export function profileToDealerInput(profile?: InstallerProfile | null) {
  return {
    companyPostalCode: profile?.postalCode,
    companyProvince: profile?.province,
    companyAddress: profile?.companyAddress,
  };
}

function normalizeProfileValues(
  values: Partial<Omit<NewInstallerProfile, 'id' | 'installerId' | 'createdAt' | 'updatedAt'>>,
) {
  if (values.province === undefined) return values;

  const trimmedProvince = values.province?.trim() ?? '';
  return {
    ...values,
    province: normalizeCanadianProvince(trimmedProvince) ?? (trimmedProvince || null),
  };
}
