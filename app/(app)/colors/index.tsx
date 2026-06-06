import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db, initDatabase } from '@/database/client';
import { seedDatabase } from '@/database/seed';
import colorsData from '@/database/seed/colors.json';
import { colors } from '@/database/schema/colors';
import type { Color } from '@/database/schema/colors';
import { ColorTile } from '@/components/colors/ColorTile';
import { AppHeader, EmptyState, SearchBar } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

const STANDARD_COLORS = colorsData as Color[];
type ColorSeries = 'all' | 'P' | 'T' | 'D' | 'C' | 'custom';

const SERIES_OPTIONS: { value: ColorSeries; label: string; shortLabel: string }[] = [
  { value: 'all', label: 'All fan deck colours', shortLabel: 'All' },
  { value: 'P', label: 'P Series colours', shortLabel: 'P Series' },
  { value: 'T', label: 'T Series colours', shortLabel: 'T Series' },
  { value: 'D', label: 'D Series colours', shortLabel: 'D Series' },
  { value: 'C', label: 'C Series colours', shortLabel: 'C Series' },
  { value: 'custom', label: 'Custom colours', shortLabel: 'Custom' },
];

const FAN_DECK_ORDER = STANDARD_COLORS.reduce<Record<string, number>>((order, color, index) => {
  order[color.id] = index;
  if (color.code) order[color.code.toUpperCase()] = index;
  return order;
}, {});

function getColorSeries(color: Color): ColorSeries {
  if (!color.isStandard) return 'custom';
  const suffix = String(color.code ?? '').match(/[A-Za-z]+$/)?.[0]?.toUpperCase();
  return suffix === 'P' || suffix === 'T' || suffix === 'D' || suffix === 'C' ? suffix : 'all';
}

function getFanDeckIndex(color: Color): number {
  const byId = FAN_DECK_ORDER[color.id];
  const byCode = color.code ? FAN_DECK_ORDER[color.code.toUpperCase()] : undefined;
  return byId ?? byCode ?? Number.MAX_SAFE_INTEGER;
}

function sortByFanDeck(a: Color, b: Color): number {
  if (a.isStandard !== b.isStandard) return a.isStandard ? -1 : 1;
  const orderDelta = getFanDeckIndex(a) - getFanDeckIndex(b);
  if (orderDelta !== 0) return orderDelta;
  return String(a.code ?? a.name ?? '').localeCompare(String(b.code ?? b.name ?? ''));
}

export default function ColorsScreen() {
  const [allColors, setAllColors] = useState<Color[]>(STANDARD_COLORS);
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState<ColorSeries>('all');
  const router = useRouter();
  const { width } = useWindowDimensions();
  const numColumns = width >= 720 ? 8 : width >= 560 ? 7 : width >= 430 ? 6 : 5;
  const horizontalPadding = Spacing.base * 2;
  const gridGap = 6;
  const tileSize = Math.max(
    48,
    Math.floor((width - horizontalPadding - gridGap * (numColumns - 1)) / numColumns),
  );

  useEffect(() => {
    let isMounted = true;

    async function loadColors() {
      try {
        await initDatabase();
        await seedDatabase();
        const rows = await db.select().from(colors);
        if (isMounted && rows.length > 0) setAllColors(rows);
      } catch (error) {
        console.error(error);
        if (isMounted) setAllColors(STANDARD_COLORS);
      }
    }

    loadColors();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sorted = [...allColors].sort(sortByFanDeck);
    const seriesFiltered =
      series === 'all' ? sorted : sorted.filter((color) => getColorSeries(color) === series);

    if (!normalizedQuery) return seriesFiltered;

    return seriesFiltered.filter((color) => {
      const searchable = [
        color.name,
        color.code,
        color.swatchHex,
        getColorSeries(color),
        color.isStandard ? 'standard' : 'custom',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [allColors, query, series]);

  const standardCount = filtered.filter((c) => c.isStandard).length;
  const activeSeries = SERIES_OPTIONS.find((option) => option.value === series) ?? SERIES_OPTIONS[0];
  const resultLabel = query.trim()
    ? `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`
    : `${activeSeries.label} - ${standardCount || filtered.length} XBond colours`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppHeader title="Colour Library" subtitle={resultLabel} rightIcon="color-palette-outline" />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search colour name, code, or tone..." showMic={false} />
        <View style={styles.filterHeader}>
          <View>
            <Text style={styles.filterLabel}>Fan deck group</Text>
            <Text style={styles.filterTitle}>{activeSeries.shortLabel} · {filtered.length}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(app)/colors/create')}
            style={styles.customButton}
            accessibilityRole="button"
            accessibilityLabel="Add custom colour"
          >
            <Ionicons name="add" size={18} color={Colors.white} />
            <Text style={styles.customButtonText}>Custom</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.seriesRow}
        >
          {SERIES_OPTIONS.map((option) => {
            const active = option.value === series;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSeries(option.value)}
                activeOpacity={0.76}
                style={[styles.seriesChip, active && styles.seriesChipActive]}
              >
                <Text style={[styles.seriesText, active && styles.seriesTextActive]}>{option.shortLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        key={`color-grid-${numColumns}`}
        data={filtered}
        numColumns={numColumns}
        keyExtractor={(item, index) => item.id || `${item.code ?? item.name}-${index}`}
        renderItem={({ item }) => (
          <ColorTile
            color={item}
            size={tileSize}
            onPress={() => router.push({ pathname: '/colors/[id]', params: { id: item.id } } as any)}
          />
        )}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState icon="color-palette-outline" title="No colors found" body="Try another color name or code." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  header: { padding: Spacing.base, paddingBottom: Spacing.sm, gap: Spacing.sm },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  filterLabel: {
    color: Colors.darkTeal,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
  },
  filterTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  customButton: {
    minHeight: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.semcoOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
  },
  customButtonText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xs,
  },
  seriesRow: {
    gap: 6,
    paddingRight: Spacing.base,
  },
  seriesChip: {
    minHeight: 34,
    minWidth: 74,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.lightTeal,
  },
  seriesChipActive: {
    backgroundColor: Colors.semcoOrange,
    borderColor: Colors.semcoOrange,
  },
  seriesText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
  },
  seriesTextActive: {
    color: Colors.white,
  },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl + 44 },
  emptyList: { flexGrow: 1 },
  gridRow: { gap: 6, marginBottom: 6 },
});
