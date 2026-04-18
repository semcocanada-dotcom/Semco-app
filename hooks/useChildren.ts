import { useState, useEffect, useCallback } from 'react';
import { db } from '@lib/supabase';
import type { Child } from '@lib/types';
import { useAuth } from '@context/AuthContext';

export function useChildren() {
  const { session } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data } = await db.children()
      .select('*')
      .order('created_at', { ascending: true });
    setChildren((data ?? []) as Child[]);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { children, loading, refetch };
}
