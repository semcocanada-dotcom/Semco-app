import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { ChildProvider } from '@context/ChildContext';

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

  // No deep-link token handler: the app has no OAuth/magic-link flow, and
  // accepting access/refresh tokens from arbitrary URLs would let a crafted
  // link silently swap this device onto an attacker's session.

  return (
    <AuthProvider>
      <ChildProvider>
        <RootNavigator />
      </ChildProvider>
    </AuthProvider>
  );
}
