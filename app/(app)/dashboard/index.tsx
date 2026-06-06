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
import type { Project } from '@/database/schema/projects';
import { Colors, Fonts, Spacing, Typography } from '@/constants/theme';

type LoadState = {
  projects: Project[];
};

const FEATURE_CARDS = [
  { title: 'Projects', description: 'Live jobs', icon: 'folder-open-outline' as const, tone: 'primary' as const, route: '/projects' },
  { title: 'Calculators', description: 'Estimate fast', icon: 'calculator-outline' as const, tone: 'accent' as const, route: '/calculator' },
  { title: 'Takeoff', description: 'Measure scope', icon: 'triangle-outline' as const, tone: 'primary' as const, route: '/takeoff' },
  { title: 'Photos', description: 'Capture stage', icon: 'camera-outline' as const, tone: 'accent' as const, route: '/add' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as any);
  const [state, setState] = useState<LoadState>({ projects: [] });

  useEffect(() => {
    db.select().from(projects).orderBy(desc(projects.updatedAt))
      .then((projectRows) => {
        setState({ projects: projectRows });
      })
      .catch(console.error);
  }, []);

  const stats = useMemo(() => {
    const active = state.projects.filter((project) => project.status === 'active').length;

    return [
      { label: 'Projects', value: String(state.projects.length || 0), detail: 'Total', icon: 'folder-open-outline' as const, tone: 'primary' as const },
      { label: 'In Progress', value: String(active || 0), detail: 'Live jobs', icon: 'pulse-outline' as const, tone: 'accent' as const },
    ];
  }, [state.projects]);

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

          <View style={styles.featureGrid}>
            {FEATURE_CARDS.map((card) => (
              <ActionCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                tone={card.tone}
                onPress={() => push(card.route)}
                compact
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
