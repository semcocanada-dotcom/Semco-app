import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/auth';
import { initDatabase } from '@/database/client';
import { seedDatabase } from '@/database/seed';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    // Initialize local SQLite and seed product data
    initDatabase().then(() => seedDatabase()).catch(console.error);

    // Restore Supabase session
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
