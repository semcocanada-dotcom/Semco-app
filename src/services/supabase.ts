import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

function requireSupabaseUrl() {
  const value = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error('[supabase] Missing EXPO_PUBLIC_SUPABASE_URL. Set it in eas.json or your local env.');
  }
  return value;
}

function requireSupabaseAnonKey() {
  const value = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error('[supabase] Missing EXPO_PUBLIC_SUPABASE_ANON_KEY. Set it in eas.json or your local env.');
  }
  return value;
}

const SUPABASE_URL = requireSupabaseUrl();
const SUPABASE_ANON_KEY = requireSupabaseAnonKey();

if (process.env.NODE_ENV !== 'production') {
  console.log('[supabase] Configuring client', {
    url: SUPABASE_URL,
    hasKey: Boolean(SUPABASE_ANON_KEY),
  });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
