import { useCallback, useSyncExternalStore } from 'react';
import { tenderReviewStub } from '@/services/tender-review';

export function useTenderReviewVersion(): number {
  return useSyncExternalStore(
    tenderReviewStub.subscribe,
    tenderReviewStub.getVersion,
    tenderReviewStub.getVersion,
  );
}

export function useTenderOwner(userId: string | null): boolean {
  const getSnapshot = useCallback(() => tenderReviewStub.isOwner(userId), [userId]);
  return useSyncExternalStore(tenderReviewStub.subscribe, getSnapshot, getSnapshot);
}
