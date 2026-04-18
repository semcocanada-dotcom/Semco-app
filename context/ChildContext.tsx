import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '@lib/supabase';
import type { Child } from '@lib/types';
import { useAuth } from './AuthContext';

const ACTIVE_CHILD_KEY = 'semco:activeChildId';

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

  async function fetchChildren() {
    if (!session) return;
    setLoading(true);
    const { data } = await db.children()
      .select('*')
      .order('created_at', { ascending: true });

    const list = (data ?? []) as Child[];
    setChildList(list);

    // Restore last active child from storage
    const savedId = await AsyncStorage.getItem(ACTIVE_CHILD_KEY);
    const restored = list.find((c) => c.id === savedId) ?? list[0] ?? null;
    setActiveChildState(restored);
    setLoading(false);
  }

  useEffect(() => {
    fetchChildren();
  }, [session]);

  async function setActiveChild(child: Child) {
    setActiveChildState(child);
    await AsyncStorage.setItem(ACTIVE_CHILD_KEY, child.id);
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
