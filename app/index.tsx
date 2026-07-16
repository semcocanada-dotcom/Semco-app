import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/auth';

export default function Index() {
  const session = useAuthStore((state) => state.session);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (Platform.OS === 'web') {
    return <Redirect href={'/portal' as any} />;
  }

  if (!isInitialized) return null;
  return <Redirect href={(session ? '/dashboard' : '/login') as any} />;
}
