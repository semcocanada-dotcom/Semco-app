import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { formatSqft, getRewardProgress } from '@/constants/rewards';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

interface RewardTrackerCardProps {
  verifiedSqft: number;
  pendingSqft?: number;
  onPress?: () => void;
}

export function RewardTrackerCard({ verifiedSqft, pendingSqft = 0, onPress }: RewardTrackerCardProps) {
  const progress = getRewardProgress(verifiedSqft);
  const displayTier = progress.nextTier ?? progress.currentTier;
  const tierLabel = progress.currentTier ? progress.currentTier.name : 'Starter';
  const targetLabel = progress.nextTier ? progress.nextTier.name : '100K Club';
  const pendingProgressPercent = progress.nextTier
    ? Math.min(100, Math.max(
      progress.progressPercent,
      Math.round(((progress.sqftIntoTier + pendingSqft) / progress.sqftNeededForTier) * 100),
    ))
    : 100;

  const handlePress = () => {
    if (!onPress) return;
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel="Open reward tier progress"
    >
      <View style={styles.ringWrap}>
        <ProgressRing percent={progress.progressPercent} pendingPercent={pendingProgressPercent} />
        <View style={styles.ringCenter}>
          <Text style={styles.ringTier}>Tier</Text>
          <Text style={styles.ringNumber}>{displayTier?.level ?? 1}</Text>
        </View>
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.eyebrow}>Reward tracker</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.semcoOrange} />
        </View>
        <Text style={styles.title}>
          {progress.nextTier ? `${progress.progressPercent}% verified to ${targetLabel}` : 'Top tier reached'}
        </Text>
        <Text style={styles.progressText}>
          {formatSqft(verifiedSqft)} verified / {formatSqft(progress.tierTargetSqft)}
        </Text>
        <Text style={styles.body}>
          Current: {tierLabel}. Verified square footage is cumulative and moves you to the next reward.
        </Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendVerified]} />
            <Text style={styles.legendText}>Verified</Text>
          </View>
          {pendingSqft > 0 ? (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendPending]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
          ) : null}
        </View>
        {pendingSqft > 0 ? <Text style={styles.pending}>{formatSqft(pendingSqft)} pending review</Text> : null}
      </View>
    </Pressable>
  );
}

function ProgressRing({ percent, pendingPercent }: { percent: number; pendingPercent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const pendingClamped = Math.max(clamped, Math.min(100, pendingPercent));
  const radius = (RING_SIZE - RING_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * clamped) / 100;
  const pendingDashOffset = circumference - (circumference * pendingClamped) / 100;

  return (
    <View style={styles.ringTrack}>
      <View style={styles.ringGlow} />
      <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
        <Defs>
          <LinearGradient id="rewardVerified" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFB14A" />
            <Stop offset="0.5" stopColor={Colors.semcoOrange} />
            <Stop offset="1" stopColor="#8F2D16" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={RING_WIDTH}
          fill="none"
        />
        {pendingClamped > clamped ? (
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            stroke="rgba(5,186,194,0.5)"
            strokeWidth={RING_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={pendingDashOffset}
            rotation={-90}
            originX={RING_SIZE / 2}
            originY={RING_SIZE / 2}
          />
        ) : null}
        {clamped > 0 ? (
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            stroke="url(#rewardVerified)"
            strokeWidth={RING_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            rotation={-90}
            originX={RING_SIZE / 2}
            originY={RING_SIZE / 2}
          />
        ) : null}
      </Svg>
    </View>
  );
}

const RING_SIZE = 98;
const RING_WIDTH = 10;

const styles = StyleSheet.create({
  card: {
    minHeight: 148,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.xl,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: 'rgba(207,69,31,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringGlow: {
    position: 'absolute',
    width: RING_SIZE - 8,
    height: RING_SIZE - 8,
    borderRadius: (RING_SIZE - 8) / 2,
    backgroundColor: 'rgba(5,186,194,0.08)',
    shadowColor: Colors.lightTeal,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  ringCenter: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ringTier: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
  },
  ringNumber: {
    color: Colors.semcoOrange,
    fontFamily: Fonts.bold,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: Typography.weight.bold,
  },
  copy: {
    flex: 1,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  eyebrow: {
    color: Colors.lightTeal,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  progressText: {
    color: Colors.white,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
  },
  body: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.45,
  },
  pending: {
    color: Colors.offlineAmberMuted,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendVerified: { backgroundColor: Colors.semcoOrange },
  legendPending: { backgroundColor: Colors.lightTeal },
  legendText: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
});
