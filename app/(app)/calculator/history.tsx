import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { desc } from 'drizzle-orm';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/database/client';
import { calculations } from '@/database/schema/calculations';
import { useAuthStore } from '@/store/auth';
import { eq } from 'drizzle-orm';
import { MaterialBreakdownCard } from '@/components/calculator/MaterialBreakdownCard';
import { Card } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants/theme';
import type { Calculation, CalculationResult } from '@/database/schema/calculations';

interface ExpandedCalc {
  id: string;
  result: CalculationResult;
}

export default function CalculationHistoryScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<Calculation[]>([]);
  const [expanded, setExpanded] = useState<ExpandedCalc | null>(null);

  const load = useCallback(() => {
    if (!user?.id) return;
    db.select()
      .from(calculations)
      .where(eq(calculations.installerId, user.id))
      .orderBy(desc(calculations.createdAt))
      .then(setItems)
      .catch(console.error);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = (item: Calculation) => {
    if (expanded?.id === item.id) {
      setExpanded(null);
      return;
    }
    try {
      const result: CalculationResult = typeof item.result === 'string'
        ? JSON.parse(item.result)
        : item.result as unknown as CalculationResult;
      setExpanded({ id: item.id, result });
    } catch {
      // malformed JSON — skip expansion
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.heading}>Calculation History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calculator-outline" size={48} color={Colors.textDisabled} />
            <Text style={styles.emptyText}>No saved calculations yet</Text>
            <Text style={styles.emptyHint}>Run a calculation and tap Save to record it here.</Text>
          </View>
        ) : (
          items.map((item) => (
            <Card key={item.id} style={styles.card}>
              <TouchableOpacity onPress={() => toggleExpand(item)} activeOpacity={0.7}>
                <View style={styles.row}>
                  <View style={styles.meta}>
                    <Text style={styles.substrate}>
                      {item.substrateType.replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.detail}>
                      {item.areaSqm} m²  ·  {item.wastePct}% waste
                    </Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                    <Ionicons
                      name={expanded?.id === item.id ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {expanded?.id === item.id && (
                <View style={styles.breakdown}>
                  <MaterialBreakdownCard result={expanded.result} />
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  heading: { color: Colors.textPrimary, fontSize: Typography.size.lg, fontWeight: Typography.weight.bold },
  scroll: { padding: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing.xxxl },
  card: { padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  meta: { gap: 2 },
  substrate: {
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    textTransform: 'capitalize',
  },
  detail: { color: Colors.textSecondary, fontSize: Typography.size.sm },
  right: { alignItems: 'flex-end', gap: 4 },
  date: { color: Colors.textSecondary, fontSize: Typography.size.sm },
  breakdown: { borderTopWidth: 1, borderTopColor: Colors.border },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: Typography.size.base, fontWeight: Typography.weight.medium },
  emptyHint: { color: Colors.textDisabled, fontSize: Typography.size.sm, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
