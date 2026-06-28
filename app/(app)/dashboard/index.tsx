import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { desc, eq } from 'drizzle-orm';
import { ActionCard, EmptyState, SearchBar } from '@/components/ui';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { RewardTrackerCard } from '@/components/rewards/RewardTrackerCard';
import { db } from '@/database/client';
import { rewardCredits } from '@/database/schema/installers';
import { projects } from '@/database/schema/projects';
import type { Project } from '@/database/schema/projects';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { LOCAL_INSTALLER_ID } from '@/services/installer-profile';
import { useAuthStore } from '@/store/auth';

type LoadState = {
  projects: Project[];
  verifiedSqft: number;
  pendingSqft: number;
};

const FEATURE_CARDS = [
  { title: 'Projects', description: 'Live jobs', icon: 'folder-open-outline' as const, tone: 'primary' as const, route: '/projects' },
  { title: 'Calculators', description: 'Estimate fast', icon: 'calculator-outline' as const, tone: 'primary' as const, route: '/calculator' },
  { title: 'Materials', description: 'Order review', icon: 'cart-outline' as const, tone: 'primary' as const, route: '/orders' },
  { title: 'Colours', description: 'Fan deck', icon: 'color-palette-outline' as const, tone: 'primary' as const, route: '/colors' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const installerId = user?.id ?? LOCAL_INSTALLER_ID;
  const push = (href: string) => router.push(href as any);
  const [state, setState] = useState<LoadState>({ projects: [], verifiedSqft: 0, pendingSqft: 0 });

  useEffect(() => {
    Promise.all([
      db.select().from(projects).orderBy(desc(projects.updatedAt)),
      db.select().from(rewardCredits).where(eq(rewardCredits.installerId, installerId)),
    ])
      .then(([projectRows, creditRows]) => {
        setState({
          projects: projectRows,
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

  const recentProjects = state.projects.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tealHeader}>
          <View style={styles.headerInner}>
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
                  premium
                  style={styles.featureCard}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <RewardTrackerCard
            verifiedSqft={state.verifiedSqft}
            pendingSqft={state.pendingSqft}
            onPress={() => push('/(app)/rewards')}
          />

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
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: {
    flexGrow: 1,
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
  headerInner: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    gap: Spacing.base,
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
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    gap: Spacing.lg,
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
    color: Colors.darkTeal,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
  },
  projectList: {
    gap: Spacing.sm,
  },
});
