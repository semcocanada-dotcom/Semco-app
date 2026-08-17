import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function AuthLayout() {
  const { session, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && session) {
      router.replace('/(app)/assistant');
    }
  }, [session, isInitialized, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
