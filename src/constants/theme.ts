export const Colors = {
  background: '#06090B',
  surface: '#0F1518',
  surfaceElevated: '#162024',
  border: '#233036',
  primary: '#2ED0C6',
  primaryMuted: '#12383A',
  accent: '#FF8A2B',
  accentMuted: '#4A240C',
  textPrimary: '#F7FBFC',
  textSecondary: '#9AA8AF',
  textDisabled: '#60737C',
  danger: '#F15B5B',
  dangerMuted: '#5E1A1A',
  success: '#50C98A',
  successMuted: '#173B2A',
  offlineAmber: '#F0A64F',
  offlineAmberMuted: '#4B2C08',
  overlay: 'rgba(0,0,0,0.68)',
} as const;

export const Typography = {
  size: {
    xs: 11,
    sm: 13,
    base: 16,
    md: 18,
    lg: 22,
    xl: 26,
    xxl: 32,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const TAP_TARGET_MIN = 48;
