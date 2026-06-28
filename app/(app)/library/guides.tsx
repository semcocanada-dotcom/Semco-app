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
  const [category, setCategory] = React.useState('All');
  const categories = React.useMemo(
    () => ['All', ...Array.from(new Set(INSTALLATION_GUIDES.map((guide) => guide.category)))],
    [],
  );
  const visibleGuides = React.useMemo(
    () => category === 'All' ? INSTALLATION_GUIDES : INSTALLATION_GUIDES.filter((guide) => guide.category === category),
    [category],
  );

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
            <Ionicons name="chevron-back" size={22} color={Colors.darkTeal} />
          </TouchableOpacity>
          <AppHeader title="System Diagrams" subtitle="Official detail drawings and install sequence." rightIcon="layers-outline" />
        </View>

        <View style={styles.summaryBand}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Install guides</Text>
            <Text style={styles.summaryBody}>
              Official Semco diagrams stay here for field reference. Job photos still stay inside each project for warranty records.
            </Text>
          </View>
          <Badge label={`${visibleGuides.length} guides`} variant="primary" />
        </View>

        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((item) => {
              const active = item === category;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCategory(item)}
                  activeOpacity={0.78}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <SectionHeader title="Official diagrams" subtitle="Tap Ask Semco from a guide when you want a direct answer about that system." />
          {visibleGuides.map((guide) => (
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
  categoryRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.base,
  },
  categoryChip: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.semcoOrange,
    borderColor: Colors.semcoOrange,
  },
  categoryText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
  },
  categoryTextActive: {
    color: Colors.white,
  },
});
