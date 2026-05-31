import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

type StatTone = 'primary' | 'accent' | 'success' | 'neutral';

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone?: StatTone;
  style?: ViewStyle;
}

export function StatCard({ label, value, detail, icon, tone = 'neutral', style }: StatCardProps) {
  return (
    <View style={[styles.card, styles[`tone_${tone}`], style]}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon}
          size={18}
          color={tone === 'accent' ? Colors.accent : tone === 'primary' ? Colors.primary : Colors.textSecondary}
        />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 110,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    gap: 6,
  },
  tone_primary: { borderColor: Colors.primaryMuted },
  tone_accent: { borderColor: Colors.accentMuted },
  tone_success: { borderColor: Colors.successMuted },
  tone_neutral: {},
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
  label: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontWeight: Typography.weight.medium },
  detail: { color: Colors.textDisabled, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.4 },
});
