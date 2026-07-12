import { eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { installerProfiles, rewardCredits } from '@/database/schema/installers';
import type { InstallerProfile, NewInstallerProfile } from '@/database/schema/installers';
import { resolveDealerContext } from '@/constants/dealers';
import { createLocalId } from '@/utils/id';

export const LOCAL_INSTALLER_ID = 'local';

export async function getInstallerProfile(installerId = LOCAL_INSTALLER_ID): Promise<InstallerProfile | null> {
  const rows = await db
    .select()
    .from(installerProfiles)
    .where(eq(installerProfiles.installerId, installerId))
    .limit(1);

  return rows[0] ?? null;
}

export async function upsertInstallerProfile(
  installerId: string,
  values: Partial<Omit<NewInstallerProfile, 'id' | 'installerId' | 'createdAt' | 'updatedAt'>>,
): Promise<InstallerProfile> {
  const existing = await getInstallerProfile(installerId);
  const now = new Date().toISOString();
  const dealer = resolveDealerContext({
    companyPostalCode: values.postalCode,
    companyProvince: values.province,
    companyAddress: values.companyAddress,
  });

  if (existing) {
    await db
      .update(installerProfiles)
      .set({
        ...values,
        assignedDealerId: dealer.dealerId,
        updatedAt: now,
      })
      .where(eq(installerProfiles.id, existing.id));

    return {
      ...existing,
      ...values,
      assignedDealerId: dealer.dealerId,
      updatedAt: now,
    };
  }

  const created: NewInstallerProfile = {
    id: createLocalId('profile'),
    installerId,
    companyName: values.companyName ?? null,
    contactName: values.contactName ?? null,
    email: values.email ?? null,
    phone: values.phone ?? null,
    companyAddress: values.companyAddress ?? null,
    city: values.city ?? null,
    province: values.province ?? null,
    postalCode: values.postalCode ?? null,
    semcoAccountId: values.semcoAccountId ?? null,
    certificationStatus: values.certificationStatus ?? 'pending',
    assignedDealerId: dealer.dealerId,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(installerProfiles).values(created);
  return created as InstallerProfile;
}

export async function getVerifiedRewardSqft(installerId = LOCAL_INSTALLER_ID): Promise<number> {
  const rows = await db
    .select()
    .from(rewardCredits)
    .where(eq(rewardCredits.installerId, installerId));

  return rows
    .filter((credit) => credit.status === 'verified')
    .reduce((sum, credit) => sum + (credit.sqft ?? 0), 0);
}

export function profileToDealerInput(profile?: InstallerProfile | null) {
  return {
    companyPostalCode: profile?.postalCode,
    companyProvince: profile?.province,
    companyAddress: profile?.companyAddress,
  };
}
