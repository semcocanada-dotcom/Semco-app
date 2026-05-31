import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.logoWrap}>
        <Image
          source={require('../../../assets/images/icon.png')}
          style={styles.logo}
          contentFit="contain"
          transition={200}
        />
      </View>
      {!compact ? (
        <View>
          <Text style={styles.brand}>Semco Pro</Text>
          <Text style={styles.sub}>Installer workspace</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compact: { gap: 0 },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 32, height: 32 },
  brand: { color: Colors.textPrimary, fontSize: Typography.size.md, fontWeight: Typography.weight.bold, letterSpacing: 0.2 },
  sub: { color: Colors.textSecondary, fontSize: Typography.size.xs, letterSpacing: 0.6, textTransform: 'uppercase' },
});
