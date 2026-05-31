import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  tone?: 'primary' | 'accent' | 'neutral';
  style?: ViewStyle;
}

export function ActionCard({ title, description, icon, onPress, tone = 'neutral', style }: ActionCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, styles[`tone_${tone}`], style]}>
      <View style={styles.iconWrap}>
        <Ionicons
          name={icon}
          size={20}
          color={tone === 'accent' ? Colors.accent : tone === 'primary' ? Colors.primary : Colors.textPrimary}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.ctaRow}>
        <Text style={styles.ctaText}>Open</Text>
        <Ionicons name="arrow-forward" size={14} color={tone === 'accent' ? Colors.accent : Colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 132,
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    gap: 8,
  },
  tone_primary: { borderColor: Colors.primaryMuted, backgroundColor: Colors.surfaceElevated },
  tone_accent: { borderColor: Colors.accentMuted, backgroundColor: Colors.surfaceElevated },
  tone_neutral: {},
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: Colors.textPrimary, fontSize: Typography.size.base, fontWeight: Typography.weight.bold },
  description: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.4, flex: 1 },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ctaText: { color: Colors.primary, fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold },
});
