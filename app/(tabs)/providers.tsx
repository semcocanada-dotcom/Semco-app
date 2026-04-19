import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  ScrollView,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@constants/colors';
import { supabase } from '@lib/supabase';
import type { Provider, ProviderCategory } from '@lib/types';

// ─── Category config ────────────────────────────────────────────────────────

const CATEGORIES: { value: ProviderCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all',                 label: 'All',              emoji: '🔍' },
  { value: 'aba_ibi',             label: 'ABA / IBI',        emoji: '🧩' },
  { value: 'speech_language',     label: 'Speech',           emoji: '🗣️' },
  { value: 'occupational_therapy',label: 'OT',               emoji: '✋' },
  { value: 'physical_therapy',    label: 'PT',               emoji: '🏃' },
  { value: 'psychology',          label: 'Psychology',       emoji: '🧠' },
  { value: 'respite',             label: 'Respite',          emoji: '🏠' },
  { value: 'swimming',            label: 'Swimming',         emoji: '🏊' },
  { value: 'social_skills',       label: 'Social Skills',    emoji: '👫' },
  { value: 'music_therapy',       label: 'Music',            emoji: '🎵' },
  { value: 'art_therapy',         label: 'Art',              emoji: '🎨' },
  { value: 'assistive_technology',label: 'Assistive Tech',   emoji: '📱' },
  { value: 'other',               label: 'Other',            emoji: '📋' },
];

const CATEGORY_GRADIENT: Record<string, readonly [string, string]> = {
  aba_ibi:              Colors.gradients.purple,
  speech_language:      Colors.gradients.blue,
  occupational_therapy: Colors.gradients.teal,
  physical_therapy:     Colors.gradients.green,
  psychology:           Colors.gradients.coral,
  respite:              Colors.gradients.amber,
  swimming:             Colors.gradients.blue,
  social_skills:        Colors.gradients.purple,
  music_therapy:        Colors.gradients.teal,
  art_therapy:          Colors.gradients.coral,
  assistive_technology: Colors.gradients.green,
  other:                ['#9CA3AF', '#6B7280'] as const,
};

function categoryLabel(cat: ProviderCategory): string {
  return CATEGORIES.find(c => c.value === cat)?.label ?? cat;
}
function categoryEmoji(cat: ProviderCategory): string {
  return CATEGORIES.find(c => c.value === cat)?.emoji ?? '📋';
}

// ─── ProviderCard ────────────────────────────────────────────────────────────

function ProviderCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const gradient = CATEGORY_GRADIENT[provider.category] ?? (['#9CA3AF', '#6B7280'] as const);
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      <View style={styles.cardInner}>
        {/* Category badge */}
        <LinearGradient
          colors={gradient as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>
            {categoryEmoji(provider.category)}  {categoryLabel(provider.category)}
          </Text>
        </LinearGradient>

        {/* Name */}
        <Text style={styles.providerName} numberOfLines={2}>{provider.name}</Text>

        {/* City */}
        {!!provider.city && (
          <Text style={styles.providerCity}>📍 {provider.city}, SK</Text>
        )}

        {/* Contact chips */}
        <View style={styles.contactRow}>
          {!!provider.phone && (
            <TouchableOpacity
              style={styles.contactChip}
              onPress={e => { e.stopPropagation?.(); Linking.openURL(`tel:${provider.phone}`); }}
            >
              <Text style={styles.contactChipText}>📞 Call</Text>
            </TouchableOpacity>
          )}
          {!!provider.email && (
            <TouchableOpacity
              style={styles.contactChip}
              onPress={e => { e.stopPropagation?.(); Linking.openURL(`mailto:${provider.email}`); }}
            >
              <Text style={styles.contactChipText}>✉️ Email</Text>
            </TouchableOpacity>
          )}
          {!!provider.website && (
            <TouchableOpacity
              style={styles.contactChip}
              onPress={e => { e.stopPropagation?.(); Linking.openURL(provider.website!); }}
            >
              <Text style={styles.contactChipText}>🌐 Website</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── ProviderDetail modal ────────────────────────────────────────────────────

function ProviderDetailModal({ provider, onClose }: { provider: Provider | null; onClose: () => void }) {
  if (!provider) return null;
  const gradient = CATEGORY_GRADIENT[provider.category] ?? (['#9CA3AF', '#6B7280'] as const);

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
        {/* Header */}
        <LinearGradient
          colors={gradient as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modalHeader}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalEmoji}>{categoryEmoji(provider.category)}</Text>
          <Text style={styles.modalCategory}>{categoryLabel(provider.category)}</Text>
          <Text style={styles.modalName}>{provider.name}</Text>
          {!!provider.city && (
            <Text style={styles.modalCity}>📍 {provider.city}, SK</Text>
          )}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalBody}>
          {/* Contact section */}
          <Text style={styles.sectionLabel}>Contact</Text>
          <View style={styles.detailCard}>
            {provider.phone ? (
              <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(`tel:${provider.phone}`)}>
                <Text style={styles.detailIcon}>📞</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={[styles.detailValue, styles.link]}>{provider.phone}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📞</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailMuted}>Not listed</Text>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            {provider.email ? (
              <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(`mailto:${provider.email}`)}>
                <Text style={styles.detailIcon}>✉️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={[styles.detailValue, styles.link]} numberOfLines={1}>{provider.email}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>✉️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailMuted}>Not listed</Text>
                </View>
              </View>
            )}

            {!!provider.website && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.detailRow} onPress={() => Linking.openURL(provider.website!)}>
                  <Text style={styles.detailIcon}>🌐</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>Website</Text>
                    <Text style={[styles.detailValue, styles.link]} numberOfLines={1}>
                      {provider.website?.replace(/^https?:\/\/(www\.)?/, '')}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Location */}
          {(!!provider.address || !!provider.city) && (
            <>
              <Text style={styles.sectionLabel}>Location</Text>
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    {!!provider.address && <Text style={styles.detailValue}>{provider.address}</Text>}
                    <Text style={styles.detailValue}>{[provider.city, provider.province].filter(Boolean).join(', ')}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* SK Approved badge */}
          {provider.is_approved_sk && (
            <View style={styles.approvedBadge}>
              <Text style={styles.approvedText}>✓ Saskatchewan IAF Approved Provider</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ProvidersScreen() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filtered, setFiltered] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProviderCategory | 'all'>('all');
  const [selected, setSelected] = useState<Provider | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all providers once
  useEffect(() => {
    supabase
      .from('providers')
      .select('*')
      .eq('is_approved_sk', true)
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) {
          setProviders(data as Provider[]);
          setFiltered(data as Provider[]);
        }
        setLoading(false);
      });
  }, []);

  // Filter whenever search or category changes
  const applyFilter = useCallback(
    (query: string, cat: ProviderCategory | 'all', list: Provider[]) => {
      const q = query.toLowerCase().trim();
      const result = list.filter(p => {
        const matchCat = cat === 'all' || p.category === cat;
        if (!matchCat) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.city?.toLowerCase().includes(q) ?? false) ||
          (p.email?.toLowerCase().includes(q) ?? false) ||
          (p.website?.toLowerCase().includes(q) ?? false)
        );
      });
      setFiltered(result);
    },
    []
  );

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => applyFilter(text, activeCategory, providers), 200);
  };

  const handleCategory = (cat: ProviderCategory | 'all') => {
    setActiveCategory(cat);
    applyFilter(search, cat, providers);
  };

  const renderItem = useCallback(
    ({ item }: { item: Provider }) => (
      <ProviderCard provider={item} onPress={() => setSelected(item)} />
    ),
    []
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SK Providers</Text>
        <Text style={styles.headerSub}>
          {loading ? 'Loading...' : `${filtered.length} of ${providers.length} providers`}
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, city…"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}
        keyboardShouldPersistTaps="always"
      >
        {CATEGORIES.map(cat => {
          const active = activeCategory === cat.value;
          const gradient = cat.value === 'all'
            ? Colors.gradients.purple
            : (CATEGORY_GRADIENT[cat.value] ?? Colors.gradients.purple);
          return active ? (
            <LinearGradient
              key={cat.value}
              colors={gradient as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.catChipActive}
            >
              <TouchableOpacity onPress={() => handleCategory(cat.value)} activeOpacity={0.9}>
                <Text style={styles.catChipTextActive}>{cat.emoji} {cat.label}</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              key={cat.value}
              style={styles.catChip}
              onPress={() => handleCategory(cat.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.catChipText}>{cat.emoji} {cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.purple} />
          <Text style={styles.loadingText}>Loading providers…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🔎</Text>
          <Text style={styles.emptyTitle}>No providers found</Text>
          <Text style={styles.emptySubtitle}>Try a different search or category</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={12}
          maxToRenderPerBatch={20}
          windowSize={10}
          removeClippedSubviews
        />
      )}

      {/* Detail modal */}
      <ProviderDetailModal provider={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  catScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexDirection: 'row',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  catChipActive: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  catChipTextActive: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInner: {
    padding: 14,
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  providerCity: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  contactChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactChipText: {
    fontSize: 12,
    color: Colors.purple,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  // Modal
  modalHeader: {
    padding: 24,
    paddingTop: 16,
    alignItems: 'center',
    gap: 4,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  closeBtnText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  modalCategory: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalCity: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  modalBody: {
    padding: 20,
    gap: 8,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  detailIcon: { fontSize: 20 },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  detailMuted: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  link: {
    color: Colors.purple,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  approvedBadge: {
    marginTop: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  approvedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
});
