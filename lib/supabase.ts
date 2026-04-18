import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import type { Database } from './types';

const supabaseUrl: string = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const supabaseAnonKey: string = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Typed table accessors
export const db = {
  profiles: () => supabase.from('profiles'),
  children: () => supabase.from('children'),
  fundingYears: () => supabase.from('funding_years'),
  providers: () => supabase.from('providers'),
  expenses: () => supabase.from('expenses'),
  mileageLogs: () => supabase.from('mileage_logs'),
  appointments: () => supabase.from('appointments'),
};

export const receiptsStorage = () => supabase.storage.from('receipts');
