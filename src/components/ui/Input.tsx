import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  suffix?: string;
}

export function Input({ label, error, hint, containerStyle, suffix, style, ...rest }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, suffix ? styles.inputWithSuffix : null, style]}
          placeholderTextColor={Colors.textDisabled}
          selectionColor={Colors.primary}
          {...rest}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    minHeight: TAP_TARGET_MIN,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
  },
  inputError: { borderColor: Colors.danger },
  inputWithSuffix: { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  suffix: {
    minHeight: TAP_TARGET_MIN,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
    borderTopRightRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    color: Colors.textSecondary,
    fontSize: Typography.size.base,
    lineHeight: TAP_TARGET_MIN,
  },
  error: { color: Colors.danger, fontSize: Typography.size.sm },
  hint: { color: Colors.textSecondary, fontSize: Typography.size.sm },
});
