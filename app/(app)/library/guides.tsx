import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Badge, SectionHeader } from '@/components/ui';
import { SystemGuideCard } from '@/components/library/SystemGuideCard';
import { INSTALLATION_GUIDES } from '@/knowledge/installation-guides';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';

export default function InstallationGuidesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={Colors.semcoOrange} />
          </TouchableOpacity>
          <AppHeader title="System Diagrams" subtitle="Layer stacks and install sequence." rightIcon="layers-outline" />
        </View>

        <View style={styles.summaryBand}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Install guides</Text>
            <Text style={styles.summaryBody}>
              Visual layer diagrams are separated from project photos, so training references stay clean and job photos stay inside projects.
            </Text>
          </View>
          <Badge label={`${INSTALLATION_GUIDES.length} guides`} variant="primary" />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Layer diagrams" subtitle="Tap Ask Semco from a guide when you want a direct answer about that system." />
          {INSTALLATION_GUIDES.map((guide) => (
            <SystemGuideCard
              key={guide.id}
              guide={guide}
              onAsk={() => router.push('/assistant' as any)}
            />
          ))}
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
    paddingBottom: Spacing.xxxl + 44,
    gap: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBand: {
    backgroundColor: Colors.darkTeal,
    borderRadius: 18,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  summaryCopy: { flex: 1, gap: Spacing.xs },
  summaryTitle: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.lg,
  },
  summaryBody: {
    color: '#DDF4F5',
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  section: { gap: Spacing.md },
});
