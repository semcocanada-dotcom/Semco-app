import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { router } from 'expo-router';
import { Colors } from '@constants/colors';
import { supabase } from '@lib/supabase';
import type { Provider, ProviderCategory } from '@lib/types';

// ─── Category config ──────────────────────────────────────────────────────────

interface CatMeta {
  label:  string;
  emoji:  string;
  color:  string;  // icon / text color
  bg:     string;  // circle background
}

const CAT_META: Record<string, CatMeta> = {
  speech_language:      { label: 'Speech Therapy',       emoji: '💬', color: '#7C3AED', bg: '#EDE9FE' },
  occupational_therapy: { label: 'Occupational Therapy', emoji: '✋', color: '#059669', bg: '#D1FAE5' },
  aba_ibi:              { label: 'ABA / IBI',             emoji: '🧩', color: '#1D4ED8', bg: '#DBEAFE' },
  psychology:           { label: 'Behaviour / Psychology',emoji: '🧠', color: '#DB2777', bg: '#FCE7F3' },
  physical_therapy:     { label: 'Physical Therapy',      emoji: '🏃', color: '#D97706', bg: '#FEF3C7' },
  respite:              { label: 'Respite Care',          emoji: '🏠', color: '#DC2626', bg: '#FEE2E2' },
  swimming:             { label: 'Swimming',              emoji: '🏊', color: '#0891B2', bg: '#CFFAFE' },
  social_skills:        { label: 'Social Skills',         emoji: '👫', color: '#7C3AED', bg: '#F3E8FF' },
  music_therapy:        { label: 'Music Therapy',         emoji: '🎵', color: '#16A34A', bg: '#F0FDF4' },
  art_therapy:          { label: 'Art Therapy',           emoji: '🎨', color: '#EA580C', bg: '#FFF7ED' },
  assistive_technology: { label: 'Assistive Tech',        emoji: '📱', color: '#0284C7', bg: '#F0F9FF' },
  other:                { label: 'Other',                 emoji: '📋', color: '#6B7280', bg: '#F9FAFB' },
};

function catMeta(cat: ProviderCategory): CatMeta {
  return CAT_META[cat] ?? { label: cat, emoji: '📋', color: '#6B7280', bg: '#F9FAFB' };
}

// Top visible category pills — rest shown when "More" is expanded
const TOP_CATS: (ProviderCategory | 'all')[] = [
  'all', 'speech_language', 'occupational_therapy', 'aba_ibi',
];
const ALL_CATS: (ProviderCategory | 'all')[] = [
  'all', 'speech_language', 'occupational_therapy', 'aba_ibi',
  'psychology', 'physical_therapy', 'respite', 'swimming',
  'social_skills', 'music_therapy', 'art_therapy', 'assistive_technology', 'other',
];

function catLabel(cat: ProviderCategory | 'all'): string {
  if (cat === 'all') return 'All';
  return CAT_META[cat]?.label ?? cat;
}
function catEmoji(cat: ProviderCategory | 'all'): string {
  if (cat === 'all') return '';
  return CAT_META[cat]?.emoji ?? '📋';
}

// ─── Maps helper ──────────────────────────────────────────────────────────────

function openInMaps(address: string) {
  const q = encodeURIComponent(address);
  const url = Platform.OS === 'ios' ? `maps://0,0?q=${q}` : `geo:0,0?q=${q}`;
  Linking.openURL(url).catch(() => Linking.openURL(`https://maps.google.com/maps?q=${q}`));
}

// ─── ProviderCard ─────────────────────────────────────────────────────────────

function ActionButton({
  icon, label, onPress,
}: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={s.actionBtn}
      onPress={e => { e.stopPropagation?.(); onPress(); }}
      activeOpacity={0.7}
    >
      <Text style={s.actionBtnIcon}>{icon}</Text>
      <Text style={s.actionBtnLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ProviderCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const meta = catMeta(provider.category);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={s.card}>
      {/* Top row: icon circle + info + chevron */}
      <View style={s.cardTop}>
        <View style={[s.iconCircle, { backgroundColor: meta.bg }]}>
          <Text style={s.iconEmoji}>{meta.emoji}</Text>
        </View>

        <View style={s.cardInfo}>
          <Text style={s.cardName} numberOfLines={2}>{provider.name}</Text>
          <Text style={[s.cardCategory, { color: meta.color }]}>{meta.label}</Text>
          {!!provider.city && (
            <Text style={s.cardCity}>📍 {provider.city}, SK</Text>
          )}
          {provider.is_approved_sk && (
            <View style={s.approvedPill}>
              <Text style={s.approvedPillText}>✅ Approved Provider</Text>
            </View>
          )}
        </View>

        <Text style={s.chevron}>›</Text>
      </View>

      {/* Action buttons */}
      <View style={s.actionRow}>
        {!!provider.phone && (
          <ActionButton icon="📞" label="Call" onPress={() => Linking.openURL(`tel:${provider.phone}`)} />
        )}
        {!!provider.email && (
          <ActionButton icon="✉️" label="Email" onPress={() => Linking.openURL(`mailto:${provider.email}`)} />
        )}
        <ActionButton
          icon="📅"
          label="Book"
          onPress={() => {
            onPress();
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── ProviderDetailModal ──────────────────────────────────────────────────────

const DETAIL_GRADIENT: Record<string, readonly [string, string]> = {
  speech_language:      Colors.gradients.purple,
  occupational_therapy: Colors.gradients.teal,
  aba_ibi:              Colors.gradients.blue,
  psychology:           Colors.gradients.coral,
  physical_therapy:     Colors.gradients.green,
  respite:              Colors.gradients.amber,
  swimming:             Colors.gradients.blue,
  social_skills:        Colors.gradients.purple,
  music_therapy:        Colors.gradients.teal,
  art_therapy:          Colors.gradients.coral,
  assistive_technology: Colors.gradients.green,
  other:                ['#9CA3AF', '#6B7280'] as const,
};

function ProviderDetailModal({ provider, onClose }: { provider: Provider | null; onClose: () => void }) {
  if (!provider) return null;
  const meta = catMeta(provider.category);
  const gradient = DETAIL_GRADIENT[provider.category] ?? (['#9CA3AF', '#6B7280'] as const);
  const fullAddress = [
    provider.address,
    [provider.city, provider.province, provider.postal_code].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ');

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
        <LinearGradient
          colors={gradient as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.modalHeader}
        >
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={s.modalEmoji}>{meta.emoji}</Text>
          <Text style={s.modalCategory}>{meta.label}</Text>
          <Text style={s.modalName}>{provider.name}</Text>
          {!!provider.organization && (
            <Text style={s.modalOrg}>{provider.organization}</Text>
          )}
          {!!provider.city && (
            <Text style={s.modalCity}>
              📍 {provider.city}{provider.postal_code ? ` ${provider.postal_code}` : ''}, SK
            </Text>
          )}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.modalBody}>
          {!!provider.notes && (
            <>
              <Text style={s.sectionLabel}>About</Text>
              <View style={[s.detailCard, { padding: 14 }]}>
                <Text style={{ fontSize: 14, color: Colors.textPrimary, lineHeight: 20 }}>
                  {provider.notes}
                </Text>
              </View>
            </>
          )}

          <Text style={s.sectionLabel}>Contact</Text>
          <View style={s.detailCard}>
            {provider.phone ? (
              <TouchableOpacity style={s.detailRow} onPress={() => Linking.openURL(`tel:${provider.phone}`)}>
                <Text style={s.detailIcon}>📞</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.detailLabel}>Phone</Text>
                  <Text style={[s.detailValue, s.link]}>{provider.phone}</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.detailRow}>
                <Text style={s.detailIcon}>📞</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.detailLabel}>Phone</Text>
                  <Text style={s.detailMuted}>Not listed</Text>
                </View>
              </View>
            )}

            <View style={s.divider} />

            {provider.email ? (
              <TouchableOpacity style={s.detailRow} onPress={() => Linking.openURL(`mailto:${provider.email}`)}>
                <Text style={s.detailIcon}>✉️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.detailLabel}>Email</Text>
                  <Text style={[s.detailValue, s.link]} numberOfLines={1}>{provider.email}</Text>
                </View>
                <Text style={s.chevron}>›</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.detailRow}>
                <Text style={s.detailIcon}>✉️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.detailLabel}>Email</Text>
                  <Text style={s.detailMuted}>Not listed</Text>
                </View>
              </View>
            )}

            {!!provider.website && (
              <>
                <View style={s.divider} />
                <TouchableOpacity style={s.detailRow} onPress={() => Linking.openURL(provider.website!)}>
                  <Text style={s.detailIcon}>🌐</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.detailLabel}>Website</Text>
                    <Text style={[s.detailValue, s.link]} numberOfLines={1}>
                      {provider.website?.replace(/^https?:\/\/(www\.)?/, '')}
                    </Text>
                  </View>
                  <Text style={s.chevron}>›</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {(!!provider.address || !!provider.city) && (
            <>
              <Text style={s.sectionLabel}>Location</Text>
              <TouchableOpacity
                style={s.detailCard}
                activeOpacity={0.75}
                onPress={() => openInMaps(fullAddress)}
              >
                <View style={s.detailRow}>
                  <Text style={s.detailIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.detailLabel}>Address — tap to open Maps</Text>
                    <Text style={[s.detailValue, s.link]}>{fullAddress}</Text>
                  </View>
                  <Text style={s.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              onClose();
              router.push({ pathname: '/(tabs)/appointments', params: { preselectId: provider.id } });
            }}
          >
            <LinearGradient
              colors={Colors.gradients.purple as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.bookBtn}
            >
              <Text style={s.bookBtnText}>📅  Book Appointment</Text>
            </LinearGradient>
          </TouchableOpacity>

          {provider.is_approved_sk && (
            <View style={s.approvedBanner}>
              <Text style={s.approvedBannerText}>✓ Saskatchewan IAF Approved Provider</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProvidersScreen() {
  const [providers,      setProviders]      = useState<Provider[]>([]);
  const [filtered,       setFiltered]       = useState<Provider[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState<ProviderCategory | 'all'>('all');
  const [activeCity,     setActiveCity]     = useState<string>('');
  const [showMoreCats,   setShowMoreCats]   = useState(false);
  const [selected,       setSelected]       = useState<Provider | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const cities = useMemo(
    () => [...new Set(providers.map(p => p.city).filter(Boolean) as string[])].sort(),
    [providers]
  );

  const applyFilter = useCallback(
    (query: string, cat: ProviderCategory | 'all', city: string, list: Provider[]) => {
      const q = query.toLowerCase().trim();
      setFiltered(list.filter(p => {
        const matchCat  = cat === 'all' || p.category === cat;
        const matchCity = !city || p.city?.toLowerCase() === city.toLowerCase();
        if (!matchCat || !matchCity) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.organization?.toLowerCase().includes(q) ?? false) ||
          (p.city?.toLowerCase().includes(q) ?? false) ||
          (p.email?.toLowerCase().includes(q) ?? false) ||
          (p.website?.toLowerCase().includes(q) ?? false) ||
          (p.notes?.toLowerCase().includes(q) ?? false)
        );
      }));
    },
    []
  );

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => applyFilter(text, activeCategory, activeCity, providers), 200);
  };

  const handleCategory = (cat: ProviderCategory | 'all') => {
    setActiveCategory(cat);
    applyFilter(search, cat, activeCity, providers);
  };

  const cycleCity = () => {
    if (cities.length === 0) return;
    const idx = cities.indexOf(activeCity);
    const next = idx >= cities.length - 1 ? '' : cities[idx + 1] ?? '';
    setActiveCity(next);
    applyFilter(search, activeCategory, next, providers);
  };

  const visibleCats = showMoreCats ? ALL_CATS : TOP_CATS;

  const renderItem = useCallback(
    ({ item }: { item: Provider }) => (
      <ProviderCard provider={item} onPress={() => setSelected(item)} />
    ),
    []
  );

  const locationLabel = activeCity ? `Near ${activeCity}, SK` : 'All of Saskatchewan';

  const ListHeader = (
    <>
      {/* Hero header */}
      <View style={s.hero}>
        <View style={{ flex: 1 }}>
          <Text style={s.heroTitle}>Providers</Text>
          <Text style={s.heroSub}>Find approved services and{'\n'}supports near you. 💙</Text>
        </View>
        <Text style={s.heroIllustration}>🏥</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search provider, service or city…"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Category pills */}
      <View style={s.catRow}>
        {visibleCats.map(cat => {
          const active = activeCategory === cat;
          const emoji  = catEmoji(cat);
          return (
            <TouchableOpacity
              key={cat}
              style={[s.catPill, active && s.catPillActive]}
              onPress={() => handleCategory(cat)}
              activeOpacity={0.75}
            >
              {emoji ? <Text style={s.catPillEmoji}>{emoji}</Text> : null}
              <Text style={[s.catPillText, active && s.catPillTextActive]}>
                {catLabel(cat)}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={s.catPill}
          onPress={() => setShowMoreCats(v => !v)}
          activeOpacity={0.75}
        >
          <Text style={s.catPillText}>{showMoreCats ? 'Less ∧' : 'More ∨'}</Text>
        </TouchableOpacity>
      </View>

      {/* Section header */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionIcon}>📍</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.sectionTitle}>Nearby Approved Providers</Text>
          <Text style={s.sectionSub}>{locationLabel}</Text>
        </View>
        {cities.length > 0 && (
          <TouchableOpacity onPress={cycleCity}>
            <Text style={s.changeLink}>Change</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const ListFooter = (
    <TouchableOpacity style={s.footerBanner} activeOpacity={0.8}>
      <Text style={s.footerShield}>🛡️</Text>
      <Text style={s.footerText}>
        All providers are approved by the Autism Funding Program.
      </Text>
      <Text style={s.footerChevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      {loading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.purple} />
          <Text style={s.loadingText}>Loading providers…</Text>
        </View>
      )}

      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={10}
        maxToRenderPerBatch={16}
        windowSize={8}
        removeClippedSubviews
        ListEmptyComponent={
          !loading ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔎</Text>
              <Text style={s.emptyTitle}>No providers found</Text>
              <Text style={s.emptySubtitle}>Try a different search or category</Text>
            </View>
          ) : null
        }
      />

      <ProviderDetailModal provider={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Hero
  hero: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  heroTitle: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  heroSub:   { fontSize: 14, color: Colors.textSecondary, marginTop: 5, lineHeight: 20 },
  heroIllustration: { fontSize: 70, marginTop: -8, marginRight: -4 },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 4, gap: 8,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },

  // Category pills
  catRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingBottom: 8, gap: 8,
  },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: Colors.surfaceAlt,
    borderWidth: 1, borderColor: Colors.border,
  },
  catPillActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  catPillEmoji:  { fontSize: 13 },
  catPillText:   { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catPillTextActive: { color: '#FFFFFF', fontWeight: '600' },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sectionIcon:  { fontSize: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  sectionSub:   { fontSize: 13, color: Colors.textMuted, marginTop: 1 },
  changeLink:   { fontSize: 13, fontWeight: '600', color: Colors.purple },

  // Cards
  listContent: { paddingBottom: 32 },
  card: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: Colors.surface,
    borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    padding: 16,
    shadowColor: Colors.purple, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconCircle:  { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconEmoji:   { fontSize: 24 },
  cardInfo:    { flex: 1, gap: 2 },
  cardName:    { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  cardCategory:{ fontSize: 13, fontWeight: '600' },
  cardCity:    { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  chevron:     { fontSize: 22, color: Colors.textMuted, marginTop: 2 },

  approvedPill: {
    alignSelf: 'flex-start', marginTop: 5,
    backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#6EE7B7',
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
  },
  approvedPillText: { fontSize: 11, fontWeight: '600', color: '#059669' },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 9, borderRadius: 12,
    backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border,
  },
  actionBtnIcon:  { fontSize: 14 },
  actionBtnLabel: { fontSize: 13, fontWeight: '600', color: Colors.purple },

  // Footer banner
  footerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 6, marginBottom: 24,
    backgroundColor: '#EFF6FF', borderRadius: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  footerShield:  { fontSize: 20 },
  footerText:    { flex: 1, fontSize: 13, color: '#1D4ED8', fontWeight: '500', lineHeight: 18 },
  footerChevron: { fontSize: 18, color: '#93C5FD' },

  // Loading / empty
  loadingOverlay: { alignItems: 'center', paddingTop: 120 },
  loadingText:    { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  empty:          { alignItems: 'center', padding: 32, paddingTop: 24 },
  emptyTitle:     { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  emptySubtitle:  { fontSize: 14, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },

  // Modal
  modalHeader:  { padding: 24, paddingTop: 16, alignItems: 'center', gap: 4 },
  closeBtn:     { alignSelf: 'flex-end', padding: 8 },
  closeBtnText: { fontSize: 18, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  modalEmoji:   { fontSize: 40, marginBottom: 4 },
  modalCategory:{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalName:    { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  modalOrg:     { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginTop: 2 },
  modalCity:    { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  modalBody:    { padding: 20, gap: 8, paddingBottom: 48 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 4 },
  detailCard:   { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  detailRow:    { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  detailIcon:   { fontSize: 20 },
  detailLabel:  { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 1 },
  detailValue:  { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  detailMuted:  { fontSize: 14, color: Colors.textMuted },
  link:         { color: Colors.purple },
  divider:      { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  bookBtn:      { marginTop: 20, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  bookBtnText:  { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
  approvedBanner: { marginTop: 12, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#6EE7B7', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  approvedBannerText: { fontSize: 13, fontWeight: '600', color: '#059669' },
});
