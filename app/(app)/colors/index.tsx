import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/database/client';
import { colors } from '@/database/schema/colors';
import type { Color } from '@/database/schema/colors';
import { ColorSwatch } from '@/components/colors/ColorSwatch';
import { Input } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants/theme';

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
        <Text style={styles.title}>Color Library</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/colors/create')}
          style={styles.addBtn}
          accessibilityLabel="Create custom color"
        >
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or code…"
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={[
          ...(standard.length > 0 ? [{ type: 'header', label: 'Standard Semco Colors' } as const] : []),
          ...standard.map((c) => ({ type: 'color', color: c } as const)),
          ...(custom.length > 0 ? [{ type: 'header', label: 'My Custom Colors' } as const] : []),
          ...custom.map((c) => ({ type: 'color', color: c } as const)),
        ]}
        keyExtractor={(item) => item.type === 'header' ? item.label : item.color.id}
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
          <Text style={styles.empty}>No colors found.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    paddingBottom: 0,
  },
  title: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
  addBtn: { padding: Spacing.xs },
  searchBar: { padding: Spacing.base, paddingTop: Spacing.sm },
  searchInput: { marginBottom: 0 },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  sectionHeader: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  colorItem: { marginBottom: Spacing.sm },
  empty: { color: Colors.textDisabled, textAlign: 'center', marginTop: Spacing.xl },
});
