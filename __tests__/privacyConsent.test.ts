import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');
const read = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const consentSource = read('lib', 'privacyConsent.ts');
const profileSource = read('app', '(tabs)', 'profile.tsx');
const respiteSource = read('app', '(tabs)', 'respite.tsx');
const privacyPolicy = read('docs', 'index.html');
const schemaSource = read('supabase', 'schema.sql');
const migrationSource = read(
  'supabase',
  'migrations',
  '20260807135641_record_privacy_consents.sql',
);

describe('affirmative authority and privacy consent', () => {
  it('uses versioned, truthful attestations and the public privacy policy', () => {
    expect(consentSource).toContain("CHILD_DATA_CONSENT_VERSION = 'child-data-2026-08-07-v1'");
    expect(consentSource).toContain("RESPITE_WORKER_DATA_CONSENT_VERSION = 'respite-worker-data-2026-08-07-v1'");
    expect(consentSource).toContain("parent or legal guardian");
    expect(consentSource).toContain('otherwise authorized');
    expect(consentSource).toContain('Health Services Number');
    expect(consentSource).toContain('diagnosis date');
    expect(consentSource).toContain('diagnosis notes are optional');
    expect(consentSource).toContain("this person\\'s permission");
    expect(consentSource).toContain('other legal authority');
    expect(consentSource).toContain('PRIVACY_POLICY_URL');
  });

  it('starts child consent unchecked and blocks first save before database insertion', () => {
    expect(profileSource).toContain(
      'const [childConsentAccepted, setChildConsentAccepted] = useState(false);',
    );
    expect(profileSource).toContain('setChildConsentAccepted(false);');
    expect(profileSource).toContain('accessibilityRole="checkbox"');
    expect(profileSource).toContain('accessibilityState={{ checked: childConsentAccepted }}');
    expect(profileSource).toContain('Read the Privacy Policy');

    const guard = profileSource.indexOf('if (!child && !childConsentAccepted)');
    const insert = profileSource.indexOf("supabase.from('children').insert");
    expect(guard).toBeGreaterThan(-1);
    expect(insert).toBeGreaterThan(guard);
    expect(profileSource).toContain('data_consent_version: CHILD_DATA_CONSENT_VERSION');
    expect(profileSource).toContain('data_consent_accepted_at: new Date().toISOString()');
  });

  it('starts respite consent unchecked, supports cancel, and blocks uploads before inserts', () => {
    expect(respiteSource).toContain('Log sessions and amounts paid to support workers.');
    expect(respiteSource).not.toContain('pay your support workers');
    expect(respiteSource).toContain('const [consentAccepted, setConsentAccepted] = useState(false);');
    expect(respiteSource).toContain(
      'const [sessionConsentAccepted, setSessionConsentAccepted] = useState(false);',
    );
    expect(respiteSource).toContain('setSessionConsentAccepted(false);');
    expect(respiteSource).toContain('onPress={onCancel}');
    expect(respiteSource).toContain('onPress={onClose}');
    expect(respiteSource).toContain('Read the Privacy Policy');

    const workerGuard = respiteSource.indexOf('if (!v.consentAccepted)');
    const workerInsert = respiteSource.indexOf("supabase.from('respite_workers').insert");
    const sessionGuard = respiteSource.indexOf('if (!sessionConsentAccepted)');
    const sessionInsert = respiteSource.indexOf("supabase.from('respite_sessions').insert");
    expect(workerInsert).toBeGreaterThan(workerGuard);
    expect(sessionInsert).toBeGreaterThan(sessionGuard);
    expect(respiteSource).toContain(
      'data_consent_version: RESPITE_WORKER_DATA_CONSENT_VERSION',
    );
    expect(respiteSource).toContain('data_consent_accepted_at: new Date().toISOString()');
  });

  it('persists consent version and timestamp columns for all affected records', () => {
    for (const table of ['children', 'respite_workers', 'respite_sessions']) {
      expect(migrationSource).toContain(`ALTER TABLE public.${table}`);
    }
    expect((migrationSource.match(/data_consent_version TEXT/g) ?? [])).toHaveLength(3);
    expect((migrationSource.match(/data_consent_accepted_at TIMESTAMPTZ/g) ?? [])).toHaveLength(3);
    expect((schemaSource.match(/data_consent_version\s+TEXT/g) ?? [])).toHaveLength(3);
    expect((schemaSource.match(/data_consent_accepted_at\s+TIMESTAMPTZ/g) ?? [])).toHaveLength(3);
  });

  it('explains the required authorization, optional child fields, and retained audit record', () => {
    expect(privacyPolicy).toContain('adult parent, legal guardian, or another person who is authorized');
    expect(privacyPolicy).toContain('Health Services Number and diagnosis information are optional');
    expect(privacyPolicy).toContain('notice version and acceptance time');
    expect(privacyPolicy).toContain("person&rsquo;s permission, or other legal authority");
    expect(privacyPolicy).toContain('Do not enter another person&rsquo;s information');
  });
});
