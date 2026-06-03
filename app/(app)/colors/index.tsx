import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { db, initDatabase } from '@/database/client';
import { seedDatabase } from '@/database/seed';
import colorsData from '@/database/seed/colors.json';
import { colors } from '@/database/schema/colors';
import type { Color } from '@/database/schema/colors';
import { ColorTile } from '@/components/colors/ColorTile';
import { AppHeader, Button, EmptyState, SearchBar } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';

const STANDARD_COLORS = colorsData as Color[];

export default function ColorsScreen() {
  const [allColors, setAllColors] = useState<Color[]>(STANDARD_COLORS);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { width } = useWindowDimensions();
  const numColumns = width >= 560 ? 4 : 3;
  const horizontalPadding = Spacing.base * 2;
  const gridGap = Spacing.sm;
  const tileSize = Math.max(
    72,
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
    const sorted = [...allColors].sort((a, b) => {
      if (a.isStandard !== b.isStandard) return a.isStandard ? -1 : 1;
      return String(a.name ?? '').localeCompare(String(b.name ?? ''));
    });

    if (!normalizedQuery) return sorted;

    return sorted.filter((color) => {
      const searchable = [
        color.name,
        color.code,
        color.swatchHex,
        color.isStandard ? 'standard' : 'custom',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [allColors, query]);

  const standardCount = filtered.filter((c) => c.isStandard).length;
  const resultLabel = query.trim()
    ? `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`
    : `${standardCount || allColors.length} XBond colors`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppHeader title="Color Library" subtitle={resultLabel} rightIcon="color-palette-outline" />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search color name, code, or tone..." showMic={false} />
        <Button label="Add Color" variant="primary" onPress={() => router.push('/(app)/colors/create')} fullWidth />
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
  header: { padding: Spacing.base, gap: Spacing.md },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl + 44 },
  emptyList: { flexGrow: 1 },
  gridRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
