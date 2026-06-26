import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { AppHeader, Badge, Button, Card, EmptyState, SectionHeader } from '@/components/ui';
import { db } from '@/database/client';
import { rewardCredits } from '@/database/schema/installers';
import type { RewardCredit } from '@/database/schema/installers';
import { REWARD_TIERS, formatSqft, getCurrentRewardTier, getNextRewardTier } from '@/constants/rewards';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';
import { LOCAL_INSTALLER_ID } from '@/services/installer-profile';
import { useRouter } from 'expo-router';

export default function RewardsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const installerId = user?.id ?? LOCAL_INSTALLER_ID;
  const [credits, setCredits] = useState<RewardCredit[]>([]);

  useEffect(() => {
    db.select()
      .from(rewardCredits)
      .where(eq(rewardCredits.installerId, installerId))
      .then(setCredits)
      .catch(console.error);
  }, [installerId]);

  const verifiedSqft = useMemo(
    () => credits.filter((credit) => credit.status === 'verified').reduce((sum, credit) => sum + (credit.sqft ?? 0), 0),
    [credits],
  );
  const pendingSqft = useMemo(
    () => credits.filter((credit) => credit.status === 'pending').reduce((sum, credit) => sum + (credit.sqft ?? 0), 0),
    [credits],
  );
  const currentTier = getCurrentRewardTier(verifiedSqft);
  const nextTier = getNextRewardTier(verifiedSqft);
  const nextProgress = nextTier ? Math.min(100, Math.round((verifiedSqft / nextTier.sqft) * 100)) : 100;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppHeader title="Reward Tiers" subtitle="Cumulative verified square footage milestones." rightIcon="trophy-outline" />

        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Badge label={currentTier ? currentTier.name : 'Not tiered yet'} variant={currentTier ? 'success' : 'warning'} />
            <Badge label={`${formatSqft(verifiedSqft)} verified`} variant="primary" />
          </View>
          <Text style={styles.heroTitle}>
            {nextTier ? `${formatSqft(Math.max(nextTier.sqft - verifiedSqft, 0))} to ${nextTier.name}` : '100K Club reached'}
          </Text>
          <Text style={styles.heroBody}>
            Only approved project reviews, dealer orders, or accepted receipts count toward rewards.
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${nextProgress}%` }]} />
          </View>
          {pendingSqft > 0 ? <Text style={styles.pendingText}>{formatSqft(pendingSqft)} pending review</Text> : null}
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Milestones" subtitle="Credit is cumulative, not per purchase." />
          <View style={styles.tierGrid}>
            {REWARD_TIERS.map((tier) => {
              const achieved = verifiedSqft >= tier.sqft;
              const active = nextTier?.id === tier.id;
              return (
                <Card key={tier.id} style={getTierCardStyle(achieved, active)}>
                  <View style={[styles.tierNumber, achieved && styles.tierNumberAchieved]}>
                    <Text style={[styles.tierNumberText, achieved && styles.tierNumberTextAchieved]}>{tier.level}</Text>
                  </View>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierSqft}>{formatSqft(tier.sqft)}</Text>
                  <Text style={styles.tierReward}>{tier.reward}</Text>
                  <Text style={styles.tierBody}>{tier.description}</Text>
                  <Badge label={achieved ? 'Unlocked' : active ? 'Next' : 'Locked'} variant={achieved ? 'success' : active ? 'warning' : 'neutral'} />
                </Card>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Credit Sources" subtitle="Receipts and dealer orders will appear here after submission." />
          {credits.length > 0 ? (
            credits.map((credit) => (
              <Card key={credit.id} style={styles.creditCard}>
                <View style={styles.creditIcon}>
                  <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.creditCopy}>
                  <Text style={styles.creditTitle}>{formatSqft(credit.sqft ?? 0)}</Text>
                  <Text style={styles.creditBody}>{credit.sourceType.replace(/_/g, ' ')}</Text>
                </View>
                <Badge label={credit.status} variant={credit.status === 'verified' ? 'success' : credit.status === 'rejected' ? 'danger' : 'warning'} />
              </Card>
            ))
          ) : (
            <EmptyState
              icon="receipt-outline"
              title="No reward credit yet"
              body="Submit dealer orders or purchase receipts for Semco review. Verified square footage will count toward milestones."
            />
          )}
        </View>

        <Button label="Submit Purchase Receipt" variant="primary" onPress={() => router.push('/receipts' as any)} fullWidth />
        <Button label="Open Company Profile" variant="secondary" onPress={() => router.push('/profile' as any)} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

function getTierCardStyle(achieved: boolean, active: boolean) {
  return {
    ...styles.tierCard,
    ...(achieved ? styles.tierAchieved : null),
    ...(active ? styles.tierActive : null),
  };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 44,
    gap: Spacing.md,
  },
  heroCard: { gap: Spacing.md, borderColor: Colors.accentMuted, backgroundColor: Colors.surfaceElevated },
  heroTop: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  heroTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  heroBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  progressTrack: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.semcoOrange, borderRadius: Radius.full },
  pendingText: {
    color: Colors.offlineAmber,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
  },
  section: { gap: Spacing.md },
  tierGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tierCard: { width: '48%', flexGrow: 1, minHeight: 212, gap: Spacing.xs },
  tierAchieved: { borderColor: Colors.successMuted, backgroundColor: Colors.surfaceElevated },
  tierActive: { borderColor: Colors.accentMuted },
  tierNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.offlineAmberMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierNumberAchieved: { backgroundColor: Colors.semcoOrange },
  tierNumberText: {
    color: Colors.offlineAmber,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.sm,
  },
  tierNumberTextAchieved: { color: Colors.white },
  tierName: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
  },
  tierSqft: {
    color: Colors.semcoOrange,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  tierReward: {
    color: Colors.navy,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.35,
  },
  tierBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
    flex: 1,
  },
  creditCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  creditIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  creditCopy: { flex: 1, gap: 2 },
  creditTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  creditBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    textTransform: 'capitalize',
  },
});
