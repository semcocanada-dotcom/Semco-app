import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius, Spacing, TAP_TARGET_MIN } from '@/constants/theme';
import type { Color } from '@/database/schema/colors';

interface ColorTileProps {
  color: Color;
  onPress: () => void;
  size: number;
  style?: ViewStyle;
}

function getSwatchColor(color: Color): string {
  if (color.swatchHex && /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color.swatchHex)) {
    return color.swatchHex;
  }
  return Colors.softGrey;
}

export function ColorTile({ color, onPress, size, style }: ColorTileProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`Color ${color.name}${color.code ? `, ${color.code}` : ''}`}
      onPress={onPress}
      style={[styles.container, { width: size, minHeight: Math.max(size, TAP_TARGET_MIN) }, style]}
    >
      <View style={[styles.sample, { height: Math.max(size * 1.06, TAP_TARGET_MIN) }]}>
        {color.photoUrl ? (
          <Image source={{ uri: color.photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={160} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: getSwatchColor(color) }]} />
        )}
        {!color.isStandard ? <View style={styles.customDot} /> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
  },
  sample: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.softGrey,
  },
  customDot: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.semcoOrange,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
