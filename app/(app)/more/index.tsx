import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, SectionHeader, Badge, ActionCard } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants/theme';

const SETTINGS = [
  { title: 'Offline manual', description: 'Local answers stay available when the network drops.', icon: 'cloud-offline-outline' as const, tone: 'primary' as const },
  { title: 'Review mode', description: 'Project approvals stay visible before any next step is taken.', icon: 'eye-outline' as const, tone: 'accent' as const },
  { title: 'Design system', description: 'The shell uses the same dark premium language across every screen.', icon: 'color-wand-outline' as const, tone: 'primary' as const },
  { title: 'Support', description: 'Use the existing assistant and project routes as your workbench.', icon: 'help-circle-outline' as const, tone: 'accent' as const },
] as const;

export default function MoreScreen() {
  const router = useRouter();

  const OPEN_ROUTES = [
    '/assistant',
    '/projects',
    '/library',
    '/assistant',
  ];
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <Badge label="More" variant="accent" />
            <Badge label="Settings" variant="neutral" />
          </View>
          <Text style={styles.heroTitle}>The overflow drawer keeps the build quiet and focused.</Text>
          <Text style={styles.heroBody}>
            This is where the secondary tools, review surfaces and app preferences can live without cluttering the main nav.
          </Text>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Workspace settings" subtitle="These are the durable system controls for now." />
          <View style={styles.cardsGrid}>
            {SETTINGS.map((item, index) => (
              <ActionCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                tone={item.tone}
                onPress={() => router.push(OPEN_ROUTES[index] as any)}
                style={styles.settingCard}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Release status" subtitle="A small set of guardrails for the preview build." />
          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
              <Text style={styles.statusTitle}>Design shell ready</Text>
            </View>
            <Text style={styles.statusBody}>
              Dashboard, navigation and library hubs are now wired in the new visual style. Takeoff and order flows can be expanded next.
            </Text>
          </Card>
        </View>

        <Card style={styles.footerCard}>
          <Text style={styles.footerTitle}>No extra noise.</Text>
          <Text style={styles.footerBody}>
            This space stays intentionally sparse so the main build stays fast on phone and preview.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl + 16, gap: Spacing.lg },
  heroCard: { gap: Spacing.md, borderColor: Colors.accentMuted, backgroundColor: Colors.surfaceElevated },
  heroBadgeRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroTitle: { color: Colors.textPrimary, fontSize: Typography.size.xxl, lineHeight: Typography.size.xxl * 1.05, fontWeight: Typography.weight.bold },
  heroBody: { color: Colors.textSecondary, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  section: { gap: Spacing.md },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  settingCard: { width: '48%' },
  statusCard: { gap: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusTitle: { color: Colors.textPrimary, fontSize: Typography.size.base, fontWeight: Typography.weight.bold },
  statusBody: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.45 },
  footerCard: { borderColor: Colors.border, gap: 6 },
  footerTitle: { color: Colors.textPrimary, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  footerBody: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.45 },
});
