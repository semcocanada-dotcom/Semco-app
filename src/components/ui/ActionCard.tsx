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
  style?: ViewStyle;
}

export function ActionCard({ title, description, icon, onPress, tone = 'neutral', style }: ActionCardProps) {
  const iconColor = tone === 'accent' ? Colors.semcoOrange : tone === 'primary' ? Colors.primary : Colors.lightTeal;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, styles[`tone_${tone}`], style]}>
      <View style={[styles.iconWrap, styles[`icon_${tone}`]]}>
        <Ionicons
          name={icon}
          size={24}
          color={iconColor}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
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
  icon_primary: { backgroundColor: Colors.primaryMuted, borderColor: '#C6EEF0' },
  icon_accent: { backgroundColor: Colors.accentMuted, borderColor: '#F5CBBB' },
  icon_neutral: { backgroundColor: '#E8FAFB', borderColor: '#CBEFF2' },
  title: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.medium,
    lineHeight: Typography.size.xs * 1.25,
    textAlign: 'center',
  },
});
