import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Badge, EmptyState, SearchBar } from '@/components/ui';
import { TECHNICAL_DOCS, type TechnicalDoc } from '@/knowledge/technical-docs';
import { Colors, Fonts, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';

const PRODUCT_DOCS = TECHNICAL_DOCS.filter((doc) =>
  /(data sheet|datasheet|tech sheet|sds|safety|x-?bond|liquid membrane|natural shield|stone soap|cleaner|sealer|nulif?t)/i.test(
    `${doc.title} ${doc.sourceDocument} ${doc.category}`,
  ),
);

function getBadgeVariant(category: string): 'warning' | 'neutral' | 'primary' | 'success' | 'accent' {
  if (/sds|safety/i.test(category)) return 'warning';
  if (/x-?bond/i.test(category)) return 'accent';
  if (/liquid membrane/i.test(category)) return 'primary';
  if (/brochure|manual/i.test(category)) return 'success';
  return 'neutral';
}

export default function ProductsScreen() {
  const [allDocs, setAllDocs] = useState<TechnicalDoc[]>(PRODUCT_DOCS);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    setAllDocs(PRODUCT_DOCS);
  }, []);

  const filtered = query.trim()
    ? allDocs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.sourceDocument.toLowerCase().includes(query.toLowerCase()) ||
          doc.category.toLowerCase().includes(query.toLowerCase()),
      )
    : allDocs;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppHeader title="Product Docs" subtitle="Verified Semco sheets, SDS, and technical references." rightIcon="document-text-outline" />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search sheets, SDS, or system..." showMic={false} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(doc) => doc.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push('/assistant' as any)}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={styles.rowLeft}>
              <Badge label={item.category} variant={getBadgeVariant(item.category)} />
              <Text style={styles.productName}>{item.title}</Text>
              <Text style={styles.sku}>{item.sourceDocument}</Text>
              <Text style={styles.meta}>{item.pageCount} page{item.pageCount === 1 ? '' : 's'} loaded for Ask Semco</Text>
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
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl + 44 },
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
  productName: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  sku: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.medium },
  meta: { color: Colors.textDisabled, fontSize: Typography.size.xs, fontFamily: Fonts.regular },
});
