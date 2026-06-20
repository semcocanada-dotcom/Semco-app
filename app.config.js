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
process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||= easEnv.EXPO_PUBLIC_FIREBASE_API_KEY;
process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||= easEnv.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||= easEnv.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||= easEnv.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||= easEnv.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||= easEnv.EXPO_PUBLIC_FIREBASE_APP_ID;
process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ||= easEnv.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
process.env.EXPO_PUBLIC_FIREBASE_AI_MODEL ||= easEnv.EXPO_PUBLIC_FIREBASE_AI_MODEL;

module.exports = ({ config }) => ({
  ...config,
  ...expo,
  extra: {
    ...(config.extra ?? {}),
    ...(expo.extra ?? {}),
    // Keep these available in JS during local web preview too.
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      aiModel: process.env.EXPO_PUBLIC_FIREBASE_AI_MODEL || 'gemini-3.5-flash',
    },
  },
});
