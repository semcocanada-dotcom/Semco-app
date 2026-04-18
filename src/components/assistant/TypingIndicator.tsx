import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

export function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ]),
      ).start();

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.bubble}>
        {[dot1, dot2, dot3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY: anim }] }]}
          />
        ))}
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
