import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Typography, Spacing, Radius } from '@/constants/theme';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  tone?: 'primary' | 'accent' | 'neutral';
  compact?: boolean;
  premium?: boolean;
  style?: ViewStyle;
}

export function ActionCard({ title, description, icon, onPress, tone = 'neutral', compact = false, premium = false, style }: ActionCardProps) {
  const iconColor = tone === 'accent' ? Colors.semcoOrange : Colors.darkTeal;
  const iconSize = premium ? 30 : compact ? 20 : 24;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, compact && styles.cardCompact, premium && styles.cardPremium, styles[`tone_${tone}`], style]}
    >
      <View style={[styles.iconWrap, compact && styles.iconWrapCompact, premium && styles.iconWrapPremium, styles[`icon_${tone}`]]}>
        <Ionicons
          name={icon}
          size={iconSize}
          color={iconColor}
        />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact, premium && styles.titlePremium]}>{title}</Text>
      <Text style={[styles.description, compact && styles.descriptionCompact, premium && styles.descriptionPremium]}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cardCompact: {
    minHeight: 82,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  cardPremium: {
    minHeight: 122,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
    borderRadius: Radius.xl,
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  tone_primary: { borderColor: Colors.primaryMuted },
  tone_accent: { borderColor: Colors.accentMuted },
  tone_neutral: {},
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapCompact: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
  },
  iconWrapPremium: {
    width: 54,
    height: 54,
    borderRadius: Radius.md,
    marginBottom: 3,
  },
  icon_primary: { backgroundColor: Colors.primaryMuted, borderColor: '#C6EEF0' },
  icon_accent: { backgroundColor: Colors.accentMuted, borderColor: '#F5CBBB' },
  icon_neutral: { backgroundColor: Colors.primaryMuted, borderColor: '#C6EEF0' },
  title: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: Typography.size.xs,
  },
  titlePremium: {
    fontSize: Typography.size.md,
    lineHeight: Typography.size.md * 1.15,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.medium,
    lineHeight: Typography.size.xs * 1.25,
    textAlign: 'center',
  },
  descriptionCompact: {
    fontSize: 10,
    lineHeight: 12,
  },
  descriptionPremium: {
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.25,
  },
});
