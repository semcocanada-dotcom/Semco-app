import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  { title: 'Install Guides', description: 'X-Bond diagrams', icon: 'layers-outline' as const, route: '/library/guides' },
  { title: 'Products', description: 'Docs + SDS', icon: 'document-text-outline' as const, route: '/products' },
  { title: 'Photos', description: 'Stage records', icon: 'camera-outline' as const, route: '/add' },
  { title: 'Project Forms', description: 'Sign-offs', icon: 'clipboard-outline' as const, route: '/projects' },
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

export default function LibraryScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as any);
  const keyDocs = KEY_DOC_IDS
    .map((id) => PRODUCT_DOCS.find((doc) => doc.id === id))
    .filter((doc): doc is (typeof PRODUCT_DOCS)[number] => Boolean(doc));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <BrandMark />
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>Library</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Semco Library</Text>
          <Text style={styles.heroBody}>Install guides, product documents, stage photos, and Semco Guide.</Text>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Main tools" />
          <View style={styles.cardsGrid}>
            {HUB_CARDS.map((card, index) => (
              <ActionCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                tone="primary"
                onPress={() => push(card.route)}
                premium
                style={styles.hubCard}
              />
            ))}
          </View>
          <TouchableOpacity onPress={() => push('/assistant')} activeOpacity={0.78} style={styles.askBand}>
            <View style={styles.askIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.askCopy}>
              <Text style={styles.askTitle}>Semco Guide</Text>
              <Text style={styles.askBody}>Ask an install question and get a guided answer from the loaded Semco docs.</Text>
            </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.darkTeal} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Install guides"
            subtitle={`${INSTALLATION_GUIDES.length} official diagrams`}
            actionLabel="View all"
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
          <SectionHeader title="Product docs" subtitle="Browse by category." />
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
          <SectionHeader title="Core references" subtitle={`${TECHNICAL_DOC_PAGES.length} searchable pages loaded.`} />
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
  heroCard: {
    gap: Spacing.md,
    borderColor: '#00686B',
    backgroundColor: Colors.navy,
    shadowColor: Colors.navy,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  heroPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    backgroundColor: 'rgba(5,186,194,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(221,244,245,0.24)',
  },
  heroPillText: {
    color: '#DDF4F5',
    fontSize: Typography.size.xs,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: Colors.white,
    fontSize: Typography.size.xl,
    lineHeight: Typography.size.xl * 1.14,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  heroBody: {
    color: '#DDF4F5',
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    fontFamily: Fonts.regular,
  },
  section: { gap: Spacing.md },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  hubCard: { width: '48.5%', flexBasis: '48.5%', flexGrow: 0 },
  askBand: {
    minHeight: 84,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.accentMuted,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.navy,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  askIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
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
});
