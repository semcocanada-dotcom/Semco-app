import { useEffect } from 'react';
import { useNetworkStore } from '@/store/network';
import { subscribeToNetworkChanges, getNetworkStatus } from '@/services/sync/status';

export function useNetworkStatus() {
  const { isOnline, setOnline } = useNetworkStore();

  useEffect(() => {
    // Set initial status
    getNetworkStatus()
      .then((status) => setOnline(status.isOnline))
      .catch(console.error);

    // Subscribe to changes
    const unsubscribe = subscribeToNetworkChanges((status) => {
      setOnline(status.isOnline);
    });

    return unsubscribe;
  }, [setOnline]);

  return isOnline;
}
