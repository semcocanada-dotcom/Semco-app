import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@constants/colors';

type Accent = 'blue' | 'teal' | 'green';

const ACCENTS: Record<Accent, string> = {
  blue:  '#2563EB',
  teal:  '#14B8A6',
  green: '#22C55E',
};

interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  accent: Accent;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

function formatCAD(amount: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function StatCard({ label, value, subLabel, accent, icon, onPress }: StatCardProps) {
  const color = ACCENTS[accent];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && onPress ? { opacity: 0.85 } : null]}
    >
      {/* Wavy decorative fill at the bottom (10% accent) */}
      <Svg width="100%" height={46} viewBox="0 0 120 46" style={s.wave} preserveAspectRatio="none">
        <Path
          d="M0 22 C 22 6, 40 38, 62 22 S 102 6, 120 20 L120 46 L0 46 Z"
          fill={color}
          fillOpacity={0.1}
        />
      </Svg>

      <View style={[s.iconCircle, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text style={[s.label, { color }]}>{label}</Text>
      <Text style={s.value}>{value}</Text>
      {subLabel ? <Text style={s.sub}>{subLabel}</Text> : null}

      <View style={s.chevron}>
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    minHeight: 116,
    overflow: 'hidden',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  wave:        { position: 'absolute', left: 0, right: 0, bottom: 0 },
  iconCircle:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  label:       { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  value:       { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginTop: 4, letterSpacing: -0.5 },
  sub:         { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  chevron:     {
    position: 'absolute', right: 10, bottom: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 1,
  },
});

export { formatCAD };
