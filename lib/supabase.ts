import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient, processLock } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';

// Auth tokens hold a logged-in session to a child's health data, so they
// are kept in the OS keychain/keystore (encrypted), not plaintext
// AsyncStorage. SecureStore caps each value (~2KB on iOS); Supabase
// sessions exceed that, so values are transparently chunked.
const CHUNK_SIZE = 1800;
const isChunked = /^__chunks__:(\d+)$/;
const isNativeMobile = Platform.OS === 'ios' || Platform.OS === 'android';

const SecureStorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    const head = await SecureStore.getItemAsync(key);
    if (head == null) return null;
    const m = isChunked.exec(head);
    if (!m) return head;
    const n = parseInt(m[1], 10);
    let out = '';
    for (let i = 0; i < n; i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part == null) return null;
      out += part;
    }
    return out;
  },
  async setItem(key: string, value: string): Promise<void> {
    // Drop any chunks written by a previous, larger value.
    const prev = await SecureStore.getItemAsync(key);
    const pm = prev ? isChunked.exec(prev) : null;
    if (pm) {
      const pn = parseInt(pm[1], 10);
      for (let i = 0; i < pn; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
    }
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const n = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < n; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(key, `__chunks__:${n}`);
  },
  async removeItem(key: string): Promise<void> {
    const head = await SecureStore.getItemAsync(key);
    const m = head ? isChunked.exec(head) : null;
    if (m) {
      const n = parseInt(m[1], 10);
      for (let i = 0; i < n; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl: string = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const supabaseAnonKey: string = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] Missing supabaseUrl or supabaseAnonKey in expo config "extra". ' +
    'Set them in app.json (or via env in app.config.ts) — all queries will fail until configured.',
  );
}

// Untyped client — all query results are explicitly cast at call sites
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isNativeMobile ? SecureStorageAdapter : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

if (isNativeMobile) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export const db = {
  profiles:     () => supabase.from('profiles'),
  children:     () => supabase.from('children'),
  fundingYears: () => supabase.from('funding_years'),
  providers:    () => supabase.from('providers'),
  expenses:     () => supabase.from('expenses'),
  mileageLogs:  () => supabase.from('mileage_logs'),
  appointments:  () => supabase.from('appointments'),
  monthlyClaims: () => supabase.from('monthly_claims'),
};

export const receiptsStorage = () => supabase.storage.from('receipts');
