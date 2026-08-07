import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');
const read = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const expenseScreen = read('app', '(tabs)', 'expenses.tsx');
const expenseItem = read('components', 'ExpenseListItem.tsx');
const reportsScreen = read('app', '(tabs)', 'reports.tsx');
const expenseRecordState = read('lib', 'expenseRecordState.ts');
const mileageScreen = read('app', '(tabs)', 'mileage.tsx');
const dashboardScreen = read('app', '(tabs)', 'index.tsx');
const profileScreen = read('app', '(tabs)', 'profile.tsx');
const privacyPage = read('docs', 'index.html');
const supportPage = read('docs', 'support.html');
const submitTombstone = read('supabase', 'functions', 'submit-claim', 'index.ts');

describe('App Review release scope', () => {
  it('keeps the retired email endpoint as a network-free tombstone', () => {
    expect(submitTombstone).toContain('status: 410');
    expect(submitTombstone).toContain('does not send government submissions');
    expect(submitTombstone).not.toMatch(/fetch\s*\(/);
    expect(submitTombstone).not.toMatch(/resend|GOVT_EMAIL|RESEND_API_KEY|monthly_claims|createClient/i);
  });

  it('uses neutral expense-record terminology in every expense surface', () => {
    const expenseSurfaces = [expenseScreen, expenseItem, reportsScreen, expenseRecordState].join('\n');
    expect(expenseSurfaces).toContain('Recorded');
    expect(expenseSurfaces).toContain('Excluded');
    expect(expenseSurfaces).not.toMatch(/\b(Approved|Pending|Submitted|Rejected)\b/);
    expect(expenseScreen).not.toContain("status:          'approved'");
  });

  it('does not expose a submission feature or visible legacy records wording', () => {
    expect(fs.existsSync(path.join(root, 'app', '(tabs)', 'claims.tsx'))).toBe(false);
    expect(profileScreen).not.toMatch(/\bclaims?\b/i);
    expect(privacyPage).not.toMatch(/\bclaims?\b/i);
    expect(supportPage).not.toMatch(/\bclaims?\b/i);
    expect(privacyPage).not.toContain('organize the child&rsquo;s eligibility');
  });

  it('uses current ministry guidance and non-guaranteed mileage copy', () => {
    expect(dashboardScreen).toContain('Ministry of Social Services');
    expect(dashboardScreen).not.toContain('Saskatchewan Education');
    expect(mileageScreen).not.toContain('and get reimbursed');
    expect(mileageScreen).toContain('Recorded Mileage Estimate');
    expect(supportPage).toContain('do not determine');
    expect(supportPage).toContain('guarantee payment');
  });
});
