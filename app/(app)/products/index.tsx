import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Badge, Card, EmptyState, SearchBar } from '@/components/ui';
import { DocumentPagePreview } from '@/components/library/DocumentPagePreview';
import {
  DOC_GROUPS,
  PRODUCT_DOCS,
  countDocsForGroup,
  filterDocs,
  getDocBadgeVariant,
} from '@/knowledge/doc-catalog';
import type { DocGroupId } from '@/knowledge/doc-catalog';
import { getDocumentPageAsset, getDocumentSourceUrl } from '@/knowledge/document-page-assets';
import { Colors, Fonts, Layout, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';

function isDocGroupId(value: unknown): value is DocGroupId {
  return typeof value === 'string' && DOC_GROUPS.some((group) => group.id === value);
}

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ group?: string }>();
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<DocGroupId>(isDocGroupId(params.group) ? params.group : 'x-bond');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isDocGroupId(params.group)) setSelectedGroup(params.group);
  }, [params.group]);

  const selectedMeta = DOC_GROUPS.find((group) => group.id === selectedGroup) ?? DOC_GROUPS[0];
  const filtered = useMemo(
    () => filterDocs(PRODUCT_DOCS, selectedGroup, query),
    [query, selectedGroup],
  );

  useEffect(() => {
    setExpandedDocId(null);
  }, [query, selectedGroup]);

  async function openSourcePdf(sourceDocument: string) {
    const sourceUrl = getDocumentSourceUrl(sourceDocument);
    if (sourceUrl) await Linking.openURL(sourceUrl);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppHeader title="Product Docs" subtitle="Semco sheets grouped by field task." rightIcon="document-text-outline" />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search sheets, SDS, or system..." showMic={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupRow}>
          {DOC_GROUPS.map((group) => {
            const active = group.id === selectedGroup;
            return (
              <TouchableOpacity
                key={group.id}
                onPress={() => setSelectedGroup(group.id)}
                activeOpacity={0.76}
                style={[styles.groupChip, active && styles.groupChipActive]}
              >
                <Text style={[styles.groupText, active && styles.groupTextActive]}>{group.label}</Text>
                <Text style={[styles.groupCount, active && styles.groupCountActive]}>{countDocsForGroup(group.id)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(doc) => doc.id}
        ListHeaderComponent={
          <Card style={styles.groupSummary}>
            <View style={styles.groupSummaryTop}>
              <Text style={styles.groupTitle}>{selectedMeta.label}</Text>
              <Badge label={`${filtered.length} docs`} variant="primary" />
            </View>
            <Text style={styles.groupDescription}>{selectedMeta.description}</Text>
          </Card>
        }
        renderItem={({ item }) => {
          const expanded = expandedDocId === item.id;
          const hasPreview = Boolean(getDocumentPageAsset(item.sourceDocument));
          const sourceUrl = getDocumentSourceUrl(item.sourceDocument);

          return (
            <View style={[styles.docCard, expanded && styles.docCardExpanded]}>
              <TouchableOpacity
                onPress={() => setExpandedDocId(expanded ? null : item.id)}
                style={styles.row}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                accessibilityHint="Expands the document preview and source actions"
              >
                <View style={styles.rowLeft}>
                  <View style={styles.badgeRow}>
                    <Badge label={item.category} variant={getDocBadgeVariant(item.category)} />
                    <Text style={styles.pageCount}>{item.pageCount} p</Text>
                  </View>
                  <Text style={styles.productName}>{item.title}</Text>
                  <Text style={styles.sku}>{item.sourceDocument}</Text>
                  <Text style={styles.meta}>{hasPreview ? 'Tap to preview official page' : 'Loaded for Ask Semco'}</Text>
                </View>
                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textDisabled} />
              </TouchableOpacity>

              {expanded ? (
                <View style={styles.expandedContent}>
                  {hasPreview ? (
                    <DocumentPagePreview sourceDocument={item.sourceDocument} compact />
                  ) : (
                    <View style={styles.noPreview}>
                      <Ionicons name="document-text-outline" size={20} color={Colors.textDisabled} />
                      <Text style={styles.noPreviewText}>
                        This reference is available for Ask Semco search, but a visual preview is not bundled.
                      </Text>
                    </View>
                  )}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => router.push('/assistant' as any)}
                      activeOpacity={0.78}
                      style={[styles.docAction, styles.docActionPrimary]}
                    >
                      <Ionicons name="chatbubble-ellipses-outline" size={17} color={Colors.white} />
                      <Text style={styles.docActionPrimaryText}>Ask about this</Text>
                    </TouchableOpacity>
                    {sourceUrl ? (
                      <TouchableOpacity
                        onPress={() => openSourcePdf(item.sourceDocument)}
                        activeOpacity={0.78}
                        style={styles.docAction}
                      >
                        <Ionicons name="open-outline" size={17} color={Colors.primary} />
                        <Text style={styles.docActionText}>Open PDF</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="document-text-outline" title="No docs found" body="Try another product, system, or SDS term." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  header: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  groupRow: { gap: Spacing.sm, paddingRight: Spacing.base },
  groupChip: {
    minHeight: 40,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groupChipActive: {
    backgroundColor: Colors.semcoOrange,
    borderColor: Colors.semcoOrange,
  },
  groupText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  groupTextActive: { color: Colors.white },
  groupCount: {
    color: Colors.textDisabled,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  groupCountActive: { color: Colors.white },
  list: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl + 44,
  },
  groupSummary: { gap: Spacing.xs, marginBottom: Spacing.md, backgroundColor: Colors.primaryMuted },
  groupSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  groupTitle: {
    color: Colors.navy,
    fontSize: Typography.size.lg,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  groupDescription: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.sm * 1.45,
  },
  docCard: {
    minHeight: TAP_TARGET_MIN,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  docCardExpanded: {
    borderColor: Colors.primaryMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rowLeft: { flex: 1, gap: Spacing.xs },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  pageCount: {
    color: Colors.textDisabled,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  productName: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  sku: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.medium },
  meta: { color: Colors.textDisabled, fontSize: Typography.size.xs, fontFamily: Fonts.regular },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  noPreview: {
    minHeight: 96,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  noPreviewText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    lineHeight: Typography.size.sm * 1.4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  docAction: {
    minHeight: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    flexGrow: 1,
  },
  docActionPrimary: {
    backgroundColor: Colors.semcoOrange,
    borderColor: Colors.semcoOrange,
  },
  docActionText: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  docActionPrimaryText: {
    color: Colors.white,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
});
