import { useCallback, useRef } from 'react';
import {
  InteractionManager,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from 'react-native';

/** Preserves a parent ScrollView position while a native modal opens and closes. */
export function useModalScrollRestoration() {
  const scrollViewRef = useRef<ScrollView>(null);
  const currentScrollY = useRef(0);
  const capturedScrollY = useRef(0);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    currentScrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  const captureScrollPosition = useCallback(() => {
    capturedScrollY.current = currentScrollY.current;
  }, []);

  const restoreScrollPosition = useCallback(() => {
    const targetY = capturedScrollY.current;
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ y: targetY, animated: false });
        currentScrollY.current = targetY;
      });
    });
  }, []);

  return {
    scrollViewRef,
    onScroll,
    captureScrollPosition,
    restoreScrollPosition,
  };
}
