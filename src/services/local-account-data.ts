import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { eq, inArray, or } from 'drizzle-orm';
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

async function clearInstallerRows(installerId: string) {
  const ownedProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.installerId, installerId));
  const projectIds = ownedProjects.map((project) => project.id);

  if (projectIds.length > 0) {
    await db.delete(orderRequests).where(inArray(orderRequests.projectId, projectIds));
    await db.delete(batchLogs).where(inArray(batchLogs.projectId, projectIds));
    await db.delete(calculations).where(or(
      eq(calculations.installerId, installerId),
      inArray(calculations.projectId, projectIds),
    ));
  } else {
    await db.delete(calculations).where(eq(calculations.installerId, installerId));
  }

  await db.delete(projectSignoffs).where(eq(projectSignoffs.installerId, installerId));
  await db.delete(warrantyReviews).where(eq(warrantyReviews.installerId, installerId));
  await db.delete(purchaseReceipts).where(eq(purchaseReceipts.installerId, installerId));
  await db.delete(rewardCredits).where(eq(rewardCredits.installerId, installerId));
  await db.delete(projects_photos).where(eq(projects_photos.installerId, installerId));
  await db.delete(conversations).where(eq(conversations.installerId, installerId));
  await db.delete(projects).where(eq(projects.installerId, installerId));
  await db.delete(colors).where(eq(colors.installerId, installerId));
  await db.delete(installerProfiles).where(eq(installerProfiles.installerId, installerId));
}

async function clearPrivateFiles() {
  if (!FileSystem.documentDirectory) return;

  await Promise.all([
    FileSystem.deleteAsync(`${FileSystem.documentDirectory}semco-project-photos/`, { idempotent: true }),
    FileSystem.deleteAsync(`${FileSystem.documentDirectory}semco-signoffs/`, { idempotent: true }),
  ]);
}

/**
 * Removes account-scoped records, private files, cached guide content, and
 * any persisted session data from this installation. Shared product and
 * standard-colour reference data remain available for the next sign-in.
 */
export async function clearLocalAccountData(installerId: string): Promise<void> {
  const failures: unknown[] = [];

  try {
    await clearInstallerRows(installerId);
  } catch (error) {
    failures.push(error);
  }

  try {
    await clearPrivateFiles();
  } catch (error) {
    failures.push(error);
  }

  try {
    await AsyncStorage.clear();
  } catch (error) {
    failures.push(error);
  }

  if (failures.length > 0) {
    console.error('[account] local account cleanup was incomplete', failures);
    throw new Error('Some local account data could not be removed.');
  }
}
