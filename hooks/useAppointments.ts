import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@lib/supabase';
import type { Appointment } from '@lib/types';

export function useAppointments(childId: string | null) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!childId) { setAppointments([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*, providers(name, category)')
      .eq('child_id', childId)
      .order('scheduled_at', { ascending: true });
    setAppointments((data ?? []) as Appointment[]);
    setLoading(false);
  }, [childId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { appointments, loading, refetch };
}
