import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACTIVE_CHILD_STORAGE_KEY,
  PROVIDER_GEOCODE_CACHE_STORAGE_KEY,
} from '@lib/localStorageKeys';
import { clearScheduledAccountNotifications } from '@lib/notifications';
import { supabase } from '@lib/supabase';

export const ACCOUNT_DELETION_CONFIRMATION = 'DELETE';

export const ACCOUNT_DELETION_ERROR_MESSAGE =
  'Your account could not be deleted. Please try again. If the problem continues, contact support.';

interface DeleteAccountClient {
  functions: {
    invoke: (
      functionName: string,
      options: { body: { confirmation: string } },
    ) => Promise<{ data: unknown; error: { message?: string } | null }>;
  };
  auth: {
    signOut: (options: { scope: 'local' }) => Promise<{ error: unknown | null }>;
  };
}

interface DeleteAccountResponse {
  deleted?: boolean;
}

export async function clearLocalAccountData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(ACTIVE_CHILD_STORAGE_KEY),
    AsyncStorage.removeItem(PROVIDER_GEOCODE_CACHE_STORAGE_KEY),
    clearScheduledAccountNotifications(),
  ]);
}

/**
 * Permanently deletes the signed-in account through the authenticated server
 * function. The service-role credential never exists in the mobile bundle.
 */
export async function deleteCurrentAccount(
  client: DeleteAccountClient = supabase,
  clearLocalData: () => Promise<void> = clearLocalAccountData,
): Promise<void> {
  const { data, error } = await client.functions.invoke('delete-account', {
    body: { confirmation: ACCOUNT_DELETION_CONFIRMATION },
  });

  if (error || (data as DeleteAccountResponse | null)?.deleted !== true) {
    throw new Error(ACCOUNT_DELETION_ERROR_MESSAGE);
  }

  // The server has already deleted the account at this point. Local cleanup is
  // best-effort and must not turn a successful permanent deletion into a false
  // failure message. Supabase treats 401/403/404 during sign-out as success
  // when the Auth user has already been removed.
  try {
    await clearLocalData();
  } catch (cleanupError) {
    console.warn('[account-deletion] Local data cleanup failed', cleanupError);
  }

  try {
    const { error: signOutError } = await client.auth.signOut({ scope: 'local' });
    if (signOutError) {
      console.warn('[account-deletion] Local session cleanup failed', signOutError);
    }
  } catch (signOutError) {
    console.warn('[account-deletion] Local session cleanup failed', signOutError);
  }
}
