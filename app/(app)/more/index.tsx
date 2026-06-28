import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { Card, SectionHeader, Badge } from '@/components/ui';
import { RewardTrackerCard } from '@/components/rewards/RewardTrackerCard';
import { Colors, Fonts, Layout, Radius, Typography, Spacing } from '@/constants/theme';
import { db } from '@/database/client';
import { rewardCredits } from '@/database/schema/installers';
import { isSemcoAdminUser } from '@/services/admin-access';
import { LOCAL_INSTALLER_ID } from '@/services/installer-profile';
import { useAuthStore } from '@/store/auth';

const MORE_ACTIONS = [
  {
    title: 'Semco admin portal',
    description: 'Review installers, warranties, orders, receipts, and rewards.',
    icon: 'shield-checkmark-outline' as const,
    route: '/admin',
    tone: 'accent' as const,
    adminOnly: true,
  },
  {
    title: 'Company profile',
    description: 'Installer account, dealer routing, and warranty identity.',
    icon: 'business-outline' as const,
    route: '/profile',
    tone: 'primary' as const,
  },
  {
    title: 'Reward tiers',
    description: 'Verified square footage milestones and receipt credits.',
    icon: 'trophy-outline' as const,
    route: '/rewards',
    tone: 'primary' as const,
  },
  {
    title: 'Submit receipt',
    description: 'Send purchase proof for reward review.',
    icon: 'receipt-outline' as const,
    route: '/receipts',
    tone: 'primary' as const,
  },
  {
    title: 'Ask Semco',
    description: 'Technical install questions and saved chats.',
    icon: 'chatbubble-ellipses-outline' as const,
    route: '/assistant',
    tone: 'primary' as const,
  },
  {
    title: 'System diagrams',
    description: 'Official layer and process drawings.',
    icon: 'layers-outline' as const,
    route: '/library/guides',
    tone: 'primary' as const,
  },
  {
    title: 'Product documents',
    description: 'Grouped sheets, details, and source PDFs.',
    icon: 'document-text-outline' as const,
    route: '/products',
    tone: 'primary' as const,
  },
  {
    title: 'Project warranty records',
    description: 'Review jobs and required stage photos.',
    icon: 'shield-checkmark-outline' as const,
    route: '/projects',
    tone: 'primary' as const,
  },
] as const;

export default function MoreScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const installerId = user?.id ?? LOCAL_INSTALLER_ID;
  const [rewardState, setRewardState] = useState({ verifiedSqft: 0, pendingSqft: 0 });
  const visibleActions = MORE_ACTIONS.filter((item) => !('adminOnly' in item) || !item.adminOnly || isSemcoAdminUser(user));
  const rewardsAction = useMemo(() => visibleActions.find((item) => item.route === '/rewards'), [visibleActions]);
  const secondaryActions = useMemo(() => visibleActions.filter((item) => item.route !== '/rewards'), [visibleActions]);

  useEffect(() => {
    db.select()
      .from(rewardCredits)
      .where(eq(rewardCredits.installerId, installerId))
      .then((creditRows) => {
        setRewardState({
          verifiedSqft: creditRows
            .filter((credit) => credit.status === 'verified')
            .reduce((sum, credit) => sum + (credit.sqft ?? 0), 0),
          pendingSqft: creditRows
            .filter((credit) => credit.status === 'pending')
            .reduce((sum, credit) => sum + (credit.sqft ?? 0), 0),
        });
      })
      .catch(console.error);
  }, [installerId]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <Badge label="More" variant="primary" />
            <Badge label="Support" variant="neutral" />
          </View>
          <Text style={styles.heroTitle}>More tools</Text>
          <Text style={styles.heroBody}>
            Support, documents, and warranty records.
          </Text>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Reward progress" subtitle="Verified square footage moves installers through the tier ladder." />
          <RewardTrackerCard
            verifiedSqft={rewardState.verifiedSqft}
            pendingSqft={rewardState.pendingSqft}
            onPress={() => router.push('/rewards' as any)}
          />
          {rewardsAction ? (
            <TouchableOpacity
              onPress={() => router.push('/rewards' as any)}
              activeOpacity={0.78}
              style={styles.rewardShortcut}
              accessibilityRole="button"
              accessibilityLabel="Open reward tiers"
            >
              <Ionicons name="trophy-outline" size={20} color={Colors.darkTeal} />
              <Text style={styles.rewardShortcutText}>View all reward tiers and milestones</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textDisabled} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Open" subtitle="Secondary surfaces that are useful in the field." />
          <View style={styles.actionList}>
            {secondaryActions.map((item) => (
              <TouchableOpacity
                key={item.title}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.78}
                style={styles.actionRow}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View style={[styles.actionIcon, item.tone === 'accent' && styles.actionIconAccent]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.tone === 'accent' ? Colors.semcoOrange : Colors.darkTeal}
                  />
                </View>
                <View style={styles.actionCopy}>
                  <Text style={styles.actionTitle}>{item.title}</Text>
                  <Text style={styles.actionBody}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textDisabled} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 16,
    gap: Spacing.lg,
  },
  heroCard: { gap: Spacing.md, borderColor: Colors.primaryMuted, backgroundColor: Colors.surfaceElevated },
  heroBadgeRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xl,
    lineHeight: Typography.size.xl * 1.12,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  heroBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    fontFamily: Fonts.regular,
  },
  section: { gap: Spacing.md },
  rewardShortcut: {
    minHeight: 58,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rewardShortcutText: {
    flex: 1,
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  actionList: { gap: Spacing.sm },
  actionRow: {
    minHeight: 74,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#C6EEF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconAccent: {
    backgroundColor: Colors.accentMuted,
    borderColor: '#F5CBBB',
  },
  actionCopy: { flex: 1, gap: 2 },
  actionTitle: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  actionBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
    fontFamily: Fonts.regular,
  },
});
