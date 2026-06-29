import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Linking } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { ChildProvider } from '@context/ChildContext';
import { supabase } from '@lib/supabase';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { loading } = useAuth();

  // Hide the native splash once auth has resolved (or after a 5s safety cap).
  // Routing is handled declaratively by app/index.tsx via <Redirect>, so we
  // never call navigation imperatively before the root layout is mounted —
  // that race was crashing the production build on launch.
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
      return;
    }
    const t = setTimeout(() => { SplashScreen.hideAsync().catch(() => {}); }, 5000);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (__DEV__) return;
    async function applyUpdateIfAvailable() {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch {}
    }
    applyUpdateIfAvailable();
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        applyUpdateIfAvailable();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    // Handle OAuth deep-link callback — extracts tokens from URL fragment
    async function handleUrl({ url }: { url: string }) {
      const fragment = url.split('#')[1] ?? url.split('?')[1] ?? '';
      const params = Object.fromEntries(new URLSearchParams(fragment));
      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      }
    }
    const sub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then(url => { if (url) handleUrl({ url }); });
    return () => sub.remove();
  }, []);

  return (
    <AuthProvider>
      <ChildProvider>
        <RootNavigator />
      </ChildProvider>
    </AuthProvider>
  );
}
