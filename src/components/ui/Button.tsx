import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Fonts, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.78}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost' ? Colors.textPrimary : Colors.white}
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TAP_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },

  primary: { backgroundColor: Colors.semcoOrange },
  accent: { backgroundColor: Colors.semcoOrange },
  secondary: { backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.lightTeal },
  danger: { backgroundColor: Colors.danger },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.lightTeal },

  size_sm: { minHeight: 36, paddingHorizontal: Spacing.md, borderRadius: Radius.sm },
  size_md: { minHeight: TAP_TARGET_MIN, paddingHorizontal: Spacing.lg },
  size_lg: { minHeight: 56, paddingHorizontal: Spacing.xl, borderRadius: Radius.lg },

  text: { fontFamily: Fonts.semibold, fontWeight: Typography.weight.semibold, textAlign: 'center' },
  text_primary: { color: Colors.white },
  text_accent: { color: Colors.white },
  text_secondary: { color: Colors.textPrimary },
  text_danger: { color: Colors.white },
  text_ghost: { color: Colors.primary },

  textSize_sm: { fontSize: Typography.size.sm },
  textSize_md: { fontSize: Typography.size.base },
  textSize_lg: { fontSize: Typography.size.md },
});
