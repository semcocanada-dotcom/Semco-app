import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { ChildProvider } from '@context/ChildContext';
import { supabase } from '@lib/supabase';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading } = useAuth();

  // Fallback: if loading hangs for >5s, force-hide splash and go to login
  useEffect(() => {
    if (loading) {
      const t = setTimeout(async () => {
        try { await SplashScreen.hideAsync(); } catch (_) {}
        router.replace('/(auth)/login');
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      (async () => {
        try { await SplashScreen.hideAsync(); } catch (_) {}
        try {
          router.replace(session ? '/(tabs)' : '/(auth)/login');
        } catch (_) {}
      })();
    }
  }, [session, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
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
