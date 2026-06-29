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
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, Circle, Polygon, Line } from 'react-native-svg';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { AppLogo } from '@components/AppLogo';
import { Colors } from '@constants/colors';
import { supabase } from '@lib/supabase';
import { geocodeAddress, type Coords } from '@lib/geocoding';
import { resolveAddressCoords } from '@lib/geocodeCache';
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
  // Additional towns from provider addresses
  'Elrose':            { lat: 51.2796,  lng: -108.0118 },
  'Rosthern':          { lat: 52.6657,  lng: -106.3272 },
  'Langenburg':        { lat: 50.8465,  lng: -101.7120 },
  'Arcola':            { lat: 49.6294,  lng: -102.5051 },
  'Wawota':            { lat: 49.8907,  lng: -101.9375 },
  'Craven':            { lat: 50.5889,  lng: -104.9846 },
  'Osler':             { lat: 52.3763,  lng: -106.5856 },
  'Duck Lake':         { lat: 52.8163,  lng: -106.2484 },
  'Duck':              { lat: 52.8163,  lng: -106.2484 }, // alias for Duck Lake
  'Dundurn':           { lat: 51.7744,  lng: -106.4961 },
  'Aylesbury':         { lat: 50.5500,  lng: -104.7500 },
  'Assiniboia':        { lat: 49.6331,  lng: -105.9798 },
  'Biggar':            { lat: 52.0595,  lng: -107.9791 },
  'Wilkie':            { lat: 52.4176,  lng: -108.7058 },
  'Unity':             { lat: 52.4525,  lng: -109.1614 },
  'Esterhazy':         { lat: 50.6511,  lng: -102.0832 },
  'Grenfell':          { lat: 50.4139,  lng: -102.9280 },
  'Waskatenau':        { lat: 54.0767,  lng: -112.7750 },
  'Lloydminster, AB':  { lat: 53.2784,  lng: -110.0053 },
  'Southwest':         { lat: 50.2896,  lng: -107.7965 }, // Swift Current region
};

// Extracts city name from an address like "101-123 Main St, Saskatoon, SK"
function parseCityFromAddress(address: string): string | null {
  const parts = address.split(',').map(s => s.trim()).filter(Boolean);
  // Walk backward: skip province/territory codes and the last segment if it's 2-chars
  for (let i = parts.length - 1; i >= 1; i--) {
    const seg = parts[i];
    if (seg.length <= 3 || /^(SK|AB|MB|BC|ON)$/.test(seg)) continue;
    if (/^\d/.test(seg)) continue; // postal code starts with digit
    return seg;
  }
  return null;
}

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

// Distance is measured to the town centre (providers rarely have a street
// address), so present it as approximate — "~12 km" — to avoid implying
// per-provider precision that the data can't support.
function fmtKm(km: number): string {
  return km < 10 ? `~${km.toFixed(1)} km` : `~${Math.round(km)} km`;
}

// ─── Category config ──────────────────────────────────────────────────────────

interface CatMeta { label: string; emoji: string; color: string; bg: string }

const CAT_META: Record<string, CatMeta> = {
  speech_language:      { label: 'Speech Therapy',        emoji: '💬', color: '#7C3AED', bg: '#EDE9FE' },
  occupational_therapy: { label: 'Occupational Therapy',  emoji: '✋', color: '#059669', bg: '#D1FAE5' },
  aba_ibi:              { label: 'ABA / IBI',              emoji: '🧩', color: '#1D4ED8', bg: '#DBEAFE' },
  psychology:           { label: 'Behaviour / Psychology', emoji: '🧠', color: '#7C3AED', bg: '#F3E8FF' },
  physical_therapy:     { label: 'Physical Therapy',       emoji: '🏃', color: '#D97706', bg: '#FEF3C7' },
  respite:              { label: 'Respite Care',           emoji: '🏠', color: '#0D9488', bg: '#CCFBF1' },
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

const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  speech_language:      'chatbubble-ellipses',
  occupational_therapy: 'hand-left',
  aba_ibi:              'extension-puzzle',
  psychology:           'pulse',
  physical_therapy:     'walk',
  respite:              'home',
  swimming:             'water',
  social_skills:        'people',
  music_therapy:        'musical-notes',
  art_therapy:          'color-palette',
  assistive_technology: 'phone-portrait',
  other:                'ellipsis-horizontal',
};
function catIonicon(cat: ProviderCategory | 'all'): keyof typeof Ionicons.glyphMap {
  if (cat === 'all') return 'apps';
  return CAT_ICON[cat] ?? 'medkit';
}

// Clinic illustration — blue-roofed building with medical cross, trees,
// faint cityscape silhouette behind.
function ClinicArt() {
  return (
    <Svg width={120} height={100} viewBox="0 0 120 100">
      {/* faint cityscape */}
      <Rect x="4"  y="40" width="18" height="46" rx="2" fill="#DCE4F5" />
      <Rect x="96" y="34" width="20" height="52" rx="2" fill="#DCE4F5" />
      <Rect x="80" y="48" width="14" height="38" rx="2" fill="#E6ECFA" />
      {/* trees */}
      <Circle cx="16" cy="70" r="11" fill="#34D399" />
      <Rect x="14" y="74" width="4" height="14" fill="#15803D" />
      <Circle cx="104" cy="70" r="11" fill="#34D399" />
      <Rect x="102" y="74" width="4" height="14" fill="#15803D" />
      {/* building body */}
      <Rect x="34" y="50" width="52" height="38" rx="3" fill="#FFFFFF" stroke="#C7D2E8" strokeWidth="1.5" />
      {/* roof */}
      <Polygon points="30,52 60,30 90,52" fill="#2563EB" />
      {/* medical cross on roof */}
      <Rect x="56" y="36" width="8" height="3" rx="1" fill="#FFFFFF" />
      <Rect x="58.5" y="33.5" width="3" height="8" rx="1" fill="#FFFFFF" />
      {/* door */}
      <Rect x="54" y="64" width="12" height="24" rx="2" fill="#2563EB" />
      {/* windows */}
      <Rect x="38" y="58" width="11" height="11" rx="2" fill="#BFDBFE" />
      <Rect x="71" y="58" width="11" height="11" rx="2" fill="#BFDBFE" />
      {/* ground line */}
      <Line x1="6" y1="88" x2="114" y2="88" stroke="#C7D2E8" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
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

type ProviderWithDist = Provider & { distanceKm: number | null; exactDistance?: boolean };

// ─── ProviderCard ─────────────────────────────────────────────────────────────

function ActionButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={s.actionBtn}
      onPress={e => { e.stopPropagation?.(); onPress(); }}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={15} color={Colors.purple} />
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
          <Ionicons name={catIonicon(provider.category)} size={26} color={meta.color} />
        </View>

        <View style={s.cardInfo}>
          <Text style={s.cardName} numberOfLines={2}>{provider.name}</Text>
          <Text style={s.cardCategory}>{meta.label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={s.cardCity}>
              {provider.city}, SK
              {provider.distanceKm !== null
                ? provider.exactDistance
                  ? `  •  ${provider.distanceKm < 10 ? provider.distanceKm.toFixed(1) : Math.round(provider.distanceKm)} km away`
                  : `  •  ${fmtKm(provider.distanceKm)} to town`
                : ''}
            </Text>
          </View>
          {provider.is_approved_sk && (
            <View style={s.approvedPill}>
              <Ionicons name="checkmark-circle" size={13} color="#059669" />
              <Text style={s.approvedPillText}>Approved Provider</Text>
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={{ marginTop: 2 }} />
      </View>

      <View style={s.actionRow}>
        {!!provider.phone && (
          <ActionButton icon="call-outline" label="Call" onPress={() => Linking.openURL(`tel:${provider.phone}`)} />
        )}
        {!!provider.email && (
          <ActionButton icon="mail-outline" label="Email" onPress={() => Linking.openURL(`mailto:${provider.email}`)} />
        )}
        <ActionButton icon="calendar-outline" label="Book" onPress={onPress} />
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
  const [addrCoords,     setAddrCoords]     = useState<Map<string, Coords>>(new Map());
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

  // ── Geocode provider street addresses (cached per device) ────────────────────
  // Only matters once we know where the user is; resolves each distinct address
  // once via the free geocoder and caches it, then per-provider distances are exact.
  useEffect(() => {
    if (!userCoords || providers.length === 0) return;
    let cancelled = false;
    const addresses = providers
      .map(p => p.address?.trim())
      .filter((a): a is string => !!a);
    if (addresses.length === 0) return;
    resolveAddressCoords(addresses, partial => {
      if (!cancelled) setAddrCoords(new Map(partial));
    }).then(final => {
      if (!cancelled) setAddrCoords(final);
    });
    return () => { cancelled = true; };
  }, [providers, userCoords]);

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
      // Priority 1: coordinates stored in DB (populated by server-side geocoding)
      const dbCoords = (p.lat != null && p.lng != null) ? { lat: p.lat, lng: p.lng } : undefined;
      // Priority 2: on-device geocache result for this address
      const geocached = p.address ? addrCoords.get(p.address.trim()) : undefined;
      // Priority 3: city parsed from the address string (more accurate than service-area city column)
      const addrCity = p.address ? parseCityFromAddress(p.address) : null;
      const addrCityCoords = addrCity ? SK_CITIES[addrCity] : undefined;
      // Priority 4: service-area city column as last resort
      const cityCoords = SK_CITIES[p.city ?? ''];

      const target = dbCoords ?? geocached ?? addrCityCoords ?? cityCoords;
      const isExact = !!(dbCoords || geocached);
      const distanceKm = userCoords && target
        ? haversineKm(userCoords.lat, userCoords.lng, target.lat, target.lng)
        : null;
      return { ...p, distanceKm, exactDistance: isExact };
    });

    return withDist.sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [providers, userCoords, addrCoords]);

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppLogo size={36} />
            <Text style={s.heroTitle}>Providers</Text>
          </View>
          <Text style={s.heroSub}>Find approved services and{'\n'}supports near you. 💙</Text>
        </View>
        <View style={s.heroIllustration}>
          <ClinicArt />
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBox}>
          <Ionicons name="search" size={17} color={Colors.textMuted} style={{ marginRight: 2 }} />
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
          return (
            <TouchableOpacity
              key={cat}
              style={[s.catPill, active && s.catPillActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={cat === 'all' ? 'apps' : catIonicon(cat)}
                size={14}
                color={active ? '#FFFFFF' : Colors.textSecondary}
              />
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
          <Text style={s.catPillText}>{showMoreCats ? 'Less' : 'More'}</Text>
          <Ionicons name={showMoreCats ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Section header */}
      <View style={s.sectionHeader}>
        <Ionicons name="location" size={20} color={Colors.purple} />
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
      <Ionicons name="shield-checkmark" size={20} color="#1D4ED8" />
      <Text style={s.footerText}>
        All providers are approved by the Autism Funding Program.
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#1D4ED8" />
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
  heroIllustration: { marginTop: -6, marginRight: -8 },

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
  cardCategory:{ fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  cardCity:    { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  chevron:     { fontSize: 22, color: Colors.textMuted, marginTop: 2 },

  approvedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginTop: 6,
    backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC',
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3,
  },
  approvedPillText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },

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
