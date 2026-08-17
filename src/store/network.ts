import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  syncPending: boolean;
  setOnline: (online: boolean) => void;
  setSyncPending: (pending: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  syncPending: false,
  setOnline: (isOnline) => set({ isOnline }),
  setSyncPending: (syncPending) => set({ syncPending }),
}));
