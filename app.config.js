const fs = require('fs');
const path = require('path');

const { expo } = require('./app.json');

function loadEasEnv() {
  try {
    const easPath = path.join(process.cwd(), 'eas.json');
    const eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));
    return eas.build?.preview?.env ?? eas.build?.development?.env ?? eas.build?.production?.env ?? {};
  } catch {
    return {};
  }
}

const easEnv = loadEasEnv();

process.env.EXPO_PUBLIC_SUPABASE_URL ||= easEnv.EXPO_PUBLIC_SUPABASE_URL;
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||= easEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;

module.exports = {
  ...expo,
  updates: {
    url: 'https://u.expo.dev/cc9001d8-b1f9-44b2-b59c-c7b35d8c6129',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    ...(expo.extra ?? {}),
    // Keep these available in JS during local web preview too.
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};
