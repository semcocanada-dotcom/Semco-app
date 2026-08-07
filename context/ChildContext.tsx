import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@lib/supabase';
import { ACTIVE_CHILD_STORAGE_KEY } from '@lib/localStorageKeys';
import type { Child } from '@lib/types';
import { useAuth } from './AuthContext';

interface ChildContextValue {
  children: Child[];
  activeChild: Child | null;
  setActiveChild: (child: Child) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

const ChildContext = createContext<ChildContextValue>({
  children: [],
  activeChild: null,
  setActiveChild: () => {},
  loading: true,
  refetch: async () => {},
});

export function ChildProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [childList, setChildList] = useState<Child[]>([]);
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data } = await db.children()
      .select('*')
      .order('created_at', { ascending: true });

    const list = (data ?? []) as Child[];
    setChildList(list);

    // Restore last active child from storage
    const savedId = await AsyncStorage.getItem(ACTIVE_CHILD_STORAGE_KEY);
    const restored = list.find((c) => c.id === savedId) ?? list[0] ?? null;
    setActiveChildState(restored);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (!session) {
      // Do not retain the previous account's child records in memory after
      // sign-out or permanent account deletion.
      setChildList([]);
      setActiveChildState(null);
      setLoading(false);
      return;
    }
    fetchChildren();
  }, [fetchChildren, session]);

  async function setActiveChild(child: Child) {
    setActiveChildState(child);
    await AsyncStorage.setItem(ACTIVE_CHILD_STORAGE_KEY, child.id);
  }

  return (
    <ChildContext.Provider
      value={{
        children: childList,
        activeChild,
        setActiveChild,
        loading,
        refetch: fetchChildren,
      }}
    >
      {reactChildren}
    </ChildContext.Provider>
  );
}

export function useChild() {
  return useContext(ChildContext);
}
