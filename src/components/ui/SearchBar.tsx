import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Typography, TAP_TARGET_MIN } from '@/constants/theme';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  containerStyle?: ViewStyle;
}

export function SearchBar({ containerStyle, ...rest }: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
      <TextInput
        {...rest}
        style={styles.input}
        placeholderTextColor={Colors.textDisabled}
        selectionColor={Colors.darkTeal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: TAP_TARGET_MIN,
    color: Colors.navy,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.sm,
  },
});
