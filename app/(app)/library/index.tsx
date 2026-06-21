import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db, initDatabase } from '@/database/client';
import { seedDatabase } from '@/database/seed';
import colorsData from '@/database/seed/colors.json';
import { colors } from '@/database/schema/colors';
import type { Color } from '@/database/schema/colors';
import { BrandMark } from '@/components/brand/BrandMark';
import { SystemGuideCard } from '@/components/library/SystemGuideCard';
import { ActionCard, Badge, Card, SectionHeader } from '@/components/ui';
import {
  BROWSABLE_DOC_GROUPS,
  PRODUCT_DOCS,
  countDocsForGroup,
  getDocBadgeVariant,
} from '@/knowledge/doc-catalog';
import type { DocGroupId } from '@/knowledge/doc-catalog';
import { TECHNICAL_DOC_PAGES } from '@/knowledge/technical-docs';
import { INSTALLATION_GUIDES } from '@/knowledge/installation-guides';
import { Colors, Fonts, Layout, Radius, Typography, Spacing } from '@/constants/theme';

const HUB_CARDS = [
  { title: 'System Diagrams', description: 'Layers + process', icon: 'layers-outline' as const, route: '/library/guides' },
  { title: 'Product Docs', description: 'Grouped sheets', icon: 'document-text-outline' as const, route: '/products' },
  { title: 'Colours', description: 'Fan deck', icon: 'color-palette-outline' as const, route: '/colors' },
  { title: 'Calculator', description: 'Tech coverage', icon: 'calculator-outline' as const, route: '/calculator' },
] as const;

const DOC_GROUP_ICONS: Record<DocGroupId, React.ComponentProps<typeof Ionicons>['name']> = {
  all: 'documents-outline',
  'x-bond': 'layers-outline',
  waterproofing: 'water-outline',
  sealers: 'shield-checkmark-outline',
  cleaners: 'sparkles-outline',
  details: 'construct-outline',
  sds: 'warning-outline',
  manuals: 'book-outline',
};

const KEY_DOC_IDS = [
  'doc-x-bondmicrocementdatasheet2024',
  'doc-lm-tech-sheet',
  'doc-natural-shield-tech-sheet',
  'doc-satin-stone-tech-sheet',
  'doc-tech-sheet-titanshield-v8',
  'doc-open-sip-manual-master-copy-v2019-3-2',
];

const STANDARD_COLORS = colorsData as Color[];

function getSwatchColor(color: Color): string {
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color.swatchHex ?? '') ? String(color.swatchHex) : Colors.softGrey;
}

export default function LibraryScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as any);
  const [colorCount, setColorCount] = React.useState(STANDARD_COLORS.length);
  const [colorsList, setColorsList] = React.useState<Color[]>(STANDARD_COLORS.slice(0, 4));
  const keyDocs = KEY_DOC_IDS
    .map((id) => PRODUCT_DOCS.find((doc) => doc.id === id))
    .filter((doc): doc is (typeof PRODUCT_DOCS)[number] => Boolean(doc));

  React.useEffect(() => {
    let isMounted = true;

    async function loadLibrary() {
      try {
        await initDatabase();
        await seedDatabase();
        const colorRows = await db.select().from(colors);
        if (!isMounted) return;
        setColorsList((colorRows.length > 0 ? colorRows : STANDARD_COLORS).slice(0, 4));
        setColorCount(colorRows.length || STANDARD_COLORS.length);
      } catch (error) {
        console.error(error);
        if (!isMounted) return;
        setColorsList(STANDARD_COLORS.slice(0, 4));
        setColorCount(STANDARD_COLORS.length);
      }
    }

    loadLibrary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <BrandMark />
          </View>
          <Text style={styles.heroTitle}>Semco field knowledge, grouped by job task.</Text>
          <Text style={styles.heroBody}>
            Product sheets, SDS, system details, colour formulas, and calculator inputs are organized for quick lookup.
          </Text>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Quick access" subtitle="Open the working surface you need." />
          <View style={styles.cardsGrid}>
            {HUB_CARDS.map((card, index) => (
              <ActionCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                tone={index % 2 === 0 ? 'primary' : 'accent'}
                onPress={() => push(card.route)}
                compact
                style={styles.hubCard}
              />
            ))}
          </View>
          <TouchableOpacity onPress={() => push('/assistant')} activeOpacity={0.78} style={styles.askBand}>
            <View style={styles.askIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.askCopy}>
              <Text style={styles.askTitle}>Ask Semco</Text>
              <Text style={styles.askBody}>Get an installer answer from the loaded Semco docs.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.semcoOrange} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Official diagrams"
            subtitle="Source drawings from Semco documentation."
            actionLabel="All"
            onActionPress={() => push('/library/guides')}
          />
          <View style={styles.guidePreviewList}>
            {INSTALLATION_GUIDES.slice(0, 2).map((guide) => (
              <SystemGuideCard
                key={guide.id}
                guide={guide}
                compact
                onPress={() => push('/library/guides')}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Library groups" subtitle="Browse a smaller set first, then search inside it." />
          <View style={styles.groupGrid}>
            {BROWSABLE_DOC_GROUPS.map((group) => (
              <TouchableOpacity
                key={group.id}
                onPress={() => router.push({ pathname: '/products', params: { group: group.id } } as any)}
                activeOpacity={0.78}
                style={styles.groupCard}
              >
                <View style={styles.groupIcon}>
                  <Ionicons name={DOC_GROUP_ICONS[group.id]} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.groupTitle}>{group.label}</Text>
                <Text style={styles.groupDescription}>{group.description}</Text>
                <Badge label={`${countDocsForGroup(group.id)} docs`} variant="neutral" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Loaded content" subtitle="Seeded references available to the app and Ask Semco." />
          <View style={styles.statsRow}>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{PRODUCT_DOCS.length}</Text>
              <Text style={styles.statLabel}>Docs</Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{TECHNICAL_DOC_PAGES.length}</Text>
              <Text style={styles.statLabel}>Pages</Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{colorCount}</Text>
              <Text style={styles.statLabel}>Colours</Text>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Key references" subtitle="Core docs used by the calculator and installer support." />
          {keyDocs.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              onPress={() => router.push('/assistant' as any)}
              activeOpacity={0.78}
              style={styles.lineCard}
            >
              <View style={styles.lineTop}>
                <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
                <Text style={styles.lineTitle}>{doc.title}</Text>
                <Badge label={doc.category} variant={getDocBadgeVariant(doc.category)} />
              </View>
              <Text style={styles.lineBody}>{doc.sourceDocument} - {doc.pageCount} page{doc.pageCount === 1 ? '' : 's'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Colour fan deck"
            subtitle="The colour grid opens in the imported fan deck order."
            actionLabel="Open"
            onActionPress={() => push('/colors')}
          />
          <View style={styles.colorPreview}>
            {colorsList.map((color) => (
              <View key={color.id} style={styles.colorPreviewItem}>
                <View style={[styles.colorDot, { backgroundColor: getSwatchColor(color) }]} />
                <Text style={styles.colorCode}>{color.code ?? 'Custom'}</Text>
              </View>
            ))}
          </View>
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
  heroCard: { gap: Spacing.md, borderColor: Colors.primaryMuted, backgroundColor: Colors.surfaceElevated },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xl,
    lineHeight: Typography.size.xl * 1.12,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  heroBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    fontFamily: Fonts.regular,
  },
  section: { gap: Spacing.md },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  hubCard: { width: '48.5%', flexBasis: '48.5%', flexGrow: 0 },
  askBand: {
    minHeight: 72,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  askIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#C6EEF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  askCopy: { flex: 1, gap: 2 },
  askTitle: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  askBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
    fontFamily: Fonts.regular,
  },
  guidePreviewList: { gap: Spacing.sm },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  groupCard: {
    width: '48.5%',
    flexBasis: '48.5%',
    flexGrow: 0,
    minHeight: 150,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  groupIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C6EEF0',
  },
  groupTitle: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  groupDescription: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
    fontFamily: Fonts.regular,
    flex: 1,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statBox: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: Spacing.sm },
  statValue: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontFamily: Fonts.bold, fontWeight: Typography.weight.bold },
  statLabel: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.medium, fontWeight: Typography.weight.medium },
  lineCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
  },
  lineTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  lineTitle: { color: Colors.textPrimary, fontSize: Typography.size.base, fontFamily: Fonts.bold, fontWeight: Typography.weight.bold, flex: 1 },
  lineBody: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.regular },
  colorPreview: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  colorPreviewItem: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  colorDot: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  colorCode: {
    color: Colors.navy,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
});
