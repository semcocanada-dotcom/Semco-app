import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

interface TabControlProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  style?: ViewStyle;
}

export function TabControl<T extends string>({ value, options, onChange, style }: TabControlProps<T>) {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.78}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: 4,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryMuted,
  },
  item: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  itemActive: {
    backgroundColor: Colors.white,
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
  },
  labelActive: {
    color: Colors.semcoOrange,
  },
});
