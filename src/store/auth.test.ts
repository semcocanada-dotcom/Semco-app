import type { Session, User } from '@supabase/supabase-js';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/services/supabase';
import { clearLocalAccountData } from '@/services/local-account-data';

jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(),
    },
  },
}));

jest.mock('@/services/local-account-data', () => ({
  clearLocalAccountData: jest.fn(),
}));

const signOut = supabase.auth.signOut as jest.Mock;
const clearDeviceData = clearLocalAccountData as jest.Mock;
const user = { id: 'installer-1', email: 'installer@example.com' } as User;
const session = { user } as Session;

describe('device sign-out cleanup', () => {
  beforeEach(() => {
    signOut.mockReset().mockResolvedValue({ error: null });
    clearDeviceData.mockReset().mockResolvedValue(undefined);
    useAuthStore.setState({ session, user, isInitialized: true, isLoading: false });
  });

  it('removes the local session and account-scoped device data', async () => {
    await useAuthStore.getState().signOut();

    expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(clearDeviceData).toHaveBeenCalledWith(user.id);
    expect(useAuthStore.getState().session).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('still clears app state and device data when Supabase sign-out errors', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    signOut.mockRejectedValue(new Error('offline'));

    await useAuthStore.getState().signOut();

    expect(clearDeviceData).toHaveBeenCalledWith(user.id);
    expect(useAuthStore.getState().user).toBeNull();
    consoleError.mockRestore();
  });
});
