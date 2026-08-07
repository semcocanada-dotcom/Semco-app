import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');
const read = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const pdfFormsSource = read('lib', 'pdfForms.ts');
const mileageSource = read('app', '(tabs)', 'mileage.tsx');
const respiteSource = read('app', '(tabs)', 'respite.tsx');
const tabLayoutSource = read('app', '(tabs)', '_layout.tsx');
const reportsSource = read('app', '(tabs)', 'reports.tsx');
const privacySource = read('docs', 'index.html');
const supportSource = read('docs', 'support.html');
const handoffSource = read('HANDOFF.md');
const packageJson = JSON.parse(read('package.json'));

describe('independent worksheet and content-rights safeguards', () => {
  it('places the unofficial-form and independence notices in every PDF path', () => {
    expect(pdfFormsSource).toContain(
      "'Unofficial — not a Government of Saskatchewan form'",
    );
    expect(pdfFormsSource).toContain(
      "'Autism Fund Tracker is independent and not affiliated with or endorsed by the Government of Saskatchewan.'",
    );
    expect(pdfFormsSource).toContain('${esc(UNOFFICIAL_WORKSHEET_NOTICE)}');
    expect(pdfFormsSource).toContain('${esc(INDEPENDENCE_NOTICE)}');
    expect(reportsSource).toContain('${esc(UNOFFICIAL_WORKSHEET_NOTICE)}');
    expect(reportsSource).toContain('${esc(INDEPENDENCE_NOTICE)}');
  });

  it('uses worksheet language and keeps government submission separate', () => {
    expect(mileageSource).toContain('Export Worksheet');
    expect(respiteSource).toContain('Export Worksheet');
    expect(reportsSource).toContain('Generate PDF Worksheet');
    expect(mileageSource).toContain('Open Official Mileage Form');
    expect(mileageSource).toContain('OFFICIAL_MILEAGE_FORM_URL');
    expect(respiteSource).toContain('Open Official Respite Form');
    expect(respiteSource).toContain('OFFICIAL_RESPITE_FORM_URL');
    expect(pdfFormsSource).toContain(
      'https://publications.saskatchewan.ca/api/v1/products/123746/formats/144047/download',
    );
    expect(pdfFormsSource).toContain(
      'https://publications.saskatchewan.ca/api/v1/products/123751/formats/144051/download',
    );

    const userFacingSources = [
      mileageSource,
      respiteSource,
      reportsSource,
      pdfFormsSource,
    ].join('\n');
    expect(userFacingSources).not.toContain('SK Form PDF');
    expect(userFacingSources).not.toContain('Export Invoice');
    expect(userFacingSources).not.toContain('Saskatchewan IAF Grant Report');
    expect(userFacingSources).not.toContain('For grant submission & audit');
  });

  it('does not bundle the dormant monthly-claims route', () => {
    expect(fs.existsSync(path.join(root, 'app', '(tabs)', 'claims.tsx'))).toBe(false);
    expect(tabLayoutSource).not.toContain('name="claims"');
  });

  it('does not bundle or reference copied Saskatchewan form assets', () => {
    const removedArtifacts = [
      'Monthly%2BMileage%2BInvoice%2B2 (2).pdf',
      'Monthly%2BRespite%2BInvoice%2B2.pdf',
      path.join('assets', 'forms', 'mileageFormBase64.ts'),
      path.join('assets', 'forms', 'respiteFormBase64.ts'),
    ];
    for (const artifact of removedArtifacts) {
      expect(fs.existsSync(path.join(root, artifact))).toBe(false);
    }

    const implementationSources = [pdfFormsSource, mileageSource, respiteSource, handoffSource].join('\n');
    expect(implementationSources).not.toContain('MILEAGE_FORM_BASE64');
    expect(implementationSources).not.toContain('RESPITE_FORM_BASE64');
    expect(implementationSources).not.toContain('fillAndShareOfficial');
    expect(implementationSources).not.toContain('Saskatchewan<span');
    expect(implementationSources).not.toContain('footer-logo');
    expect(packageJson.dependencies['pdf-lib']).toBeUndefined();
  });

  it('discloses sensitive child, provider, and respite-worker data and worksheet status', () => {
    expect(privacySource).toContain('diagnosis date');
    expect(privacySource).toContain('diagnosis notes or other health details');
    expect(privacySource).toContain('Private/custom provider information');
    expect(privacySource).toContain('Respite-worker information');
    expect(privacySource).toContain('<strong>Health</strong>');
    expect(privacySource).toContain('<strong>Sensitive Info</strong>');
    expect(privacySource).toContain('relationship to your family');
    expect(privacySource).toContain('relationship');
    expect(privacySource).toContain('notes');
    expect(privacySource).toContain('unbranded Autism Fund Tracker');
    expect(privacySource).not.toContain('pre-fill Saskatchewan');
    expect(privacySource).not.toContain('Google Maps Platform');
    expect(privacySource).not.toContain('geocoding and driving-distance');
    expect(privacySource).toContain('Mileage distance is entered manually');

    expect(supportSource).toContain('unbranded Autism Fund Tracker worksheet');
    expect(supportSource).toContain('not a government form, claim, application, approval, or official submission');
    expect(supportSource).toContain('Open the official Saskatchewan mileage form');
    expect(supportSource).toContain('Open the official Saskatchewan respite form');
    expect(supportSource).toContain('does not embed, alter, or');
  });
});
