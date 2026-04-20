import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 220;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatCAD(amount: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount);
}

interface BudgetRingProps {
  totalBudget: number;
  totalSpent: number;
  totalPending: number;
  remaining: number;
}

export function BudgetRing({ totalBudget, totalSpent, totalPending, remaining }: BudgetRingProps) {
  const spentProgress = useSharedValue(0);
  const pendingProgress = useSharedValue(0);

  useEffect(() => {
    const spentRatio = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;
    const pendingRatio = totalBudget > 0 ? Math.min(totalPending / totalBudget, 1 - spentRatio) : 0;

    spentProgress.value = withTiming(spentRatio, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
    pendingProgress.value = withTiming(pendingRatio, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [totalBudget, totalSpent, totalPending]);

  // Grey spent arc — starts at top, covers spentRatio of the ring
  const spentProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - spentProgress.value),
  }));

  // Amber pending arc — starts right after the spent arc ends
  const pendingProps = useAnimatedProps(() => {
    const pendingLen = CIRCUMFERENCE * pendingProgress.value;
    return {
      strokeDashoffset: CIRCUMFERENCE - CIRCUMFERENCE * spentProgress.value,
      strokeDasharray: `${pendingLen} ${CIRCUMFERENCE - pendingLen}`,
    };
  });

  const isLow = remaining < 500;

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 24,
        padding: 24,
        shadowColor: Colors.purple,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
      }}
    >
      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
          {/* Full purple ring — shows total budget, visible where unspent */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.ringSpent}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Amber pending arc — paints over purple, follows spent portion */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.ringPending}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={pendingProps}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
          {/* Grey spent arc — paints over purple from top clockwise as money is spent */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#CBD5E1"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={spentProps}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>

        {/* Center label */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: Colors.textMuted, marginBottom: 4 }}>Remaining</Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: isLow ? Colors.danger : Colors.textPrimary,
              letterSpacing: -0.5,
            }}
          >
            {formatCAD(Math.max(0, remaining))}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
            of {formatCAD(totalBudget)}
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View style={{ flexDirection: 'row', gap: 20, marginTop: 16 }}>
        <LegendDot color={Colors.ringSpent} label="Remaining" />
        <LegendDot color="#CBD5E1" label="Spent" />
        <LegendDot color={Colors.ringPending} label="Pending" />
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{label}</Text>
    </View>
  );
}
