import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { desc } from 'drizzle-orm';
import { ActionCard, Badge, EmptyState, SearchBar, StatCard } from '@/components/ui';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { BUILD_LABEL, BUILD_NOTE } from '@/constants/build';
import { db } from '@/database/client';
import { projects } from '@/database/schema/projects';
import { colors } from '@/database/schema/colors';
import colorsData from '@/database/seed/colors.json';
import type { Project } from '@/database/schema/projects';
import type { Color } from '@/database/schema/colors';
import { TECHNICAL_DOCS } from '@/knowledge/technical-docs';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';

type LoadState = {
  projects: Project[];
  colors: Color[];
};

const STANDARD_COLORS = colorsData as Color[];

const FEATURE_CARDS = [
  { title: 'Projects', description: 'Live jobs', icon: 'folder-open-outline' as const, tone: 'primary' as const, route: '/projects' },
  { title: 'Calculators', description: 'Estimate fast', icon: 'calculator-outline' as const, tone: 'accent' as const, route: '/calculator' },
  { title: 'Takeoff', description: 'Measure scope', icon: 'triangle-outline' as const, tone: 'primary' as const, route: '/takeoff' },
  { title: 'Photos', description: 'Capture stage', icon: 'camera-outline' as const, tone: 'accent' as const, route: '/add' },
  { title: 'Product Docs', description: 'Verified sheets', icon: 'document-text-outline' as const, tone: 'neutral' as const, route: '/products' },
  { title: 'Library', description: 'Manuals + tools', icon: 'book-outline' as const, tone: 'primary' as const, route: '/library' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as any);
  const [state, setState] = useState<LoadState>({ projects: [], colors: STANDARD_COLORS });

  useEffect(() => {
    Promise.all([
      db.select().from(projects).orderBy(desc(projects.updatedAt)),
      db.select().from(colors).orderBy(desc(colors.updatedAt)),
    ])
      .then(([projectRows, colorRows]) => {
        setState({ projects: projectRows, colors: colorRows.length > 0 ? colorRows : STANDARD_COLORS });
      })
      .catch(console.error);
  }, []);

  const stats = useMemo(() => {
    const active = state.projects.filter((project) => project.status === 'active').length;

    return [
      { label: 'Projects', value: String(state.projects.length || 0), detail: 'Total', icon: 'folder-open-outline' as const, tone: 'primary' as const },
      { label: 'In Progress', value: String(active || 0), detail: 'Live jobs', icon: 'pulse-outline' as const, tone: 'accent' as const },
      { label: 'Colours', value: String(state.colors.length || STANDARD_COLORS.length), detail: 'Formulas', icon: 'color-palette-outline' as const, tone: 'accent' as const },
      { label: 'Docs', value: String(TECHNICAL_DOCS.length), detail: 'Semco sheets', icon: 'document-text-outline' as const, tone: 'primary' as const },
    ];
  }, [state.projects, state.colors]);

  const recentProjects = state.projects.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tealHeader}>
          <View style={styles.logoRow}>
            <View style={styles.logoCard}>
              <Image
                source={require('../../../assets/images/semco-surfaces-logo.png')}
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>
            <TouchableOpacity style={styles.notificationButton} accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={22} color={Colors.navy} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.installerName}>Dieter</Text>
            <View style={styles.buildBadgeRow}>
              <Badge label={BUILD_LABEL} variant="accent" />
              <Badge label={BUILD_NOTE} variant="primary" />
            </View>
          </View>

          <SearchBar
            placeholder="Ask a question or search..."
            showMic
            editable={false}
            onPressIn={() => push('/(app)/assistant')}
            containerStyle={styles.askBar}
          />

          <TouchableOpacity
            style={styles.colourHero}
            onPress={() => push('/colors')}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="Open Semco colours and formulas"
          >
            <View style={styles.colourHeroIcon}>
              <Ionicons name="color-palette-outline" size={26} color={Colors.white} />
            </View>
            <View style={styles.colourHeroText}>
              <Text style={styles.colourHeroTitle}>Colours</Text>
              <Text style={styles.colourHeroSubtitle}>Swatches, names, and XBond formulas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.semcoOrange} />
          </TouchableOpacity>

          <View style={styles.featureGrid}>
            {FEATURE_CARDS.map((card) => (
              <ActionCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                tone={card.tone}
                onPress={() => push(card.route)}
                style={styles.featureCard}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.summaryGrid}>
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                detail={stat.detail}
                icon={stat.icon}
                tone={stat.tone}
                style={styles.summaryCard}
              />
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <TouchableOpacity onPress={() => push('/(app)/projects')} activeOpacity={0.75}>
              <Text style={styles.sectionAction}>View all</Text>
            </TouchableOpacity>
          </View>

          {recentProjects.length > 0 ? (
            <View style={styles.projectList}>
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPress={() => push(`/(app)/projects/${project.id}`)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="folder-open-outline"
              title="No projects yet"
              body="Create the first project to begin tracking jobs, photos, and batches."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.darkTeal },
  scroll: {
    paddingBottom: Spacing.xxxl + 44,
    backgroundColor: Colors.appBackground,
  },
  tealHeader: {
    backgroundColor: Colors.darkTeal,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.base,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  logoCard: {
    flex: 1,
    maxWidth: 230,
    height: 58,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  logoImage: {
    width: '100%',
    height: 42,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.semcoOrange,
  },
  greetingBlock: { gap: 2 },
  buildBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  greeting: {
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.md,
  },
  installerName: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: Typography.weight.bold,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  featureCard: {
    width: '48.5%',
    flexBasis: '48.5%',
    flexGrow: 0,
    flexShrink: 0,
  },
  colourHero: {
    minHeight: 76,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.accentMuted,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  colourHeroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.semcoOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colourHeroText: { flex: 1, gap: 2 },
  colourHeroTitle: {
    color: Colors.navy,
    fontSize: Typography.size.lg,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  colourHeroSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
  },
  askBar: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  summaryCard: {
    width: '48.5%',
    flexBasis: '48.5%',
    flexGrow: 0,
    flexShrink: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  sectionTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  sectionAction: {
    color: Colors.semcoOrange,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
  },
  projectList: {
    gap: Spacing.sm,
  },
});
