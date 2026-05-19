import type { ExpoConfig, ConfigContext } from 'expo/config';
import appJson from './app.json';

// Secrets resolve from environment variables when set (EAS / CI / local .env),
// falling back to the values in app.json so existing builds keep working.
// See .env.example. The Supabase anon key is a public, RLS-protected key;
// the Google Vision key is sensitive and should be supplied via env.
export default (_: ConfigContext): ExpoConfig => {
  const base = appJson.expo as unknown as ExpoConfig;
  return {
    ...base,
    extra: {
      ...base.extra,
      supabaseUrl: process.env.SUPABASE_URL ?? base.extra?.supabaseUrl,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? base.extra?.supabaseAnonKey,
      googleVisionApiKey:
        process.env.GOOGLE_VISION_API_KEY ?? base.extra?.googleVisionApiKey,
    },
  };
};
