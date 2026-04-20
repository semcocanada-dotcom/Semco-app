export const Colors = {
  // Backgrounds
  bg: '#FAF8FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F0FF',
  border: '#E8E4F3',

  // Primary brand
  purple: '#7C5CFC',
  purpleLight: '#9B6DFF',
  blue: '#3B82F6',
  blueLight: '#4F8EF7',
  teal: '#14B8A6',
  tealLight: '#2DD4BF',
  coral: '#F97316',
  coralLight: '#FF8A65',
  green: '#10B981',
  greenLight: '#34D399',
  amber: '#F59E0B',
  amberLight: '#FBBF24',

  // Text
  textPrimary: '#1E1B4B',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Budget ring — purple = available, grey = spent, amber = pending
  ringSpent: '#C4C4C4',
  ringPending: '#FBBF24',
  ringTrack: '#7C5CFC',

  // Gradient pairs [start, end] for LinearGradient
  gradients: {
    purple: ['#9B6DFF', '#7C5CFC'] as const,
    blue:   ['#4F8EF7', '#3B82F6'] as const,
    teal:   ['#2DD4BF', '#14B8A6'] as const,
    coral:  ['#FF8A65', '#F97316'] as const,
    green:  ['#34D399', '#10B981'] as const,
    amber:  ['#FBBF24', '#F59E0B'] as const,
  },
} as const;
