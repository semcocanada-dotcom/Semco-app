import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACCOUNT_DELETION_CONFIRMATION,
  ACCOUNT_DELETION_ERROR_MESSAGE,
  clearLocalAccountData,
  deleteCurrentAccount,
} from '../lib/accountDeletion';
import {
  ACTIVE_CHILD_STORAGE_KEY,
  PROVIDER_GEOCODE_CACHE_STORAGE_KEY,
} from '../lib/localStorageKeys';
import { clearScheduledAccountNotifications } from '../lib/notifications';

jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@lib/supabase', () => ({
  supabase: {},
}));

jest.mock('../lib/notifications', () => ({
  clearScheduledAccountNotifications: jest.fn().mockResolvedValue(undefined),
}));

function client({
  data = { deleted: true },
  invokeError = null,
  signOutError = null,
}: {
  data?: unknown;
  invokeError?: { message: string } | null;
  signOutError?: unknown | null;
} = {}) {
  return {
    functions: {
      invoke: jest.fn().mockResolvedValue({ data, error: invokeError }),
    },
    auth: {
      signOut: jest.fn().mockResolvedValue({ error: signOutError }),
    },
  };
}

describe('deleteCurrentAccount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls the authenticated deletion function, clears local data, and signs out locally', async () => {
    const mockClient = client();
    const clearLocalData = jest.fn().mockResolvedValue(undefined);

    await deleteCurrentAccount(mockClient, clearLocalData);

    expect(mockClient.functions.invoke).toHaveBeenCalledWith('delete-account', {
      body: { confirmation: ACCOUNT_DELETION_CONFIRMATION },
    });
    expect(clearLocalData).toHaveBeenCalledTimes(1);
    expect(mockClient.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('does not clear local state when the server did not delete the account', async () => {
    const mockClient = client({ invokeError: { message: 'Function failed' } });
    const clearLocalData = jest.fn();

    await expect(deleteCurrentAccount(mockClient, clearLocalData)).rejects.toThrow(
      ACCOUNT_DELETION_ERROR_MESSAGE,
    );
    expect(clearLocalData).not.toHaveBeenCalled();
    expect(mockClient.auth.signOut).not.toHaveBeenCalled();
  });

  it('rejects a malformed success response', async () => {
    const mockClient = client({ data: { deleted: false } });

    await expect(deleteCurrentAccount(mockClient, jest.fn())).rejects.toThrow(
      ACCOUNT_DELETION_ERROR_MESSAGE,
    );
  });

  it('does not report a false server failure after best-effort local cleanup errors', async () => {
    const mockClient = client({ signOutError: new Error('offline') });
    const clearLocalData = jest.fn().mockRejectedValue(new Error('storage unavailable'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(deleteCurrentAccount(mockClient, clearLocalData)).resolves.toBeUndefined();
    expect(mockClient.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('does not report a false server failure when local sign-out throws', async () => {
    const mockClient = client();
    mockClient.auth.signOut.mockRejectedValueOnce(new Error('network unavailable'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(
      deleteCurrentAccount(mockClient, jest.fn().mockResolvedValue(undefined)),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe('clearLocalAccountData', () => {
  beforeEach(() => jest.clearAllMocks());

  it('removes selected-child state, cached addresses, and scheduled reminders', async () => {
    await clearLocalAccountData();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(ACTIVE_CHILD_STORAGE_KEY);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(PROVIDER_GEOCODE_CACHE_STORAGE_KEY);
    expect(clearScheduledAccountNotifications).toHaveBeenCalledTimes(1);
  });
});
