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
import { Badge, Button, Card } from '@/components/ui';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

type LoadState = {
  projects: Project[];
  products: Product[];
  colors: Color[];
};

type StatTone = 'primary' | 'accent' | 'success' | 'neutral';

type ActionTone = 'primary' | 'accent' | 'success' | 'neutral';

const QUICK_ACTIONS: {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone: ActionTone;
  route: string;
}[] = [
  { title: 'Projects', subtitle: 'Live jobs', icon: 'folder-open-outline', tone: 'primary', route: '/(app)/projects' },
  { title: 'Library', subtitle: 'Materials', icon: 'library-outline', tone: 'accent', route: '/(app)/library' },
  { title: 'Assistant', subtitle: 'Ask AI', icon: 'chatbubble-ellipses-outline', tone: 'success', route: '/(app)/assistant' },
  { title: 'Calc', subtitle: 'Takeoff', icon: 'calculator-outline', tone: 'neutral', route: '/(app)/calculator' },
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
      {
        label: 'Active Projects',
        value: String(active),
        detail: 'In progress right now',
        icon: 'folder-open-outline' as const,
        tone: 'primary' as const,
      },
      {
        label: 'Library Products',
        value: String(state.products.length),
        detail: 'Seeded materials loaded',
        icon: 'cube-outline' as const,
        tone: 'accent' as const,
      },
      {
        label: 'Standard Colours',
        value: String(state.colors.filter((color) => color.isStandard).length),
        detail: 'Current palette entries',
        icon: 'color-palette-outline' as const,
        tone: 'success' as const,
      },
      {
        label: 'Completed Jobs',
        value: String(complete),
        detail: 'Closed out projects',
        icon: 'checkmark-done-outline' as const,
        tone: 'neutral' as const,
      },
    ];
  }, [state.colors, state.projects, state.products]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />

          <View style={styles.heroTop}>
            <View style={styles.brandBlock}>
              <View style={styles.brandMark}>
                <View style={styles.brandMarkCore} />
              </View>
              <View>
                <Text style={styles.brandTitle}>Semco Pro</Text>
                <Text style={styles.brandSub}>Installer workspace</Text>
              </View>
            </View>

            <Badge label="Studio shell" variant="accent" style={styles.badge} />
          </View>

          <Text style={styles.heroTitle}>Build Semco installs from one premium workspace.</Text>
          <Text style={styles.heroBody}>
            Dashboard, projects, library and fast actions live in one dark interface tuned for the proposed rendering.
          </Text>

          <View style={styles.heroButtons}>
            <Button label="New project" variant="accent" onPress={() => push('/projects/create')} style={styles.heroButton} />
            <Button label="Open library" variant="secondary" onPress={() => push('/library')} style={styles.heroButton} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statCard, statToneStyles[stat.tone]]}>
              <View style={styles.statIconWrap}>
                <Ionicons
                  name={stat.icon}
                  size={18}
                  color={stat.tone === 'accent' ? Colors.accent : stat.tone === 'primary' ? Colors.primary : stat.tone === 'success' ? Colors.success : Colors.textSecondary}
                />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statDetail}>{stat.detail}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <Text style={styles.sectionSubtitle}>Keep the most used tasks one tap away.</Text>
        </View>

        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity key={action.title} activeOpacity={0.82} onPress={() => push(action.route)} style={[styles.actionCard, actionToneStyles[action.tone]]}>
              <View style={styles.actionIconWrap}>
                <Ionicons
                  name={action.icon}
                  size={24}
                  color={action.tone === 'accent' ? Colors.accent : action.tone === 'primary' ? Colors.primary : action.tone === 'success' ? Colors.success : Colors.textSecondary}
                />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.footerCard}>
          <View style={styles.footerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.footerTitle}>Ready for the next rendering pass.</Text>
              <Text style={styles.footerBody}>
                The home shell is now set up in the right premium direction. Next we can tighten the projects, library, and assistant screens to match it.
              </Text>
            </View>
            <View style={styles.footerIcon}>
              <Ionicons name="sparkles-outline" size={22} color={Colors.accent} />
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const statToneStyles: Record<StatTone, { borderColor: string }> = {
  primary: { borderColor: Colors.primaryMuted },
  accent: { borderColor: Colors.accentMuted },
  success: { borderColor: Colors.successMuted },
  neutral: { borderColor: Colors.border },
};

const actionToneStyles: Record<ActionTone, { borderColor: string }> = {
  primary: { borderColor: Colors.primaryMuted },
  accent: { borderColor: Colors.accentMuted },
  success: { borderColor: Colors.successMuted },
  neutral: { borderColor: Colors.border },
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 18,
    gap: Spacing.lg,
  },
  heroCard: {
    overflow: 'hidden',
    gap: Spacing.md,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#214043',
    backgroundColor: '#11181D',
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5,
  },
  heroGlowA: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 220,
    top: -120,
    right: -90,
    backgroundColor: 'rgba(46,208,198,0.08)',
  },
  heroGlowB: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 160,
    left: -60,
    bottom: -80,
    backgroundColor: 'rgba(255,138,43,0.08)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  brandMark: {
    width: 62,
    height: 62,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#233238',
    backgroundColor: '#0B1013',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  brandMarkCore: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#090D10',
    borderWidth: 1,
    borderColor: '#171F23',
  },
  brandTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.1,
  },
  brandSub: {
    color: '#93A2A9',
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#4A2208',
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 43,
    lineHeight: 46,
    letterSpacing: -1.15,
    fontWeight: '800',
  },
  heroBody: {
    color: '#99A4AA',
    fontSize: 22,
    lineHeight: 32,
    fontWeight: Typography.weight.regular,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    paddingTop: 2,
  },
  heroButton: {
    flex: 1,
    minWidth: 140,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minHeight: 214,
    borderRadius: 26,
    borderWidth: 1,
    backgroundColor: '#13191D',
    padding: 14,
    gap: 10,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D1215',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#212A2F',
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 58,
    lineHeight: 60,
    letterSpacing: -2,
    fontWeight: '700',
  },
  statLabel: {
    color: '#A6B0B6',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: Typography.weight.medium,
  },
  statDetail: {
    color: '#66767D',
    fontSize: 14,
    lineHeight: 18,
  },
  sectionHead: {
    gap: 6,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  sectionSubtitle: {
    color: '#9AA8AF',
    fontSize: 17,
    lineHeight: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionCard: {
    flex: 1,
    minHeight: 136,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: '#13191D',
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  actionIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0C1114',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#232D32',
  },
  actionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: Typography.weight.bold,
    textAlign: 'center',
  },
  actionSubtitle: {
    color: '#738289',
    fontSize: 12,
    lineHeight: 14,
    textAlign: 'center',
  },
  footerCard: {
    borderColor: '#223135',
    backgroundColor: '#12181C',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  footerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: Typography.weight.bold,
    marginBottom: 4,
  },
  footerBody: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  footerIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
