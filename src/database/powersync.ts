import {
  PowerSyncDatabase,
  column,
  Schema,
  Table,
} from '@powersync/react-native';
import { SupabaseConnector } from '@powersync/supabase-connector';

// PowerSync schema mirrors the Supabase tables that need to sync
const psSchema = new Schema([
  new Table('projects', [
    column.text('installer_id'),
    column.text('client_name'),
    column.text('client_email'),
    column.text('client_phone'),
    column.text('site_address'),
    column.text('substrate_type'),
    column.real('total_area_sqm'),
    column.text('selected_color_id'),
    column.text('finish_type'),
    column.text('sealer_product_id'),
    column.text('status'),
    column.integer('warranty_issued'),
    column.text('completion_date'),
    column.text('notes'),
    column.text('created_at'),
    column.text('updated_at'),
  ]),
  new Table('project_photos', [
    column.text('project_id'),
    column.text('installer_id'),
    column.text('stage'),
    column.text('photo_url'),
    column.text('caption'),
    column.text('taken_at'),
  ]),
  new Table('batch_logs', [
    column.text('project_id'),
    column.text('product_id'),
    column.text('batch_number'),
    column.real('quantity_kg'),
    column.real('coverage_achieved_sqm'),
    column.text('applied_at'),
    column.text('notes'),
  ]),
  new Table('calculations', [
    column.text('project_id'),
    column.text('installer_id'),
    column.real('area_sqm'),
    column.text('substrate_type'),
    column.real('waste_pct'),
    column.text('result'),
    column.text('created_at'),
  ]),
  new Table('colors', [
    column.text('name'),
    column.text('code'),
    column.integer('is_standard'),
    column.text('installer_id'),
    column.text('pigments'),
    column.text('photo_url'),
    column.text('notes'),
    column.text('created_at'),
    column.text('updated_at'),
  ]),
  new Table('conversations', [
    column.text('installer_id'),
    column.text('title'),
    column.text('messages'),
    column.text('created_at'),
    column.text('updated_at'),
  ]),
]);

const POWERSYNC_URL = process.env.EXPO_PUBLIC_POWERSYNC_URL ?? '';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export let powerSync: PowerSyncDatabase | null = null;

export async function initPowerSync(accessToken: () => Promise<string>) {
  if (!POWERSYNC_URL || !SUPABASE_URL) {
    console.warn('[PowerSync] Missing env vars — sync disabled');
    return null;
  }

  const connector = new SupabaseConnector({
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    fetchCredentials: async () => {
      const token = await accessToken();
      return {
        token,
        expiresAt: new Date(Date.now() + 3600 * 1000),
        endpoint: POWERSYNC_URL,
      };
    },
  });

  powerSync = new PowerSyncDatabase({
    schema: psSchema,
    database: { dbFilename: 'semco_sync.db' },
  });

  await powerSync.connect(connector);
  return powerSync;
}
