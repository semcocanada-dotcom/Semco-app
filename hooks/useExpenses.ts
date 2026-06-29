import { useState, useEffect, useCallback } from 'react';
import { db } from '@lib/supabase';
import type { Expense } from '@lib/types';

export function useRecentExpenses(childId: string | null, limit = 5) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!childId) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await db.expenses()
        .select('*, providers(name, category)')
        .eq('child_id', childId)
        .order('expense_date', { ascending: false })
        .limit(limit);
      setExpenses((data ?? []) as Expense[]);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [childId, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { expenses, loading, refetch };
}
