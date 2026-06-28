import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Typography, Spacing, Radius } from '@/constants/theme';

type StatTone = 'primary' | 'accent' | 'success' | 'neutral';

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone?: StatTone;
  style?: ViewStyle;
  onPress?: () => void;
}

export function StatCard({ label, value, detail, icon, tone = 'neutral', style, onPress }: StatCardProps) {
  const iconColor = tone === 'accent' ? Colors.semcoOrange : tone === 'primary' ? Colors.primary : Colors.textSecondary;
  const content = (
    <>
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon}
          size={18}
          color={iconColor}
        />
      </View>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {onPress ? <Ionicons name="chevron-forward" size={15} color={iconColor} /> : null}
      </View>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          styles[`tone_${tone}`],
          styles.pressable,
          pressed && styles.pressed,
          style,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, styles[`tone_${tone}`], style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 104,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
  },
  pressable: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },
  tone_primary: { borderColor: '#C9ECEE', backgroundColor: '#E9F8F8' },
  tone_accent: { borderColor: '#F4D0C3', backgroundColor: '#FCECE7' },
  tone_success: { borderColor: Colors.successMuted, backgroundColor: '#EDF7F2' },
  tone_neutral: {},
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { color: Colors.navy, fontSize: Typography.size.xl, fontFamily: Fonts.bold, fontWeight: Typography.weight.bold },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.xs },
  label: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.semibold, fontWeight: Typography.weight.medium },
  detail: { color: Colors.textDisabled, fontSize: Typography.size.xs, fontFamily: Fonts.regular, lineHeight: Typography.size.xs * 1.4 },
});
