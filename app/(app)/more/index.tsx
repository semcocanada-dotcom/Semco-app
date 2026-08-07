import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, SectionHeader, Badge } from '@/components/ui';
import { Colors, Fonts, Layout, Radius, Typography, Spacing } from '@/constants/theme';

const MORE_ACTIONS = [
  {
    title: 'Company profile',
    description: 'Installer account, dealer routing, and warranty identity.',
    icon: 'business-outline' as const,
    route: '/profile',
  },
  {
    title: 'Account and security',
    description: 'Sign out, password help, or permanently delete the account.',
    icon: 'person-circle-outline' as const,
    route: '/account',
  },
  {
    title: 'Submit purchase receipt',
    description: 'Send purchase proof to Semco for record review.',
    icon: 'receipt-outline' as const,
    route: '/receipts',
  },
  {
    title: 'Semco Guide',
    description: 'Search installed technical guidance and saved local conversations.',
    icon: 'chatbubble-ellipses-outline' as const,
    route: '/assistant',
  },
  {
    title: 'System diagrams',
    description: 'Official layer and process drawings.',
    icon: 'layers-outline' as const,
    route: '/library/guides',
  },
  {
    title: 'Product documents',
    description: 'Grouped sheets, details, and source PDFs.',
    icon: 'document-text-outline' as const,
    route: '/products',
  },
  {
    title: 'Project warranty records',
    description: 'Review jobs and required stage photos.',
    icon: 'shield-checkmark-outline' as const,
    route: '/projects',
  },
  {
    title: 'Privacy policy',
    description: 'How installer, project, and customer information is handled.',
    icon: 'lock-closed-outline' as const,
    route: '/privacy',
  },
] as const;

export default function MoreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <Badge label="More" variant="primary" />
            <Badge label="Support" variant="neutral" />
          </View>
          <Text style={styles.heroTitle}>More tools</Text>
          <Text style={styles.heroBody}>Support, documents, account settings, and warranty records.</Text>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Open" subtitle="Additional tools for field and account workflows." />
          <View style={styles.actionList}>
            {MORE_ACTIONS.map((item) => (
              <TouchableOpacity
                key={item.title}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.78}
                style={styles.actionRow}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={item.icon} size={20} color={Colors.darkTeal} />
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
