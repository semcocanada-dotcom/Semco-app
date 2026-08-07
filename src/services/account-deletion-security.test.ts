import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260807090000_immediate_account_deletion.sql'),
  'utf8',
);
const edgeFunction = readFileSync(
  resolve(process.cwd(), 'supabase/functions/delete-account/index.ts'),
  'utf8',
);

describe('account deletion security contract', () => {
  it('uses a tokenized lease with stale takeover and token-scoped release', () => {
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.account_deletion_locks');
    expect(migration).toContain('deletion_lock.expires_at <= v_now');
    expect(migration).toContain('deletion_lock.lock_token = EXCLUDED.lock_token');
    expect(migration).toMatch(
      /UPDATE public\.account_deletion_locks[\s\S]*?lock_token = p_lock_token[\s\S]*?expires_at > v_now;/,
    );
    expect(migration).toMatch(
      /DELETE FROM public\.account_deletion_locks[\s\S]*?installer_id = p_installer_id[\s\S]*?lock_token = p_lock_token;/,
    );
  });

  it('blocks inserts and both sides of updates while the prefix is locked', () => {
    const lockChecks = migration.match(
      /NOT public\.is_installer_deletion_locked\(\(storage\.foldername\(name\)\)\[1\]\)/g,
    );

    expect(lockChecks).toHaveLength(3);
    expect(migration).toContain('CREATE POLICY "installer_private_files_insert"');
    expect(migration).toContain('CREATE POLICY "installer_private_files_update"');
  });

  it('requires a live token for data deletion and removes every user-owned color', () => {
    expect(migration).toContain('deletion_lock.lock_token = p_lock_token');
    expect(migration).toMatch(
      /DELETE FROM public\.colors\s+WHERE installer_id = p_target_user_id;/,
    );
    expect(migration).not.toMatch(
      /DELETE FROM public\.colors[\s\S]{0,120}is_standard/,
    );
  });

  it('pins every SECURITY DEFINER function to the system catalog search path', () => {
    const definers = migration.match(/\nSECURITY DEFINER\n/g) ?? [];
    const safeSearchPaths = migration.match(/SET search_path = pg_catalog/g) ?? [];

    expect(definers.length).toBeGreaterThanOrEqual(5);
    expect(safeSearchPaths).toHaveLength(definers.length);
    expect(migration).not.toContain('SET search_path = public');
  });

  it('refreshes the lease during storage cleanup and releases failed attempts', () => {
    expect(edgeFunction).toContain("admin.rpc('acquire_account_deletion_lock'");
    expect(edgeFunction).toContain("admin.rpc('refresh_account_deletion_lock'");
    expect(edgeFunction).toContain("admin.rpc('release_account_deletion_lock'");
    expect(edgeFunction).toContain('if (lockAcquired && !accountDeleted)');
  });
});
