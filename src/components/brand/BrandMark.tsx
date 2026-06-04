import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius } from '@/constants/theme';

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={[styles.logoWrap, compact && styles.logoWrapCompact]}>
        <Image
          source={require('../../../assets/images/semco-surfaces-logo.png')}
          style={[styles.logo, compact && styles.logoCompact]}
          contentFit="contain"
          transition={200}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compact: {},
  logoWrap: {
    width: 172,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoWrapCompact: {
    width: 132,
    height: 38,
  },
  logo: { width: 148, height: 34 },
  logoCompact: { width: 112, height: 28 },
});
