import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        <ProgressRing percent={progress.progressPercent} />
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
          {progress.nextTier ? `${progress.progressPercent}% to ${targetLabel}` : 'Top tier reached'}
        </Text>
        <Text style={styles.progressText}>
          {formatSqft(verifiedSqft)} / {formatSqft(progress.tierTargetSqft)}
        </Text>
        <Text style={styles.body}>
          Current: {tierLabel}. Verified square footage is cumulative and moves you to the next reward.
        </Text>
        {pendingSqft > 0 ? <Text style={styles.pending}>{formatSqft(pendingSqft)} pending review</Text> : null}
      </View>
    </Pressable>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const segmentTotal = 28;
  const activeSegments = Math.max(0, Math.min(segmentTotal, Math.round((clamped / 100) * segmentTotal)));
  const radius = (RING_SIZE - RING_WIDTH) / 2;

  return (
    <View style={styles.ringTrack}>
      {Array.from({ length: segmentTotal }).map((_, index) => {
        const angle = (index / segmentTotal) * Math.PI * 2 - Math.PI / 2;
        const left = RING_SIZE / 2 + Math.cos(angle) * radius - 3;
        const top = RING_SIZE / 2 + Math.sin(angle) * radius - 3;

        return (
          <View
            key={index}
            style={[
              styles.ringDot,
              { left, top },
              index < activeSegments && styles.ringDotActive,
            ]}
          />
        );
      })}
      <View style={styles.ringMask} />
    </View>
  );
}

const RING_SIZE = 96;
const RING_WIDTH = 9;

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
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_WIDTH,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  ringDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.26)',
  },
  ringDotActive: { backgroundColor: Colors.semcoOrange },
  ringMask: {
    position: 'absolute',
    width: RING_SIZE - RING_WIDTH * 2,
    height: RING_SIZE - RING_WIDTH * 2,
    borderRadius: (RING_SIZE - RING_WIDTH * 2) / 2,
    backgroundColor: Colors.navy,
  },
  ringCenter: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
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
});
