import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '@/constants/theme';

export function TypingIndicator() {
  const opacity1 = useSharedValue(0.4);
  const opacity2 = useSharedValue(0.4);
  const opacity3 = useSharedValue(0.4);

  useEffect(() => {
    const animateDot = (opacity: Animated.Shared<number>, delay: number) => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(delay, {
            duration: 0,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.4, {
            duration: 300,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.4, {
            duration: 600,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
      );
    };

    animateDot(opacity1, 0);
    animateDot(opacity2, 150);
    animateDot(opacity3, 300);
  }, [opacity1, opacity2, opacity3]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: opacity1.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: opacity2.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: opacity3.value,
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: Spacing.base, marginVertical: Spacing.xs, alignItems: 'flex-start' },
  bubble: {
    flexDirection: 'row',
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
  },
});
