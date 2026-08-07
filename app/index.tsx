import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function Index() {
  const session = useAuthStore((state) => state.session);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) return null;
  return <Redirect href={(session ? '/dashboard' : '/login') as any} />;
}
