import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandMark } from '@/components/brand/BrandMark';
import { Colors, Fonts, Typography, Spacing, TAP_TARGET_MIN } from '@/constants/theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onRightPress?: () => void;
  style?: ViewStyle;
}

export function AppHeader({
  title,
  subtitle,
  showBrand = false,
  rightIcon = 'notifications-outline',
  onRightPress,
  style,
}: AppHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.copy}>
        {showBrand ? <BrandMark compact /> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity
        onPress={onRightPress}
        activeOpacity={0.75}
        style={styles.iconButton}
        accessibilityLabel="Header action"
      >
        <Ionicons name={rightIcon} size={22} color={Colors.navy} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  copy: { flex: 1, gap: 4 },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  iconButton: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TAP_TARGET_MIN / 2,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
