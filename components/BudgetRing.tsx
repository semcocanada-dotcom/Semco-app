import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@constants/colors';

// ─── Arc geometry ─────────────────────────────────────────────────────────────

const W    = 300;
const CX   = W / 2;
const CY   = 150;   // arc baseline (centre)
const BAND_W = 8;

const BANDS = [
  { r: 138, color: '#EF4444' }, // red    — outermost
  { r: 126, color: '#F97316' }, // orange
  { r: 114, color: '#EAB308' }, // yellow
  { r: 102, color: '#22C55E' }, // green
  { r:  90, color: '#3B82F6' }, // blue
  { r:  78, color: '#7C3AED' }, // violet — innermost
];

const DOT_R    = 114; // yellow band — progress badge rides here
const DOT_SIZE = 28;
const SVG_H    = 160;

function arcPath(r: number) {
  // sweep-flag 1 → upward semicircular arch (rainbow shape)
  return `M ${CX - r},${CY} A ${r},${r} 0 0,1 ${CX + r},${CY}`;
}

function dotXY(pct: number) {
  const angle = Math.PI * (1 - Math.min(Math.max(pct, 0), 1));
  return {
    x: CX + DOT_R * Math.cos(angle),
    y: CY - DOT_R * Math.sin(angle),
  };
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
  }).format(n);
}

function pctStr(n: number, total: number) {
  if (!total) return '0%';
  return `${(Math.round((n / total) * 1000) / 10).toFixed(1)}%`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BudgetRingProps {
  totalBudget: number;
  totalSpent:  number;
  remaining:   number;
  yearLabel?:  string;
}

export function BudgetRing({
  totalBudget, totalSpent, remaining, yearLabel,
}: BudgetRingProps) {
  const totalSpentPct = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;
  const dot     = dotXY(totalSpentPct);
  const onTrack = remaining >= 0;

  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withDelay(500, withSpring(1, { damping: 14, stiffness: 160 }));
  }, []);

  const dotAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>🌈  Annual Grant Progress</Text>
        {yearLabel ? <Text style={s.year}>{yearLabel}</Text> : null}
        <View style={[s.totalSpentBadge, { backgroundColor: onTrack ? '#DCFCE7' : '#FEE2E2' }]}>
          <Text style={[s.totalSpentBadgeText, { color: onTrack ? '#15803D' : '#BE123C' }]}>
            {pctStr(totalSpent, totalBudget)} used
          </Text>
        </View>
      </View>

      {/* Rainbow arc */}
      <View style={{ width: W, alignSelf: 'center' }}>
        <Svg width={W} height={SVG_H} viewBox={`0 0 ${W} ${SVG_H}`}>
          {BANDS.map(b => (
            <Path
              key={b.r}
              d={arcPath(b.r)}
              stroke={b.color}
              strokeWidth={BAND_W}
              strokeLinecap="butt"
              fill="none"
              opacity={0.88}
            />
          ))}
        </Svg>

        {/* Progress dot */}
        <Animated.View
          style={[
            s.dot,
            { left: dot.x - DOT_SIZE / 2, top: dot.y - DOT_SIZE / 2 },
            dotAnim,
          ]}
        >
          <Text style={s.dotPct}>{pctStr(totalSpent, totalBudget)}</Text>
          <Text style={s.dotUsed}>used</Text>
        </Animated.View>

        {/* Cloud endpoints */}
        <Cloud left={CX - 138 - 20} />
        <Cloud left={CX + 138 - 20} />
      </View>

      {/* Center info */}
      <View style={s.centerInfo}>
        <Text style={s.ofTotal}>of {fmt(totalBudget)}</Text>
        <View style={s.statusRow}>
          <Text style={{ fontSize: 14, color: onTrack ? '#15803D' : '#BE123C', fontWeight: '800' }}>{onTrack ? '✓' : '⚠️'}</Text>
          <Text style={[s.statusText, { color: onTrack ? '#15803D' : '#BE123C' }]}>
            {onTrack ? 'On track' : 'Over budget'}
          </Text>
        </View>
      </View>

      {/* 4-stat grid */}
      <View style={s.statsRow}>
        <StatCol icon="⚪" label="Remaining" value={fmt(Math.max(remaining, 0))} sub={pctStr(Math.max(remaining, 0), totalBudget)} color={Colors.textSecondary} />
        <View style={s.vDivider} />
        <StatCol icon="🔵" label="Spent"     value={fmt(totalSpent)}            sub={pctStr(totalSpent, totalBudget)}            color={Colors.purple} />
        <View style={s.vDivider} />
        <StatCol icon="🎁" label="Total"     value={fmt(totalBudget)}           sub=""                                           color={Colors.purple} />
      </View>
    </View>
  );
}

function StatCol({
  icon, label, value, sub, color,
}: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <View style={s.statCol}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      {!!sub && <Text style={s.statSub}>{sub}</Text>}
    </View>
  );
}

function Cloud({ left }: { left: number }) {
  return (
    <View style={[s.cloud, { left, top: CY - 14 }]}>
      <View style={s.cloudPuff} />
      <View style={s.cloudBase} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingTop: 18,
    paddingBottom: 18,
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title:        { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  year:         { fontSize: 12, color: Colors.textMuted, width: '100%', marginTop: -4 },
  totalSpentBadge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  totalSpentBadgeText:{ fontSize: 12, fontWeight: '700' },

  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 5,
  },
  dotPct:  { fontSize: 11, fontWeight: '800', color: '#fff', lineHeight: 14 },
  dotUsed: { fontSize: 8,  fontWeight: '600', color: 'rgba(255,255,255,0.75)', lineHeight: 10 },

  cloud:      { position: 'absolute', width: 40, height: 28, alignItems: 'center', justifyContent: 'flex-end' },
  cloudPuff:  { position: 'absolute', top: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' },
  cloudBase:  {
    width: 40, height: 18, borderRadius: 12, backgroundColor: '#FFFFFF',
    shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10, shadowRadius: 4, elevation: 3,
  },

  centerInfo: { alignItems: 'center', marginTop: 2, marginBottom: 16 },
  ofTotal:    { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },

  statsRow:   { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14, paddingHorizontal: 4 },
  statCol:    { flex: 1, alignItems: 'center', gap: 1 },
  vDivider:   { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  statIcon:   { fontSize: 16, marginBottom: 2 },
  statLabel:  { fontSize: 9, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center' },
  statValue:  { fontSize: 13, fontWeight: '700', textAlign: 'center', letterSpacing: -0.3 },
  statSub:    { fontSize: 10, color: Colors.textMuted },
});
