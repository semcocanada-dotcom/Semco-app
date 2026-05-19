import { useState, useEffect, useCallback } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { db } from '@lib/supabase';
import type { BudgetSummary, FundingYear } from '@lib/types';

const EMPTY_SUMMARY: BudgetSummary = {
  totalBudget: 8000,
  totalSpent: 0,
  totalPending: 0,
  totalMileage: 0,
  remaining: 8000,
  daysRemaining: 0,
  fundingYear: null,
};

export function useBudget(childId: string | null) {
  const [summary, setSummary] = useState<BudgetSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!childId) {
      setSummary(EMPTY_SUMMARY);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data: yearData } = await db.fundingYears()
        .select('*')
        .eq('child_id', childId)
        .eq('is_active', true)
        .single();

      const fundingYear = yearData as FundingYear | null;

      if (!fundingYear) {
        setSummary({ ...EMPTY_SUMMARY, fundingYear: null });
        return;
      }

      const [expensesRes, mileageRes] = await Promise.all([
        db.expenses()
          .select('amount, status')
          .eq('child_id', childId)
          .eq('funding_year_id', fundingYear.id)
          .neq('status', 'rejected'),
        db.mileageLogs()
          .select('reimbursement_amount')
          .eq('child_id', childId)
          .eq('funding_year_id', fundingYear.id),
      ]);

      const expenses = expensesRes.data ?? [];
      const mileageLogs = mileageRes.data ?? [];

      const totalSpent = expenses
        .filter((e) => e.status === 'approved')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const totalPending = expenses
        .filter((e) => e.status === 'pending' || e.status === 'submitted')
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const totalMileage = mileageLogs.reduce(
        (sum, m) => sum + Number(m.reimbursement_amount),
        0,
      );

      const totalBudget = Number(fundingYear.total_budget);
      const remaining = totalBudget - totalSpent - totalPending - totalMileage;
      const daysRemaining = Math.max(
        0,
        differenceInDays(parseISO(fundingYear.end_date), new Date()),
      );

      setSummary({
        totalBudget,
        totalSpent,
        totalPending,
        totalMileage,
        remaining,
        daysRemaining,
        fundingYear,
      });
    } catch {
      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { summary, loading, refetch };
}
