import type { ExpoConfig, ConfigContext } from 'expo/config';
import appJson from './app.json';

// Secrets resolve from environment variables when set (EAS / CI / local .env),
// falling back to the values in app.json so existing builds keep working.
// See .env.example. The Supabase anon key is a public, RLS-protected key.
// Private service credentials belong only in server-side Edge Function secrets.
export default (_: ConfigContext): ExpoConfig => {
  const base = appJson.expo as unknown as ExpoConfig;
  return {
    ...base,
    extra: {
      ...base.extra,
      supabaseUrl: process.env.SUPABASE_URL ?? base.extra?.supabaseUrl,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? base.extra?.supabaseAnonKey,
    },
  };
};
