import type { Expense, ExpenseStatus } from './types';

/**
 * The remote database still uses its original expense_status enum. Keep that
 * storage value for compatibility, but present every user-entered, non-excluded
 * item as a neutral record rather than as a government decision.
 */
export const RECORDED_EXPENSE_STORAGE_STATUS: ExpenseStatus = 'approved';

const RECORDED_PRESENTATION = {
  bg: '#F0FDF4',
  text: '#15803D',
  label: 'Recorded',
} as const;

const EXCLUDED_PRESENTATION = {
  bg: '#FFF1F2',
  text: '#BE123C',
  label: 'Excluded',
} as const;

export function isRecordedExpense(
  expense: Pick<Expense, 'status'>,
): boolean {
  return expense.status !== 'rejected';
}

export function expenseRecordPresentation(status: ExpenseStatus) {
  return status === 'rejected'
    ? EXCLUDED_PRESENTATION
    : RECORDED_PRESENTATION;
}

export function totalRecordedExpenses(
  expenses: readonly Pick<Expense, 'status' | 'amount'>[],
): number {
  return expenses
    .filter(isRecordedExpense)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
}
