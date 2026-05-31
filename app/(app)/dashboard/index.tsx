import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { desc } from 'drizzle-orm';
import { db } from '@/database/client';
import { projects } from '@/database/schema/projects';
import { products } from '@/database/schema/products';
import { colors } from '@/database/schema/colors';
import type { Project } from '@/database/schema/projects';
import type { Product } from '@/database/schema/products';
import type { Color } from '@/database/schema/colors';
import { BrandMark } from '@/components/brand/BrandMark';
import { ActionCard, Badge, Button, Card, SectionHeader, StatCard } from '@/components/ui';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

type LoadState = {
  projects: Project[];
  products: Product[];
  colors: Color[];
};

const QUICK_ACTIONS = [
  { title: 'Projects', description: 'Jump to live jobs and job details.', icon: 'folder-open-outline' as const, route: '/(app)/projects' },
  { title: 'Library', description: 'Open products, colours and calculator tools.', icon: 'library-outline' as const, route: '/(app)/library' },
  { title: 'Assistant', description: 'Look up product and application guidance.', icon: 'chatbubble-ellipses-outline' as const, route: '/(app)/assistant' },
  { title: 'Calculator', description: 'Run a fast material takeoff from the library.', icon: 'calculator-outline' as const, route: '/(app)/calculator' },
] as const;

export default function DashboardScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as any);
  const [state, setState] = useState<LoadState>({ projects: [], products: [], colors: [] });

  useEffect(() => {
    Promise.all([
      db.select().from(projects).orderBy(desc(projects.updatedAt)),
      db.select().from(products).orderBy(desc(products.updatedAt)),
      db.select().from(colors).orderBy(desc(colors.updatedAt)),
    ])
      .then(([projectRows, productRows, colorRows]) => {
        setState({ projects: projectRows, products: productRows, colors: colorRows });
      })
      .catch(console.error);
  }, []);

  const stats = useMemo(() => {
    const active = state.projects.filter((project) => project.status === 'active').length;
    const complete = state.projects.filter((project) => project.status === 'complete').length;
    return [
      { label: 'Active Projects', value: String(active), detail: 'In progress right now', icon: 'folder-open-outline' as const, tone: 'primary' as const },
      { label: 'Library Products', value: String(state.products.length), detail: 'Seeded materials loaded', icon: 'cube-outline' as const, tone: 'accent' as const },
      { label: 'Standard Colours', value: String(state.colors.filter((c) => c.isStandard).length), detail: 'Current palette entries', icon: 'color-palette-outline' as const, tone: 'success' as const },
      { label: 'Completed Jobs', value: String(complete), detail: 'Closed out projects', icon: 'checkmark-done-outline' as const, tone: 'neutral' as const },
    ];
  }, [state.colors, state.projects, state.products]);

  const recentProjects = state.projects.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <BrandMark />
            <Badge label="Studio shell" variant="accent" />
          </View>
          <Text style={styles.heroTitle}>Build Semco installs from one premium workspace.</Text>
          <Text style={styles.heroBody}>
            Dashboard, projects, library and fast actions live in one dark interface tuned for the proposed rendering.
          </Text>
          <View style={styles.heroButtons}>
            <Button label="New project" variant="accent" onPress={() => push('/projects/create')} style={styles.heroButton} />
            <Button label="Open library" variant="secondary" onPress={() => push('/library')} style={styles.heroButton} />
          </View>
        </Card>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              icon={stat.icon}
              tone={stat.tone}
              style={styles.statCard}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Quick actions" subtitle="Keep the most used tasks one tap away." />
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <ActionCard
                key={action.title}
                title={action.title}
                description={action.description}
                icon={action.icon}
                tone={index === 1 ? 'accent' : 'primary'}
                onPress={() => push(action.route)}
                style={styles.actionCard}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Recent projects"
            subtitle="The latest jobs load here first so you can jump back in fast."
            actionLabel="View all"
            onActionPress={() => push('/projects')}
          />
          <View style={styles.recentList}>
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPress={() => push(`/projects/${project.id}`)}
                />
              ))
            ) : (
              <Card>
                <Text style={styles.emptyTitle}>No projects yet</Text>
                <Text style={styles.emptyBody}>Create the first project to start tracking batches, photos and warranty status.</Text>
              </Card>
            )}
          </View>
        </View>

        <Card style={styles.footerCard}>
          <View style={styles.footerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.footerTitle}>Product data can arrive later.</Text>
              <Text style={styles.footerBody}>
                The design shell is already wired. When you upload the catalogue, it will drop into the same library layout.
              </Text>
            </View>
            <View style={styles.footerIcon}>
              <Ionicons name="cloud-upload-outline" size={22} color={Colors.accent} />
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 16,
    gap: Spacing.lg,
  },
  heroCard: {
    gap: Spacing.md,
    borderColor: Colors.primaryMuted,
    backgroundColor: Colors.surfaceElevated,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xxl,
    lineHeight: Typography.size.xxl * 1.05,
    fontWeight: Typography.weight.bold,
  },
  heroBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  heroButton: { flex: 1, minWidth: 140 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    width: '48%',
  },
  section: {
    gap: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
    width: '48%',
  },
  recentList: {
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  emptyBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  footerCard: {
    borderColor: Colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  footerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  footerBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  footerIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
