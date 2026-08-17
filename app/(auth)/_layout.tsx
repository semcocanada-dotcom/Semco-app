import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

export default function AuthLayout() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(app)/assistant');
  }, [router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
