import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '@/database/client';
import { colors } from '@/database/schema/colors';
import type { Color } from '@/database/schema/colors';
import { ColorSwatch } from '@/components/colors/ColorSwatch';
import { AppHeader, Button, EmptyState, SearchBar } from '@/components/ui';
import { Colors, Fonts, Typography, Spacing } from '@/constants/theme';

export default function ColorsScreen() {
  const [allColors, setAllColors] = useState<Color[]>([]);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    db.select().from(colors).then(setAllColors).catch(console.error);
  }, []);

  const filtered = query.trim()
    ? allColors.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.code ?? '').toLowerCase().includes(query.toLowerCase()),
      )
    : allColors;

  const standard = filtered.filter((c) => c.isStandard);
  const custom = filtered.filter((c) => !c.isStandard);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppHeader title="Color Library" subtitle={`${standard.length || allColors.length} XBond colors`} rightIcon="color-palette-outline" />
        <Button label="Add Color" variant="primary" onPress={() => router.push('/(app)/colors/create')} fullWidth />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search by name or code..." showMic={false} />
      </View>

      <FlatList
        data={[
          ...(standard.length > 0 ? [{ type: 'header', label: `Standard Semco Colors (${standard.length})` } as const] : []),
          ...standard.map((c) => ({ type: 'color', color: c } as const)),
          ...(custom.length > 0 ? [{ type: 'header', label: 'My Custom Colors' } as const] : []),
          ...custom.map((c) => ({ type: 'color', color: c } as const)),
        ]}
        keyExtractor={(item) => (item.type === 'header' ? item.label : item.color.id)}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <Text style={styles.sectionHeader}>{item.label}</Text>;
          }
          return (
            <ColorSwatch
              color={item.color}
              onPress={() => router.push({ pathname: '/(app)/colors/[id]', params: { id: item.color.id } })}
              style={styles.colorItem}
            />
          );
        }}
        contentContainerStyle={styles.list}
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
  sectionHeader: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  colorItem: { marginBottom: Spacing.sm },
});
