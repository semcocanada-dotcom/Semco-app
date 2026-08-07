const fs = require('fs');
const path = require('path');

const { expo } = require('./app.json');

function loadEasEnv() {
  try {
    const easPath = path.join(process.cwd(), 'eas.json');
    const eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));
    const profile = process.env.EAS_BUILD_PROFILE ?? 'production';
    return eas.build?.[profile]?.env ?? eas.build?.production?.env ?? {};
  } catch {
    return {};
  }
}

const easEnv = loadEasEnv();

process.env.EXPO_PUBLIC_SUPABASE_URL ||= easEnv.EXPO_PUBLIC_SUPABASE_URL;
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||= easEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;

module.exports = ({ config }) => ({
  ...config,
  ...expo,
  extra: {
    ...(config.extra ?? {}),
    ...(expo.extra ?? {}),
    // Keep these available in JS during local web preview too.
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});
