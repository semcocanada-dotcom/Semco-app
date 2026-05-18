import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Colors } from '@constants/colors';
import { supabase } from '@lib/supabase';
import { geocodeAddress } from '@lib/geocoding';
import { useAuth } from '@context/AuthContext';
import type { Provider, ProviderCategory } from '@lib/types';

// ─── SK city coordinates (centroid lookup — avoids geocoding each provider) ───

const SK_CITIES: Record<string, { lat: number; lng: number }> = {
  'Regina':            { lat: 50.4452,  lng: -104.6189 },
  'Saskatoon':         { lat: 52.1332,  lng: -106.6700 },
  'Prince Albert':     { lat: 53.2033,  lng: -105.7531 },
  'Moose Jaw':         { lat: 50.3934,  lng: -105.5522 },
  'Swift Current':     { lat: 50.2896,  lng: -107.7965 },
  'Lloydminster':      { lat: 53.2784,  lng: -110.0053 },
  'North Battleford':  { lat: 52.7803,  lng: -108.2984 },
  'Battleford':        { lat: 52.7458,  lng: -108.3081 },
  'Yorkton':           { lat: 51.2133,  lng: -102.4633 },
  'Weyburn':           { lat: 49.6606,  lng: -103.8518 },
  'Estevan':           { lat: 49.1394,  lng: -102.9821 },
  'Melfort':           { lat: 52.8582,  lng: -104.6074 },
  'Meadow Lake':       { lat: 54.1245,  lng: -108.4361 },
  'La Ronge':          { lat: 55.1008,  lng: -105.2831 },
  'Humboldt':          { lat: 52.2003,  lng: -105.1230 },
  'Tisdale':           { lat: 52.8497,  lng: -104.0499 },
  'Kindersley':        { lat: 51.4681,  lng: -109.1578 },
  'Nipawin':           { lat: 53.3669,  lng: -104.0059 },
  'Canora':            { lat: 51.6214,  lng: -102.4281 },
  'Rosetown':          { lat: 51.5517,  lng: -107.9919 },
  'Wadena':            { lat: 51.9492,  lng: -103.8010 },
  'Creighton':         { lat: 54.7667,  lng: -101.9000 },
  'Flin Flon':         { lat: 54.7717,  lng: -101.8764 },
  'Oxbow':             { lat: 49.2334,  lng: -102.1663 },
  'Moosomin':          { lat: 50.1439,  lng: -101.6680 },
  'Whitewood':         { lat: 50.3328,  lng: -102.2598 },
  'Indian Head':       { lat: 50.5331,  lng: -103.6595 },
  'Lumsden':           { lat: 50.6503,  lng: -104.8611 },
  'White City':        { lat: 50.4422,  lng: -104.3597 },
  'Martensville':      { lat: 52.2894,  lng: -106.6686 },
  'Warman':            { lat: 52.3214,  lng: -106.5836 },
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtKm(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

// ─── Category config ──────────────────────────────────────────────────────────

interface CatMeta { label: string; emoji: string; color: string; bg: string }

const CAT_META: Record<string, CatMeta> = {
  speech_language:      { label: 'Speech Therapy',        emoji: '💬', color: '#7C3AED', bg: '#EDE9FE' },
  occupational_therapy: { label: 'Occupational Therapy',  emoji: '✋', color: '#059669', bg: '#D1FAE5' },
  aba_ibi:              { label: 'ABA / IBI',              emoji: '🧩', color: '#1D4ED8', bg: '#DBEAFE' },
  psychology:           { label: 'Behaviour / Psychology', emoji: '🧠', color: '#DB2777', bg: '#FCE7F3' },
  physical_therapy:     { label: 'Physical Therapy',       emoji: '🏃', color: '#D97706', bg: '#FEF3C7' },
  respite:              { label: 'Respite Care',           emoji: '🏠', color: '#DC2626', bg: '#FEE2E2' },
  swimming:             { label: 'Swimming',               emoji: '🏊', color: '#0891B2', bg: '#CFFAFE' },
  social_skills:        { label: 'Social Skills',          emoji: '👫', color: '#7C3AED', bg: '#F3E8FF' },
  music_therapy:        { label: 'Music Therapy',          emoji: '🎵', color: '#16A34A', bg: '#F0FDF4' },
  art_therapy:          { label: 'Art Therapy',            emoji: '🎨', color: '#EA580C', bg: '#FFF7ED' },
  assistive_technology: { label: 'Assistive Tech',         emoji: '📱', color: '#0284C7', bg: '#F0F9FF' },
  other:                { label: 'Other',                  emoji: '📋', color: '#6B7280', bg: '#F9FAFB' },
};

function catMeta(cat: ProviderCategory): CatMeta {
  return CAT_META[cat] ?? { label: cat, emoji: '📋', color: '#6B7280', bg: '#F9FAFB' };
}

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

// ─── Maps helper ──────────────────────────────────────────────────────────────

function openInMaps(address: string) {
  const q = encodeURIComponent(address);
  const url = Platform.OS === 'ios' ? `maps://0,0?q=${q}` : `geo:0,0?q=${q}`;
  Linking.openURL(url).catch(() => Linking.openURL(`https://maps.google.com/maps?q=${q}`));
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderWithDist = Provider & { distanceKm: number | null };

// ─── ProviderCard ─────────────────────────────────────────────────────────────

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
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

function ProviderCard({ provider, onPress }: { provider: ProviderWithDist; onPress: () => void }) {
  const meta = catMeta(provider.category);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={s.card}>
      <View style={s.cardTop}>
        <View style={[s.iconCircle, { backgroundColor: meta.bg }]}>
          <Text style={s.iconEmoji}>{meta.emoji}</Text>
        </View>

        <View style={s.cardInfo}>
          <Text style={s.cardName} numberOfLines={2}>{provider.name}</Text>
          <Text style={[s.cardCategory, { color: meta.color }]}>{meta.label}</Text>
          <Text style={s.cardCity}>
            📍 {provider.city}, SK
            {provider.distanceKm !== null
              ? `  •  ${fmtKm(provider.distanceKm)} away`
              : ''}
          </Text>
          {provider.is_approved_sk && (
            <View style={s.approvedPill}>
              <Text style={s.approvedPillText}>✅ Approved Provider</Text>
            </View>
          )}
        </View>

        <Text style={s.chevron}>›</Text>
      </View>

      <View style={s.actionRow}>
        {!!provider.phone && (
          <ActionButton icon="📞" label="Call" onPress={() => Linking.openURL(`tel:${provider.phone}`)} />
        )}
        {!!provider.email && (
          <ActionButton icon="✉️" label="Email" onPress={() => Linking.openURL(`mailto:${provider.email}`)} />
        )}
        <ActionButton icon="📅" label="Book" onPress={onPress} />
      </View>
    </TouchableOpacity>
  );
}

// ─── ProviderDetailModal ──────────────────────────────────────────────────────

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
          {!!provider.organization && <Text style={s.modalOrg}>{provider.organization}</Text>}
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
                <Text style={{ fontSize: 14, color: Colors.textPrimary, lineHeight: 20 }}>{provider.notes}</Text>
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
              <TouchableOpacity style={s.detailCard} activeOpacity={0.75} onPress={() => openInMaps(fullAddress)}>
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
  const { profile } = useAuth();

  const [providers,      setProviders]      = useState<Provider[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [activeCategory, setActiveCategory] = useState<ProviderCategory | 'all'>('all');
  const [showMoreCats,   setShowMoreCats]   = useState(false);
  const [selected,       setSelected]       = useState<Provider | null>(null);
  const [userCoords,     setUserCoords]     = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel,  setLocationLabel]  = useState('Saskatchewan');
  const [locLoading,     setLocLoading]     = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch providers ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('providers')
      .select('*')
      .eq('is_approved_sk', true)
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) setProviders(data as Provider[]);
        setLoading(false);
      });
  }, []);

  // ── Resolve user location ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLocLoading(true);
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          });
          setUserCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          setLocationLabel('Your Location');
          setLocLoading(false);
          return;
        }
      } catch {}

      // Fallback: geocode home city / home address from profile
      const fallback = profile?.home_city
        ? `${profile.home_city}, SK`
        : profile?.home_address ?? null;

      if (fallback) {
        try {
          const coords = await geocodeAddress(fallback);
          if (coords) {
            setUserCoords(coords);
            setLocationLabel(profile?.home_city ?? 'Your Home');
            setLocLoading(false);
            return;
          }
        } catch {}
      }

      setLocLoading(false);
    })();
  }, [profile]);

  // ── Attach distances + sort ──────────────────────────────────────────────────
  const sortedProviders = useMemo((): ProviderWithDist[] => {
    const withDist = providers.map(p => {
      const cityCoords = SK_CITIES[p.city ?? ''];
      const distanceKm = userCoords && cityCoords
        ? haversineKm(userCoords.lat, userCoords.lng, cityCoords.lat, cityCoords.lng)
        : null;
      return { ...p, distanceKm };
    });

    return withDist.sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [providers, userCoords]);

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return sortedProviders.filter(p => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.organization?.toLowerCase().includes(q) ?? false) ||
        (p.city?.toLowerCase().includes(q) ?? false) ||
        (p.email?.toLowerCase().includes(q) ?? false) ||
        (p.notes?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [sortedProviders, search, activeCategory]);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(text), 0);
  };

  const renderItem = useCallback(
    ({ item }: { item: ProviderWithDist }) => (
      <ProviderCard provider={item} onPress={() => setSelected(item)} />
    ),
    []
  );

  const visibleCats = showMoreCats ? ALL_CATS : TOP_CATS;

  const ListHeader = (
    <>
      {/* Hero */}
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
              onPress={() => setActiveCategory(cat)}
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
          <Text style={s.sectionSub}>
            {locLoading ? 'Finding your location…' : `Near ${locationLabel}`}
          </Text>
        </View>
        {locLoading && <ActivityIndicator size="small" color={Colors.purple} />}
      </View>
    </>
  );

  const ListFooter = (
    <View style={s.footerBanner}>
      <Text style={s.footerShield}>🛡️</Text>
      <Text style={s.footerText}>
        All providers are approved by the Autism Funding Program.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
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
          loading ? (
            <View style={s.centered}>
              <ActivityIndicator size="large" color={Colors.purple} />
              <Text style={s.loadingText}>Loading providers…</Text>
            </View>
          ) : (
            <View style={s.centered}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔎</Text>
              <Text style={s.emptyTitle}>No providers found</Text>
              <Text style={s.emptySubtitle}>Try a different search or category</Text>
            </View>
          )
        }
      />

      <ProviderDetailModal provider={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  hero: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  heroTitle:        { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  heroSub:          { fontSize: 14, color: Colors.textSecondary, marginTop: 5, lineHeight: 20 },
  heroIllustration: { fontSize: 70, marginTop: -8, marginRight: -4 },

  searchWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    gap: 8,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },

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
  catPillActive:     { backgroundColor: Colors.purple, borderColor: Colors.purple },
  catPillEmoji:      { fontSize: 13 },
  catPillText:       { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catPillTextActive: { color: '#FFFFFF', fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sectionIcon:  { fontSize: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  sectionSub:   { fontSize: 13, color: Colors.textMuted, marginTop: 1 },

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

  footerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 6, marginBottom: 24,
    backgroundColor: '#EFF6FF', borderRadius: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  footerShield: { fontSize: 20 },
  footerText:   { flex: 1, fontSize: 13, color: '#1D4ED8', fontWeight: '500', lineHeight: 18 },

  centered:      { alignItems: 'center', padding: 32, paddingTop: 48 },
  loadingText:   { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  emptyTitle:    { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 6, textAlign: 'center' },

  modalHeader:   { padding: 24, paddingTop: 16, alignItems: 'center', gap: 4 },
  closeBtn:      { alignSelf: 'flex-end', padding: 8 },
  closeBtnText:  { fontSize: 18, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  modalEmoji:    { fontSize: 40, marginBottom: 4 },
  modalCategory: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalName:     { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  modalOrg:      { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginTop: 2 },
  modalCity:     { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  modalBody:     { padding: 20, gap: 8, paddingBottom: 48 },
  sectionLabel:  { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 4 },
  detailCard:    { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  detailRow:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  detailIcon:    { fontSize: 20 },
  detailLabel:   { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 1 },
  detailValue:   { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  detailMuted:   { fontSize: 14, color: Colors.textMuted },
  link:          { color: Colors.purple },
  divider:       { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },
  bookBtn:       { marginTop: 20, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  bookBtnText:   { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
  approvedBanner:     { marginTop: 12, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#6EE7B7', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  approvedBannerText: { fontSize: 13, fontWeight: '600', color: '#059669' },
});
