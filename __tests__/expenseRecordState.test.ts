import {
  expenseRecordPresentation,
  isRecordedExpense,
  RECORDED_EXPENSE_STORAGE_STATUS,
  totalRecordedExpenses,
} from '@lib/expenseRecordState';
import type { ExpenseStatus } from '@lib/types';

const expense = (status: ExpenseStatus, amount: number) => ({ status, amount });

describe('neutral expense record states', () => {
  it('presents every retained legacy status as a user record, not a decision', () => {
    for (const status of ['pending', 'submitted', 'approved'] as const) {
      expect(expenseRecordPresentation(status).label).toBe('Recorded');
      expect(isRecordedExpense(expense(status, 1))).toBe(true);
    }

    expect(expenseRecordPresentation('rejected').label).toBe('Excluded');
    expect(isRecordedExpense(expense('rejected', 1))).toBe(false);
    expect(expenseRecordPresentation(RECORDED_EXPENSE_STORAGE_STATUS).label).toBe('Recorded');
  });

  it('preserves budget arithmetic by counting all non-excluded legacy rows', () => {
    const rows = [
      expense('approved', 100),
      expense('pending', 25.5),
      expense('submitted', 10),
      expense('rejected', 999),
    ];

    expect(totalRecordedExpenses(rows)).toBe(135.5);
  });
});
