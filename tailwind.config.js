/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FAF8FF',
          surface: '#FFFFFF',
          surfaceAlt: '#F3F0FF',
          border: '#E8E4F3',
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
          textPrimary: '#1E1B4B',
          textSecondary: '#6B7280',
          textMuted: '#9CA3AF',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
          ringSpent: '#7C5CFC',
          ringPending: '#FBBF24',
          ringTrack: '#E8E4F3',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
