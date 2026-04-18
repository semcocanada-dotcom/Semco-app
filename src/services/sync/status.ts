import * as Network from 'expo-network';

export interface NetworkStatus {
  isOnline: boolean;
  type: Network.NetworkStateType;
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  const state = await Network.getNetworkStateAsync();
  return {
    isOnline: state.isConnected === true && state.isInternetReachable === true,
    type: state.type,
  };
}

export function subscribeToNetworkChanges(
  callback: (status: NetworkStatus) => void,
): () => void {
  const subscription = Network.addNetworkStateListener((state) => {
    callback({
      isOnline: state.isConnected === true && state.isInternetReachable === true,
      type: state.type,
    });
  });

  return () => subscription.remove();
}
