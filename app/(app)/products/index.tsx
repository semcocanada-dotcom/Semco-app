import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/database/client';
import { products } from '@/database/schema/products';
import type { Product } from '@/database/schema/products';
import { AppHeader, Badge, EmptyState, SearchBar } from '@/components/ui';
import { Colors, Fonts, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';

const CATEGORY_BADGE: Record<string, 'warning' | 'neutral' | 'primary' | 'success'> = {
  primer: 'warning',
  base_coat: 'neutral',
  finish_coat: 'primary',
  sealer: 'success',
  pigment: 'neutral',
};

const CATEGORY_LABEL: Record<string, string> = {
  primer: 'Primer',
  base_coat: 'Base Coat',
  finish_coat: 'Finish Coat',
  sealer: 'Sealer',
  pigment: 'Pigment',
};

export default function ProductsScreen() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    db.select().from(products).then(setAllProducts).catch(console.error);
  }, []);

  const filtered = query.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()),
      )
    : allProducts;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppHeader title="Product Library" subtitle="Search products, SKUs, and system data." rightIcon="cube-outline" />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search products or SKU..." showMic={false} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(app)/products/[id]', params: { id: item.id } })}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={item.name}
          >
            <View style={styles.rowLeft}>
              <Badge
                label={CATEGORY_LABEL[item.category] ?? item.category}
                variant={CATEGORY_BADGE[item.category] ?? 'neutral'}
              />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.sku}>{item.sku}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textDisabled} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="cube-outline" title="No products found" body="Try another product name or SKU." />
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
});
