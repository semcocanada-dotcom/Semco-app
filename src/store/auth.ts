import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { clearLocalAccountData } from '@/services/local-account-data';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<() => void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, profile: { companyName: string; contactName: string; postalCode: string }) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  sendPasswordReset: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  setSession: (session) =>
    set({ session, user: session?.user ?? null, isInitialized: true }),

  initialize: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.error('[auth] session initialization failed', error);
    set({ session: data.session, user: data.session?.user ?? null, isInitialized: true });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, isInitialized: true });
    });
    return () => listener.subscription.unsubscribe();
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (data.session) set({ session: data.session, user: data.user, isInitialized: true });
    set({ isLoading: false });
    return error?.message ?? null;
  },

  signUp: async (email, password, profile) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          company_name: profile.companyName.trim(),
          contact_name: profile.contactName.trim(),
          postal_code: profile.postalCode.trim().toUpperCase(),
        },
      },
    });
    if (data.session) set({ session: data.session, user: data.user, isInitialized: true });
    set({ isLoading: false });
    return {
      error: error?.message ?? null,
      needsEmailConfirmation: !error && !data.session,
    };
  },

  sendPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'semco://reset-password',
    });
    return error?.message ?? null;
  },

  signOut: async () => {
    const installerId = get().user?.id;
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('[auth] local sign-out failed', error);
    }

    if (installerId) {
      try {
        await clearLocalAccountData(installerId);
      } catch (error) {
        // The auth token has still been removed by AsyncStorage cleanup, and
        // account-scoped queries also filter by user id as defense in depth.
        console.error('[auth] device data cleanup failed', error);
      }
    }

    set({ session: null, user: null, isInitialized: true });
  },
}));
