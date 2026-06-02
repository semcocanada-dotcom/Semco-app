import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  noPadding?: boolean;
}

export function Card({ children, style, elevated = false, noPadding = false }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        elevated && styles.elevated,
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
  },
  noPadding: {
    padding: 0,
  },
});
