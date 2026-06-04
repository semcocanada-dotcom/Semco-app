import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Badge, Card, EmptyState, SearchBar } from '@/components/ui';
import {
  DOC_GROUPS,
  PRODUCT_DOCS,
  countDocsForGroup,
  filterDocs,
  getDocBadgeVariant,
} from '@/knowledge/doc-catalog';
import type { DocGroupId } from '@/knowledge/doc-catalog';
import { Colors, Fonts, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';

function isDocGroupId(value: unknown): value is DocGroupId {
  return typeof value === 'string' && DOC_GROUPS.some((group) => group.id === value);
}

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ group?: string }>();
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<DocGroupId>(isDocGroupId(params.group) ? params.group : 'x-bond');
  const router = useRouter();

  useEffect(() => {
    if (isDocGroupId(params.group)) setSelectedGroup(params.group);
  }, [params.group]);

  const selectedMeta = DOC_GROUPS.find((group) => group.id === selectedGroup) ?? DOC_GROUPS[0];
  const filtered = useMemo(
    () => filterDocs(PRODUCT_DOCS, selectedGroup, query),
    [query, selectedGroup],
  );

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
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push('/assistant' as any)}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            accessibilityHint="Opens Ask Semco to ask about this document"
          >
            <View style={styles.rowLeft}>
              <View style={styles.badgeRow}>
                <Badge label={item.category} variant={getDocBadgeVariant(item.category)} />
                <Text style={styles.pageCount}>{item.pageCount} p</Text>
              </View>
              <Text style={styles.productName}>{item.title}</Text>
              <Text style={styles.sku}>{item.sourceDocument}</Text>
              <Text style={styles.meta}>Loaded for Ask Semco</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textDisabled} />
          </TouchableOpacity>
        )}
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
  header: { padding: Spacing.base, gap: Spacing.md },
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
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl + 44 },
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TAP_TARGET_MIN,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
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
});
