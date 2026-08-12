import type { Session, User } from '@supabase/supabase-js';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/services/supabase';
import { clearLocalAccountData } from '@/services/local-account-data';
import {
  AUTH_EMAIL_CONFIRM_REDIRECT,
  AUTH_PASSWORD_RESET_REDIRECT,
} from '@/constants/auth';

jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('@/services/local-account-data', () => ({
  clearLocalAccountData: jest.fn(),
}));

const signOut = supabase.auth.signOut as jest.Mock;
const signUp = supabase.auth.signUp as jest.Mock;
const resetPasswordForEmail = supabase.auth.resetPasswordForEmail as jest.Mock;
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

describe('authentication email redirects', () => {
  beforeEach(() => {
    signUp.mockReset().mockResolvedValue({ data: { session: null, user: null }, error: null });
    resetPasswordForEmail.mockReset().mockResolvedValue({ error: null });
    useAuthStore.setState({ session: null, user: null, isInitialized: true, isLoading: false });
  });

  it('returns new-account confirmation links to the app sign-in screen', async () => {
    await useAuthStore.getState().signUp(' installer@example.com ', 'password123', {
      companyName: 'Example Finishes',
      contactName: 'Alex Morgan',
      postalCode: 's4p 3x1',
    });

    expect(signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'installer@example.com',
      options: expect.objectContaining({ emailRedirectTo: AUTH_EMAIL_CONFIRM_REDIRECT }),
    }));
  });

  it('returns password recovery links to the in-app reset screen', async () => {
    await useAuthStore.getState().sendPasswordReset(' installer@example.com ');

    expect(resetPasswordForEmail).toHaveBeenCalledWith('installer@example.com', {
      redirectTo: AUTH_PASSWORD_RESET_REDIRECT,
    });
  });
});
