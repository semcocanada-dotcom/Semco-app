import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');
const read = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const profileSource = read('app', '(tabs)', 'profile.tsx');
const dashboardSource = read('app', '(tabs)', 'index.tsx');
const budgetSource = read('hooks', 'useBudget.ts');
const supportSource = read('docs', 'support.html');
const officialLinksSource = read('lib', 'officialLinks.ts');
const schemaSource = read('supabase', 'schema.sql');
const migrationSource = read(
  'supabase',
  'migrations',
  '20260807140608_require_explicit_funding_amount.sql',
);

describe('non-binding funding estimates', () => {
  it('labels age-based values as editable estimates current as of August 2026', () => {
    expect(profileSource).toContain('Estimate: up to $8,000/year');
    expect(profileSource).toContain('Estimate: up to $6,000/year');
    expect(profileSource).toContain('program information current as of Aug 2026');
    expect(profileSource).toContain('Confirm actual approval and amount with Saskatchewan');
    expect(profileSource).toContain('Edit it to match the amount actually approved');
    expect(profileSource).toContain('SASKATCHEWAN_AUTISM_SERVICES_URL');
    expect(profileSource).toContain('if (age < 0) return null;');
    expect(officialLinksSource).toContain('/autism-services');
  });

  it('does not declare a child ineligible or claim funding has ended based on age', () => {
    expect(profileSource).not.toContain('ineligible');
    expect(profileSource).not.toContain('funding ends at age');
    expect(profileSource).not.toContain('program is for children under 12');
    expect(profileSource).toContain('No automatic ASD-IF amount estimate is shown');
  });

  it('requires an explicit approved amount and has no silent $8,000 fallback', () => {
    expect(profileSource).toContain("const [fyBudget, setFyBudget] = useState('');");
    expect(profileSource).toContain('Grant amount required');
    expect(profileSource).toContain('total_budget: enteredBudget');
    expect(profileSource).not.toContain('parseFloat(fyBudget) || 8000');
    expect(budgetSource).toContain('totalBudget: 0');
    expect(budgetSource).toContain('remaining: 0');
    expect(schemaSource).toContain('total_budget NUMERIC(10,2) NOT NULL,');
    expect(migrationSource).toContain('ALTER COLUMN total_budget DROP DEFAULT');
    expect(dashboardSource).toContain('amount you entered');
  });

  it('explains the estimate and links the official current program source in support', () => {
    expect(supportSource).toContain('editable estimate');
    expect(supportSource).toMatch(/current\s+as of August 2026/);
    expect(supportSource).toContain('not an eligibility or approval decision');
    expect(supportSource).toContain('official Saskatchewan autism services page');
  });
});
