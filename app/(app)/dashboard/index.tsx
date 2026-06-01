import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
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
import { Colors, Spacing } from '@/constants/theme';

type LoadState = {
  projects: Project[];
  products: Product[];
  colors: Color[];
};

type ActionTone = 'teal' | 'orange' | 'green' | 'slate';
type StatTone = 'teal' | 'orange';

const QUICK_ACTIONS: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone: ActionTone;
  route: string;
}[] = [
  { title: 'Projects', subtitle: 'Live jobs', icon: 'folder-open-outline', tone: 'teal', route: '/(app)/projects' },
  { title: 'Photos', subtitle: 'Capture stage', icon: 'camera-outline', tone: 'orange', route: '/(app)/add' },
  { title: 'Batches', subtitle: 'Track pours', icon: 'layers-outline', tone: 'green', route: '/(app)/library' },
  { title: 'Calculators', subtitle: 'Estimate fast', icon: 'calculator-outline', tone: 'teal', route: '/(app)/calculator' },
  { title: 'Takeoff', subtitle: 'Measure scope', icon: 'triangle-outline', tone: 'orange', route: '/(app)/calculator' },
  { title: 'Library', subtitle: 'System guide', icon: 'book-outline', tone: 'green', route: '/(app)/library' },
];

const STATUS_MAP: Record<string, { label: string; bg: string; fg: string }> = {
  active: { label: 'In Progress', bg: '#EAF6F7', fg: '#15747A' },
  on_hold: { label: 'Planning', bg: '#FCE9DD', fg: '#BF6428' },
  complete: { label: 'Completed', bg: '#EAF4E7', fg: '#4E7E46' },
};

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

    return [
      { title: 'Projects', value: String(state.projects.length || 0), caption: 'Total', tone: 'teal' as const },
      { title: 'Active', value: String(active || 0), caption: 'Live jobs', tone: 'orange' as const },
      { title: 'Products', value: String(state.products.length || 0), caption: 'Catalog', tone: 'teal' as const },
      { title: 'Colors', value: String(state.colors.length || 0), caption: 'Matched', tone: 'orange' as const },
    ];
  }, [state.projects, state.products, state.colors]);

  const recentProjects = state.projects.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.name}>Dieter</Text>
            </View>

            <View style={styles.bellWrap}>
              <Ionicons name="notifications-outline" size={22} color={Colors.background} />
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>2</Text>
              </View>
            </View>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#6B7E84" />
            <Text style={styles.searchPlaceholder}>Ask a question or search…</Text>
            <Ionicons name="mic-outline" size={17} color="#6B7E84" />
          </View>

          <View style={styles.grid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.title}
                activeOpacity={0.85}
                onPress={() => push(action.route)}
                style={styles.gridItem}
              >
                <View style={[styles.gridIcon, gridToneStyles[action.tone]]}>
                  <Ionicons
                    name={action.icon}
                    size={24}
                    color={action.tone === 'orange' ? Colors.accent : action.tone === 'green' ? '#1A7A68' : Colors.primary}
                  />
                </View>
                <Text style={styles.gridTitle}>{action.title}</Text>
                <Text style={styles.gridSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.title} style={[styles.statCard, statToneStyles[stat.tone]]}>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statCaption}>{stat.caption}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={stat.tone === 'teal' ? '#176E73' : '#B76023'}
                  style={styles.statChevron}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity onPress={() => push('/(app)/projects')} activeOpacity={0.75}>
            <Text style={styles.sectionAction}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.projectList}>
          {recentProjects.length > 0 ? (
            recentProjects.map((project, index) => {
              const status = STATUS_MAP[project.status] ?? STATUS_MAP.active;

              return (
                <TouchableOpacity
                  key={project.id}
                  activeOpacity={0.85}
                  onPress={() => push(`/projects/${project.id}`)}
                  style={styles.projectCard}
                >
                  <View style={[styles.projectThumb, projectThumbStyles[index % projectThumbStyles.length]]}>
                    <Ionicons name="business-outline" size={20} color="#FFFFFF" />
                  </View>

                  <View style={styles.projectBody}>
                    <View style={styles.projectTopRow}>
                      <Text style={styles.projectName} numberOfLines={1}>
                        {project.clientName ?? 'Unnamed Project'}
                      </Text>
                      <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
                      </View>
                    </View>

                    <Text style={styles.projectAddress} numberOfLines={1}>
                      {project.siteAddress ?? 'No address yet'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No projects yet</Text>
              <Text style={styles.emptyBody}>Create the first project to begin tracking jobs, photos, and batches.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const gridToneStyles: Record<ActionTone, { backgroundColor: string; borderColor: string }> = {
  teal: { backgroundColor: '#E9F7F7', borderColor: '#D5EBEA' },
  orange: { backgroundColor: '#FFF0E5', borderColor: '#F7DCC2' },
  green: { backgroundColor: '#ECF6EE', borderColor: '#DCEAD8' },
  slate: { backgroundColor: '#EEF2F4', borderColor: '#D7E0E4' },
};

const statToneStyles: Record<StatTone, { backgroundColor: string; borderColor: string }> = {
  teal: { backgroundColor: '#EAF7F7', borderColor: '#D7E9E8' },
  orange: { backgroundColor: '#FCEBDD', borderColor: '#F0D4BE' },
};

const projectThumbStyles = [
  { backgroundColor: '#C18F71' },
  { backgroundColor: '#6D8B9A' },
  { backgroundColor: '#839A73' },
];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F6F2' },
  scroll: {
    paddingBottom: Spacing.xxxl + 20,
    backgroundColor: '#F5F6F2',
  },
  hero: {
    backgroundColor: '#0D747B',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
    gap: Spacing.base,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    lineHeight: 22,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  bellWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bellBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E65B2E',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  searchBar: {
    height: 48,
    borderRadius: 15,
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#8A9396',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '31.8%',
    minHeight: 98,
    backgroundColor: Colors.textPrimary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  gridTitle: {
    color: '#223032',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  gridSubtitle: {
    color: '#748386',
    fontSize: 10,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48.6%',
    minHeight: 104,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  statTitle: {
    color: '#7A8B8F',
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    color: '#243033',
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '800',
  },
  statCaption: {
    color: '#7A8B8F',
    fontSize: 13,
  },
  statChevron: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -9,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#253133',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionAction: {
    color: '#B95A2A',
    fontSize: 14,
    fontWeight: '600',
  },
  projectList: {
    paddingHorizontal: Spacing.base,
    paddingTop: 10,
    gap: 12,
  },
  projectCard: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E3DF',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  projectThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectBody: {
    flex: 1,
    gap: 6,
  },
  projectTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectName: {
    flex: 1,
    color: '#223032',
    fontSize: 15,
    fontWeight: '700',
  },
  projectAddress: {
    color: '#748386',
    fontSize: 12,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E3DF',
    padding: 16,
  },
  emptyTitle: {
    color: '#223032',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyBody: {
    color: '#748386',
    fontSize: 13,
    lineHeight: 18,
  },
});
