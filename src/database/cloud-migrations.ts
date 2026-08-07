import { Platform } from 'react-native';
import { sqlite } from '@/database/client';
import { createLocalId, isUuid } from '@/utils/id';

type IdRow = { id: string };

async function runLocalTransaction(work: () => Promise<void>) {
  const database = sqlite as typeof sqlite & {
    withTransactionAsync?: (task: () => Promise<void>) => Promise<void>;
  };
  if (typeof database.withTransactionAsync === 'function') {
    await database.withTransactionAsync(work);
    return;
  }

  // expo-sqlite's web runtime does not currently expose transactions.
  // Each statement is still awaited in order so web cloud hydration can run.
  await work();
}

async function migrateIds(
  table: string,
  references: { table: string; column: string; where?: string }[] = [],
  where?: string,
) {
  const rows = await sqlite.getAllAsync<IdRow>(
    `SELECT id FROM ${table}${where ? ` WHERE ${where}` : ''}`,
  );

  for (const row of rows) {
    if (isUuid(row.id)) continue;
    const nextId = createLocalId(table);
    await sqlite.runAsync(`UPDATE ${table} SET id = ? WHERE id = ?`, nextId, row.id);
    for (const reference of references) {
      const suffix = reference.where ? ` AND ${reference.where}` : '';
      await sqlite.runAsync(
        `UPDATE ${reference.table} SET ${reference.column} = ? WHERE ${reference.column} = ?${suffix}`,
        nextId,
        row.id,
      );
    }
  }
}

/**
 * Preview builds created readable prefixed ids such as `proj-...`. Cloud
 * tables use UUIDs. Upgrade all existing local records in one transaction so
 * device data and its relationships survive the move to authenticated sync.
 */
export async function migrateLegacyIdsForCloud() {
  if (Platform.OS === 'web') return;
  await runLocalTransaction(async () => {
    await migrateIds('projects', [
      { table: 'project_photos', column: 'project_id' },
      { table: 'batch_logs', column: 'project_id' },
      { table: 'calculations', column: 'project_id' },
      { table: 'order_requests', column: 'project_id' },
      { table: 'warranty_reviews', column: 'project_id' },
      { table: 'purchase_receipts', column: 'project_id' },
      { table: 'project_signoffs', column: 'project_id' },
    ]);
    await migrateIds('calculations', [{ table: 'order_requests', column: 'calculation_id' }]);
    await migrateIds('order_requests');
    await migrateIds('purchase_receipts');
    await migrateIds('colors', [{ table: 'projects', column: 'selected_color_id' }], 'is_standard = 0');
    await migrateIds('project_photos');
    await migrateIds('batch_logs');
    await migrateIds('conversations');
    await migrateIds('installer_profiles');
    await migrateIds('warranty_reviews');
    await migrateIds('project_signoffs');
  });
}

export async function claimPreviewRecords(installerId: string) {
  if (Platform.OS === 'web') return;
  await runLocalTransaction(async () => {
    for (const table of [
      'projects',
      'project_photos',
      'calculations',
      'conversations',
      'installer_profiles',
      'warranty_reviews',
      'purchase_receipts',
      'project_signoffs',
    ]) {
      await sqlite.runAsync(
        `UPDATE ${table} SET installer_id = ? WHERE installer_id = 'local'`,
        installerId,
      );
    }
  });
}
