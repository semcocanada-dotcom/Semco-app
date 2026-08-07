import '@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

const installerBuckets = [
  'project-photos',
  'project-signoffs',
  'purchase-receipts',
  'color-samples',
  'warranty-documents',
] as const;

const PAGE_SIZE = 1000;
const REMOVE_BATCH_SIZE = 1000;
const LOCK_LEASE_SECONDS = 600;

function createAdminClient(supabaseUrl: string, serviceRoleKey: string) {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type AdminClient = ReturnType<typeof createAdminClient>;
type LockResult = {
  acquired: boolean;
  lock_expires_at: string | null;
};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

async function collectStoragePaths(
  admin: AdminClient,
  bucket: string,
  prefix: string,
  refreshLock: () => Promise<void>,
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    await refreshLock();
    const { data, error } = await admin.storage.from(bucket).list(prefix, {
      limit: PAGE_SIZE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) throw new Error(`Could not inspect ${bucket} storage.`);
    const entries = data ?? [];

    for (const entry of entries) {
      const path = `${prefix}/${entry.name}`;
      if (entry.id === null) {
        paths.push(...await collectStoragePaths(admin, bucket, path, refreshLock));
      } else {
        paths.push(path);
      }
    }

    if (entries.length < PAGE_SIZE) break;
    offset += entries.length;
  }

  return paths;
}

async function removeInstallerFiles(
  admin: AdminClient,
  userId: string,
  refreshLock: () => Promise<void>,
) {
  for (const bucket of installerBuckets) {
    const paths = await collectStoragePaths(admin, bucket, userId, refreshLock);
    for (let offset = 0; offset < paths.length; offset += REMOVE_BATCH_SIZE) {
      await refreshLock();
      const batch = paths.slice(offset, offset + REMOVE_BATCH_SIZE);
      const { error } = await admin.storage.from(bucket).remove(batch);
      if (error) throw new Error(`Could not remove files from ${bucket}.`);
    }
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return respond(405, { error: 'Method not allowed.' });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return respond(401, { error: 'Authentication is required.' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[delete-account] required Supabase environment is missing');
    return respond(500, { error: 'Account deletion is temporarily unavailable.' });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);
  const accessToken = authorization.slice('Bearer '.length).trim();
  const { data: { user }, error: userError } = await admin.auth.getUser(accessToken);

  if (userError || !user) {
    return respond(401, { error: 'The session is no longer valid. Sign in and try again.' });
  }

  const lockToken = crypto.randomUUID();
  let lockAcquired = false;
  let accountDeleted = false;

  try {
    const { data: lockData, error: lockError } = await admin.rpc('acquire_account_deletion_lock', {
      p_installer_id: user.id,
      p_lock_token: lockToken,
      p_lease_seconds: LOCK_LEASE_SECONDS,
    });
    if (lockError) throw new Error('Could not lock the account for deletion.');

    const lock = (Array.isArray(lockData) ? lockData[0] : lockData) as LockResult | null;
    if (!lock?.acquired) {
      return respond(409, {
        error: 'Account deletion is already in progress. Please try again shortly.',
        lockExpiresAt: lock?.lock_expires_at ?? null,
      });
    }
    lockAcquired = true;

    const refreshLock = async () => {
      const { data: refreshed, error: refreshError } = await admin.rpc('refresh_account_deletion_lock', {
        p_installer_id: user.id,
        p_lock_token: lockToken,
        p_lease_seconds: LOCK_LEASE_SECONDS,
      });
      if (refreshError || refreshed !== true) {
        throw new Error('The account deletion lock was lost.');
      }
    };

    // Files must be removed through the Storage API so both object metadata and
    // the underlying private objects are deleted. The heartbeat keeps the
    // lease live while large nested prefixes are listed and removed.
    await removeInstallerFiles(admin, user.id, refreshLock);
    await refreshLock();

    const { error: dataError } = await admin.rpc('delete_installer_account_data', {
      p_target_user_id: user.id,
      p_lock_token: lockToken,
    });
    if (dataError) throw new Error('Could not remove account records.');

    await refreshLock();
    const { error: authError } = await admin.auth.admin.deleteUser(user.id, false);
    if (authError) throw new Error('Could not remove the authentication account.');
    accountDeleted = true;

    return respond(200, { deleted: true });
  } catch (error) {
    console.error('[delete-account] deletion failed', error);
    return respond(500, { error: 'Account deletion could not be completed. Please try again.' });
  } finally {
    // auth.users deletion cascades the successful lock. Failed attempts release
    // only their own token so another request can retry immediately. If this
    // release itself fails, acquire_account_deletion_lock can take over after
    // the ten-minute lease expires.
    if (lockAcquired && !accountDeleted) {
      const { error: releaseError } = await admin.rpc('release_account_deletion_lock', {
        p_installer_id: user.id,
        p_lock_token: lockToken,
      });
      if (releaseError) console.error('[delete-account] lock release failed', releaseError);
    }
  }
});
