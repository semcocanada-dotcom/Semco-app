import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Badge } from '@/components/ui';
import { Colors, Fonts, Layout, Radius, Typography, Spacing } from '@/constants/theme';

const ACTIONS = [
  {
    title: 'Create project',
    description: 'Start a job file with customer, site, system, colour, and warranty records.',
    icon: 'folder-open-outline' as const,
    route: '/projects/create',
    tone: 'primary',
  },
  {
    title: 'Build material request',
    description: 'Use calculator quantities or add odd items for Modern Arc review.',
    icon: 'cart-outline' as const,
    route: '/orders',
    tone: 'primary',
  },
  {
    title: 'Upload purchase receipt',
    description: 'Log purchased square footage toward installer reward tiers.',
    icon: 'receipt-outline' as const,
    route: '/receipts',
    tone: 'primary',
  },
  {
    title: 'Add warranty photos',
    description: 'Open projects and capture the required stage photos.',
    icon: 'camera-outline' as const,
    route: '/projects',
    tone: 'primary',
  },
  {
    title: 'Customer sign-off',
    description: 'Open a project to fill forms and collect tap-to-sign approval.',
    icon: 'create-outline' as const,
    route: '/projects',
    tone: 'primary',
  },
  {
    title: 'Ask Semco',
    description: 'Ask an install question before moving forward.',
    icon: 'chatbubble-ellipses-outline' as const,
    route: '/assistant',
    tone: 'primary',
  },
] as const;

export default function AddScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as any);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <Badge label="New" variant="accent" />
            <Badge label="Create work" variant="primary" />
          </View>
          <Text style={styles.heroTitle}>What do you need to start?</Text>
          <Text style={styles.heroBody}>Use the centre button for new work: project files, material requests, receipts, warranty photos, and customer sign-offs.</Text>
          <View style={styles.heroButtons}>
            <Button label="New project" variant="accent" onPress={() => push('/projects/create')} style={styles.heroButton} />
            <Button label="Material request" variant="secondary" onPress={() => push('/orders')} style={styles.heroButton} />
          </View>
        </Card>

        <View style={styles.section}>
          {ACTIONS.map((action) => (
            <TouchableOpacity key={action.title} activeOpacity={0.78} onPress={() => push(action.route)} style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={22} color={Colors.darkTeal} />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionBody}>{action.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textDisabled} />
            </TouchableOpacity>
            ))}
        </View>

        <Card style={styles.noteCard}>
          <View style={styles.noteRow}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.darkTeal} />
            <Text style={styles.noteTitle}>How this should work</Text>
          </View>
          <Text style={styles.noteBody}>The dashboard is for reviewing the job. The centre button is for starting or adding something new.</Text>
        </Card>
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
  heroCard: { gap: Spacing.md, borderColor: Colors.accentMuted, backgroundColor: Colors.surfaceElevated },
  heroBadgeRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroTitle: { color: Colors.textPrimary, fontSize: Typography.size.xxl, lineHeight: Typography.size.xxl * 1.05, fontWeight: Typography.weight.bold },
  heroBody: { color: Colors.textSecondary, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  heroButtons: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroButton: { flex: 1, minWidth: 140 },
  section: { gap: Spacing.sm },
  actionRow: {
    minHeight: 86,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.navy,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#C6EEF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1, gap: 3 },
  actionTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  actionBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
  },
  noteCard: { gap: 8 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  noteTitle: { color: Colors.textPrimary, fontSize: Typography.size.base, fontWeight: Typography.weight.bold },
  noteBody: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.45 },
});
