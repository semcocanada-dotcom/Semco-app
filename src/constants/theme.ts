export const Colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  border: '#2E2E2E',
  primary: '#C8A96E',        // Semco warm gold — confirm exact brand hex before production
  primaryMuted: '#8A7048',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textDisabled: '#555555',
  danger: '#E53E3E',
  dangerMuted: '#7A1515',
  success: '#38A169',
  successMuted: '#1A5C36',
  offlineAmber: '#F6AD55',
  offlineAmberMuted: '#7A4A10',
  overlay: 'rgba(0,0,0,0.6)',
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

// Minimum tap target: 48×48 dp per WCAG AA
export const TAP_TARGET_MIN = 48;
