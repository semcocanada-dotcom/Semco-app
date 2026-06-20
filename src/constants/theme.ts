export const Colors = {
  darkTeal: '#008E90',
  lightTeal: '#05BAC2',
  semcoOrange: '#CF451F',
  navy: '#00232D',
  softGrey: '#F2F4F7',
  white: '#FFFFFF',
  background: '#008E90',
  appBackground: '#F2F4F7',
  surface: '#FFFFFF',
  surfaceElevated: '#F8FBFC',
  border: '#DDE7EA',
  primary: '#008E90',
  primaryMuted: '#DDF4F5',
  accent: '#CF451F',
  accentMuted: '#FCE5DE',
  textPrimary: '#00232D',
  textSecondary: '#537179',
  textDisabled: '#8CA2A8',
  danger: '#F15B5B',
  dangerMuted: '#FCE3E3',
  success: '#2A8C63',
  successMuted: '#E1F1EA',
  offlineAmber: '#B86F18',
  offlineAmberMuted: '#FFF1D9',
  overlay: 'rgba(0,0,0,0.68)',
} as const;

export const Fonts = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  fallback: undefined,
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

export const Layout = {
  screenMaxWidth: 760,
  tabBarMaxWidth: 640,
  colorGridMaxWidth: 560,
  colorTileMax: 68,
} as const;
