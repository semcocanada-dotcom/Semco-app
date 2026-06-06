import React from 'react';
import { Image } from 'react-native';

interface AppLogoProps {
  size?: number;
  // Kept for compatibility; the brand mark is navy and used on light surfaces.
  variant?: 'dark' | 'light';
}

// The brand mark (navy A + rainbow) exported directly from the supplied logo.
const MARK = require('../assets/logo-mark.png');

export function AppLogo({ size = 40 }: AppLogoProps) {
  return (
    <Image
      source={MARK}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
