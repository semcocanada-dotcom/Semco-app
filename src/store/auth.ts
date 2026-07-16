import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

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

export const useAuthStore = create<AuthState>((set) => ({
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
    await supabase.auth.signOut();
    set({ session: null, user: null, isInitialized: true });
  },
}));
