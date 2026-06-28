import type { User } from '@supabase/supabase-js';

const ADMIN_EMAILS = new Set([
  'semcocanada@gmail.com',
]);

const ADMIN_ROLES = new Set(['admin', 'owner', 'semco_admin']);

function readMetadataValue(user: User | null | undefined, key: string): string {
  const value = user?.app_metadata?.[key] ?? user?.user_metadata?.[key];
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function isSemcoAdminUser(user: User | null | undefined): boolean {
  const email = user?.email?.trim().toLowerCase();
  const role = readMetadataValue(user, 'role');
  const semcoRole = readMetadataValue(user, 'semco_role');
  const isAdminFlag = user?.app_metadata?.is_semco_admin === true || user?.user_metadata?.is_semco_admin === true;

  return isAdminFlag
    || ADMIN_ROLES.has(role)
    || ADMIN_ROLES.has(semcoRole)
    || Boolean(email && ADMIN_EMAILS.has(email));
}
