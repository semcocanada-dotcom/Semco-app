import fs from 'fs';
import path from 'path';
import {
  addCustomerSignoffConsentAudit,
  CUSTOMER_SIGNOFF_CONSENT_ACCEPTED_AT_KEY,
  CUSTOMER_SIGNOFF_CONSENT_NOTICE_KEY,
  CUSTOMER_SIGNOFF_CONSENT_VERSION,
  CUSTOMER_SIGNOFF_CONSENT_VERSION_KEY,
  CUSTOMER_SIGNOFF_PRIVACY_NOTICE,
  readCustomerSignoffConsentAudit,
} from './customer-signoff-consent';

const root = path.join(__dirname, '..', '..');
const read = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), 'utf8');

describe('customer sign-off privacy acknowledgement', () => {
  it('discloses the data, processor, access, purposes, retention, deletion, support, and email behavior', () => {
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain('name, email (if provided), signature, completed PDF');
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain('Supabase-hosted cloud storage');
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain('Semco Canada administrators');
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain("project's assigned dealer");
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain('support orders and warranty work');
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain('Records are retained');
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain('permanently delete their account');
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain('info@semcocanada.ca');
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain('https://www.semcocanada.ca/contact');
    expect(CUSTOMER_SIGNOFF_PRIVACY_NOTICE).toContain('is not emailed automatically');
  });

  it('adds and reads a versioned audit record without removing form fields', () => {
    const acceptedAt = '2026-08-07T14:30:00.000Z';
    const formData = addCustomerSignoffConsentAudit({ color: 'Grey Marble' }, acceptedAt);

    expect(formData.color).toBe('Grey Marble');
    expect(formData[CUSTOMER_SIGNOFF_CONSENT_VERSION_KEY]).toBe(CUSTOMER_SIGNOFF_CONSENT_VERSION);
    expect(formData[CUSTOMER_SIGNOFF_CONSENT_ACCEPTED_AT_KEY]).toBe(acceptedAt);
    expect(formData[CUSTOMER_SIGNOFF_CONSENT_NOTICE_KEY]).toBe(CUSTOMER_SIGNOFF_PRIVACY_NOTICE);
    expect(readCustomerSignoffConsentAudit(formData)).toEqual({
      version: CUSTOMER_SIGNOFF_CONSENT_VERSION,
      acceptedAt,
      notice: CUSTOMER_SIGNOFF_PRIVACY_NOTICE,
    });
  });

  it('rejects missing, stale, or empty audit records', () => {
    expect(() => addCustomerSignoffConsentAudit({}, '')).toThrow('required');
    expect(readCustomerSignoffConsentAudit({})).toBeNull();
    expect(readCustomerSignoffConsentAudit({
      [CUSTOMER_SIGNOFF_CONSENT_VERSION_KEY]: 'old-version',
      [CUSTOMER_SIGNOFF_CONSENT_ACCEPTED_AT_KEY]: '2026-08-07T14:30:00.000Z',
      [CUSTOMER_SIGNOFF_CONSENT_NOTICE_KEY]: CUSTOMER_SIGNOFF_PRIVACY_NOTICE,
    })).toBeNull();
  });

  it('gates all sign-off fields and PDF upload behind affirmative continue', () => {
    const panel = read('src', 'components', 'projects', 'ProjectSignoffPanel.tsx');
    const guard = panel.indexOf('if (!hasCurrentCustomerPrivacyConsent || !customerPrivacyAcceptedAt)');
    const pdfCreation = panel.indexOf('createFilledSignoffPdf');
    const upload = panel.indexOf('uploadSignoffPdf(filledPdf');
    const gate = panel.indexOf('!hasCurrentCustomerPrivacyConsent ?');
    const form = panel.indexOf('<EditablePdfForm');

    expect(panel).toContain('I Agree & Continue');
    expect(panel).toContain('No new sign-off details were captured or uploaded.');
    expect(panel).toContain('Customer email (stored with project; no automatic email)');
    expect(guard).toBeGreaterThan(-1);
    expect(pdfCreation).toBeGreaterThan(guard);
    expect(upload).toBeGreaterThan(pdfCreation);
    expect(form).toBeGreaterThan(gate);
    expect(panel).toContain('addCustomerSignoffConsentAudit');
    expect(panel).toContain('customerPrivacyAcceptedType === selectedType');
  });

  it('includes the consent audit in cloud form data and the generated PDF', () => {
    const panel = read('src', 'components', 'projects', 'ProjectSignoffPanel.tsx');
    const cloud = read('src', 'services', 'signoffs-cloud.ts');
    const pdf = read('src', 'services', 'signoff-pdf.ts');

    expect(panel).toContain('formData: savedFormData');
    expect(cloud).toContain('form_data: input.formData');
    expect(pdf).toContain('readCustomerSignoffConsentAudit(values)');
    expect(pdf).toContain("pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])");
    expect(pdf).toContain('Customer Privacy Acknowledgement');
    expect(pdf).toContain('Audit receipt: the customer selected I Agree & Continue');
    expect(pdf.indexOf('readCustomerSignoffConsentAudit(values)')).toBeLessThan(pdf.indexOf('const bytes = await pdfDoc.save()'));
  });

  it('keeps the public and in-app privacy disclosures consistent', () => {
    const publicPolicy = read('supabase', 'functions', 'privacy-policy', 'index.ts');
    const inAppPolicy = read('app', '(app)', 'privacy.tsx');
    for (const policy of [publicPolicy, inAppPolicy]) {
      expect(policy).toMatch(/customer sign-off acknowledgement/i);
      expect(policy).toContain('I Agree & Continue');
      expect(policy).toContain('Cancel does not capture or upload new sign-off details');
      expect(policy).toContain('not emailed automatically');
    }
  });
});
