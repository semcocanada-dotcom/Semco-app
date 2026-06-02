import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';
import type { Color } from '@/database/schema/colors';

interface ColorSwatchProps {
  color: Color;
  onPress?: () => void;
  style?: ViewStyle;
  showCode?: boolean;
}

export function ColorSwatch({ color, onPress, style, showCode = true }: ColorSwatchProps) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.container, style]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Color: ${color.name}`}
    >
      <View style={styles.swatch} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{color.name}</Text>
        {showCode && color.code ? (
          <Text style={styles.code}>{color.code}</Text>
        ) : null}
        {!color.isStandard ? (
          <Text style={styles.customTag}>Custom</Text>
        ) : null}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: TAP_TARGET_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  swatch: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    backgroundColor: Colors.border,
  },
  info: { flex: 1, gap: 2 },
  name: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.medium,
  },
  code: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.regular },
  customTag: { color: Colors.semcoOrange, fontSize: Typography.size.xs, fontFamily: Fonts.semibold, fontWeight: Typography.weight.semibold },
});
