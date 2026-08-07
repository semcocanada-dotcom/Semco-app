import fs from 'fs';
import path from 'path';
import {
  PROJECT_CUSTOMER_DATA_CONSENT_VERSION,
  PROJECT_CUSTOMER_DATA_NOTICE,
} from './project-customer-consent';

const root = path.join(__dirname, '..', '..');
const read = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), 'utf8');

describe('project customer-data authorization', () => {
  it('states authority, customer fields, cloud storage, access, purposes, retention, and deletion', () => {
    expect(PROJECT_CUSTOMER_DATA_CONSENT_VERSION).toBe('project-customer-data-2026-08-07-v1');
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain('customer has given permission');
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain('other legal authority');
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain("customer's name, email, phone number, site address, notes");
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain('Supabase-hosted cloud storage');
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain('Authorized Semco Canada staff');
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain("installer's assigned dealer");
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain('material-request support');
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain('Records are retained');
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain('permanently delete their account');
    expect(PROJECT_CUSTOMER_DATA_NOTICE).toContain('info@semcocanada.ca');
  });

  it('hides customer fields until affirmative confirmation and makes Cancel leave without saving', () => {
    const source = read('app', '(app)', 'projects', 'create.tsx');
    const gate = source.indexOf('if (!projectCustomerConsentAcceptedAt) {\n    return (');
    const fields = source.indexOf('<Text style={styles.sectionLabel}>Client Details</Text>');
    const dbInsert = source.indexOf('await db.insert(projects).values(createdProject)');
    const cloudSync = source.indexOf('await syncProjectToCloud(createdProject)');

    expect(source).toContain('I Confirm & Continue');
    expect(source).toContain('label="Cancel"');
    expect(source).toContain('onPress={() => router.back()}');
    expect(gate).toBeGreaterThan(-1);
    expect(fields).toBeGreaterThan(gate);
    expect(source.indexOf('if (!projectCustomerConsentAcceptedAt) {')).toBeLessThan(dbInsert);
    expect(cloudSync).toBeGreaterThan(dbInsert);
  });

  it('persists version, timestamp, and notice in local and cloud project records', () => {
    const createSource = read('app', '(app)', 'projects', 'create.tsx');
    const schema = read('src', 'database', 'schema', 'projects.ts');
    const client = read('src', 'database', 'client.ts');
    const cloudSync = read('src', 'services', 'cloud-sync.ts');
    const migration = read(
      'supabase',
      'migrations',
      '20260807141950_record_project_customer_data_consent.sql',
    );

    expect(createSource).toContain('customerDataConsentVersion: PROJECT_CUSTOMER_DATA_CONSENT_VERSION');
    expect(createSource).toContain('customerDataConsentAcceptedAt: projectCustomerConsentAcceptedAt');
    expect(createSource).toContain('customerDataConsentNotice: PROJECT_CUSTOMER_DATA_NOTICE');
    for (const column of [
      'customer_data_consent_version',
      'customer_data_consent_accepted_at',
      'customer_data_consent_notice',
    ]) {
      expect(schema).toContain(`'${column}'`);
      expect(client).toContain(column);
      expect(cloudSync).toContain(column);
      expect(migration).toContain(column);
    }
  });

  it('documents the same authorization in public and in-app privacy policies', () => {
    const publicPolicy = read('supabase', 'functions', 'privacy-policy', 'index.ts');
    const inAppPolicy = read('app', '(app)', 'privacy.tsx');
    for (const policy of [publicPolicy, inAppPolicy]) {
      expect(policy).toMatch(/customer project data authorization/i);
      expect(policy).toContain('other legal authority');
      expect(policy).toContain('Cancel returns without saving');
      expect(policy).toContain('notice version, full text, and acceptance time');
    }
  });
});
