import { act, renderHook } from '@testing-library/react-native';
import { InteractionManager, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView } from 'react-native';
import { useModalScrollRestoration } from '@/hooks/useModalScrollRestoration';

function scrollEvent(y: number): NativeSyntheticEvent<NativeScrollEvent> {
  return { nativeEvent: { contentOffset: { x: 0, y } } } as NativeSyntheticEvent<NativeScrollEvent>;
}

describe('useModalScrollRestoration', () => {
  it('restores the offset captured before a modal changes the underlying scroll position', () => {
    const interaction = jest.spyOn(InteractionManager, 'runAfterInteractions')
      .mockImplementation(((callback: () => void) => {
        callback();
        return { cancel: jest.fn() };
      }) as unknown as typeof InteractionManager.runAfterInteractions);
    const animationFrame = jest.spyOn(global, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      });
    const scrollTo = jest.fn();
    const { result } = renderHook(() => useModalScrollRestoration());
    result.current.scrollViewRef.current = { scrollTo } as unknown as ScrollView;

    act(() => result.current.onScroll(scrollEvent(1180)));
    act(() => result.current.captureScrollPosition());
    act(() => result.current.onScroll(scrollEvent(0)));
    act(() => result.current.restoreScrollPosition());

    expect(scrollTo).toHaveBeenCalledWith({ y: 1180, animated: false });

    interaction.mockRestore();
    animationFrame.mockRestore();
  });
});
