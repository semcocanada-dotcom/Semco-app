import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Typography, Spacing } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, subtitle, actionLabel, onActionPress, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <TouchableOpacity onPress={onActionPress} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  copy: { flex: 1, gap: 4 },
  title: { color: Colors.navy, fontSize: Typography.size.lg, fontFamily: Fonts.bold, fontWeight: Typography.weight.bold },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.regular, lineHeight: Typography.size.sm * 1.45 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: Colors.semcoOrange, fontSize: Typography.size.sm, fontFamily: Fonts.semibold, fontWeight: Typography.weight.semibold },
});
