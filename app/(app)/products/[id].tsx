import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { products } from '@/database/schema/products';
import type { Product } from '@/database/schema/products';
import { Card, Badge } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;
    db.select().from(products).where(eq(products.id, id)).then((rows) => {
      setProduct(rows[0] ?? null);
    }).catch(console.error);
  }, [id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Badge
          label={product.category.replace(/_/g, ' ')}
          variant={product.category === 'primer' ? 'warning' : product.category === 'sealer' ? 'success' : 'neutral'}
        />
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.sku}>{product.sku}</Text>

        <View style={styles.statsGrid}>
          {product.coverageMinSqmPerKg != null && (
            <StatCard label="Coverage" value={`${product.coverageMinSqmPerKg}–${product.coverageMaxSqmPerKg} m²/kg`} />
          )}
          {product.potLifeMinutes != null && (
            <StatCard label="Pot Life" value={`${product.potLifeMinutes} min`} />
          )}
          {product.cureTimeHours != null && (
            <StatCard label="Cure Time" value={`${product.cureTimeHours} h`} />
          )}
          {product.packSizeKg != null && (
            <StatCard label="Pack Size" value={`${product.packSizeKg} kg`} />
          )}
        </View>

        <Card style={styles.tdsCard}>
          <Text style={styles.tdsLabel}>Technical Data Sheet</Text>
          <Text style={styles.tdsContent}>{product.tdsContent}</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card elevated style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  back: { marginBottom: Spacing.sm },
  name: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    marginTop: Spacing.sm,
  },
  sku: { color: Colors.textSecondary, fontSize: Typography.size.sm },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: { flex: 1, minWidth: 140, alignItems: 'center', padding: Spacing.md },
  statValue: { color: Colors.primary, fontSize: Typography.size.lg, fontWeight: Typography.weight.bold },
  statLabel: { color: Colors.textSecondary, fontSize: Typography.size.sm, marginTop: 2 },
  tdsCard: { marginTop: Spacing.sm },
  tdsLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: Spacing.sm,
  },
  tdsContent: {
    color: Colors.textPrimary,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.7,
  },
  loading: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl },
});
