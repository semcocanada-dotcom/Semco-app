import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, ActionCard, Badge } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants/theme';

const ACTIONS = [
  { title: 'New project', description: 'Create a fresh install workspace.', icon: 'folder-open-outline' as const, route: '/(app)/projects/create' },
  { title: 'Takeoff', description: 'Open the material takeoff workspace.', icon: 'layers-outline' as const, route: '/(app)/takeoff' },
  { title: 'Order materials', description: 'Prepare an internal order request.', icon: 'cart-outline' as const, route: '/(app)/orders' },
  { title: 'Quick lookup', description: 'Jump to the assistant or calculator.', icon: 'search-outline' as const, route: '/(app)/assistant' },
] as const;

export default function AddScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as any);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <Badge label="Add" variant="accent" />
            <Badge label="Fast actions" variant="primary" />
          </View>
          <Text style={styles.heroTitle}>Start a new flow from the orange centre button.</Text>
          <Text style={styles.heroBody}>
            This panel is for creating work without cluttering the main dashboard. It stays focused on the next action only.
          </Text>
          <View style={styles.heroButtons}>
            <Button label="New project" variant="accent" onPress={() => push('/projects/create')} style={styles.heroButton} />
            <Button label="Library" variant="secondary" onPress={() => push('/library')} style={styles.heroButton} />
          </View>
        </Card>

        <View style={styles.section}>
          <View style={styles.grid}>
            {ACTIONS.map((action, index) => (
              <ActionCard
                key={action.title}
                title={action.title}
                description={action.description}
                icon={action.icon}
                tone={index === 1 || index === 2 ? 'accent' : 'primary'}
                onPress={() => push(action.route)}
                style={styles.actionCard}
              />
            ))}
          </View>
        </View>

        <Card style={styles.noteCard}>
          <View style={styles.noteRow}>
            <Ionicons name="sparkles-outline" size={18} color={Colors.accent} />
            <Text style={styles.noteTitle}>Next stage</Text>
          </View>
          <Text style={styles.noteBody}>
            The dedicated takeoff and order screens will slot into these buttons next. For now, the shell stays active and functional.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl + 16, gap: Spacing.lg },
  heroCard: { gap: Spacing.md, borderColor: Colors.accentMuted, backgroundColor: Colors.surfaceElevated },
  heroBadgeRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroTitle: { color: Colors.textPrimary, fontSize: Typography.size.xxl, lineHeight: Typography.size.xxl * 1.05, fontWeight: Typography.weight.bold },
  heroBody: { color: Colors.textSecondary, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  heroButtons: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroButton: { flex: 1, minWidth: 140 },
  section: { gap: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionCard: { width: '48%' },
  noteCard: { gap: 8 },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  noteTitle: { color: Colors.textPrimary, fontSize: Typography.size.base, fontWeight: Typography.weight.bold },
  noteBody: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.45 },
});
