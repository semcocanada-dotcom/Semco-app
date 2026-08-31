import { act, renderHook } from '@testing-library/react-native';
import { type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView } from 'react-native';
import { useModalScrollRestoration } from '@/hooks/useModalScrollRestoration';

function scrollEvent(y: number): NativeSyntheticEvent<NativeScrollEvent> {
  return { nativeEvent: { contentOffset: { x: 0, y } } } as NativeSyntheticEvent<NativeScrollEvent>;
}

describe('useModalScrollRestoration', () => {
  it('restores the offset captured before a modal changes the underlying scroll position', () => {
    const scrollTo = jest.fn();
    const { result } = renderHook(() => useModalScrollRestoration());
    result.current.scrollViewRef.current = { scrollTo } as unknown as ScrollView;

    act(() => result.current.onScroll(scrollEvent(1180)));
    act(() => result.current.captureScrollPosition());
    act(() => result.current.onScroll(scrollEvent(0)));
    act(() => result.current.restoreScrollPosition());

    expect(scrollTo).toHaveBeenCalledWith({ y: 1180, animated: false });
  });
});
