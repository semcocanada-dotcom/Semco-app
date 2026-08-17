import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  primary: { backgroundColor: Colors.primaryMuted },
  success: { backgroundColor: Colors.successMuted },
  warning: { backgroundColor: Colors.offlineAmberMuted },
  danger: { backgroundColor: Colors.dangerMuted },
  neutral: { backgroundColor: Colors.surfaceElevated },

  text_primary: { color: Colors.primary },
  text_success: { color: Colors.success },
  text_warning: { color: Colors.offlineAmber },
  text_danger: { color: Colors.danger },
  text_neutral: { color: Colors.textSecondary },
});
