import { AppState, AppStateStatus } from 'react-native';
import * as Network from 'expo-network';

export interface NetworkStatus {
  isOnline: boolean;
  type: Network.NetworkStateType;
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  const state = await Network.getNetworkStateAsync();
  return {
    isOnline: state.isConnected === true && state.isInternetReachable === true,
    type: state.type ?? Network.NetworkStateType.UNKNOWN,
  };
}

// expo-network v6 has no event listener — subscribe via AppState changes instead.
export function subscribeToNetworkChanges(
  callback: (status: NetworkStatus) => void,
): () => void {
  const handleAppStateChange = async (nextState: AppStateStatus) => {
    if (nextState === 'active') {
      const status = await getNetworkStatus();
      callback(status);
    }
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription.remove();
}
