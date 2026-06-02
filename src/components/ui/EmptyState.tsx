import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Typography, Spacing, Radius } from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  body?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: ViewStyle;
}

export function EmptyState({ title, body, icon = 'information-circle-outline', style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
  },
  body: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
    textAlign: 'center',
  },
});
