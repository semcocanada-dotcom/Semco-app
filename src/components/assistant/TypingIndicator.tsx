import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  type SharedValue,
  Easing,
} from 'react-native-reanimated';
import { Colors, Fonts, Spacing, Radius, Typography } from '@/constants/theme';

export function TypingIndicator() {
  const opacity1 = useSharedValue(0.4);
  const opacity2 = useSharedValue(0.4);
  const opacity3 = useSharedValue(0.4);

  useEffect(() => {
    const animateDot = (opacity: SharedValue<number>, delayMs: number) => {
      opacity.value = withDelay(
        delayMs,
        withRepeat(
          withSequence(
            withTiming(1, {
              duration: 300,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(0.4, {
              duration: 300,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          false,
        ),
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
        <View style={styles.iconWrap}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Ask Semco is checking the manuals</Text>
          <Text style={styles.body}>Reading approved docs before answering.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: Spacing.base, marginVertical: Spacing.xs, alignItems: 'flex-start' },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
    shadowColor: Colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  copy: { gap: 2 },
  title: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
  },
});
