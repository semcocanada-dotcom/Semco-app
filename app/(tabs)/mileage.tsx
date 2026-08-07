import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, ScrollView,
  TextInput, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, Circle, Ellipse } from 'react-native-svg';
import { format, parseISO } from 'date-fns';
import { AppLogo } from '@components/AppLogo';
import { DateField } from '@components/DateField';
import { TripArt } from '@components/EmptyArt';
import { Colors } from '@constants/colors';
import { supabase } from '@lib/supabase';
import type { MileageLog, Provider, ProviderCategory } from '@lib/types';
import { useChild } from '@context/ChildContext';
import { useAuth } from '@context/AuthContext';
import { useBudget } from '@hooks/useBudget';
import {
  generateAndShareMileageWorksheetPdf,
  OFFICIAL_MILEAGE_FORM_URL,
} from '@lib/pdfForms';
import { SOUTHERN_RATE_PER_KM } from '@constants/mileage';

const CAD = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);

const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  aba_ibi: 'ABA / IBI',
  speech_language: 'Speech & Language',
  occupational_therapy: 'Occupational Therapy',
  physical_therapy: 'Physical Therapy',
  psychology: 'Psychology',
  respite: 'Respite',
  swimming: 'Swimming',
  social_skills: 'Social Skills',
  music_therapy: 'Music Therapy',
  art_therapy: 'Art Therapy',
  assistive_technology: 'Assistive Tech',
  other: 'Other',
};

// "Speech & Language — Pathways Clinic, Saskatoon" for the worksheet trip-purpose column.
function composeTripPurpose(p: Provider): string {
  const label = CATEGORY_LABELS[p.category] ?? 'Appointment';
  return p.city ? `${label} — ${p.name}, ${p.city}` : `${label} — ${p.name}`;
}

// ─── AddTripModal ─────────────────────────────────────────────────────────────

function AddTripModal({
  visible, onClose, childId, fundingYearId, onSaved,
}: {
  visible: boolean; onClose: () => void;
  childId: string; fundingYearId: string; onSaved: () => void;
}) {
  const { session } = useAuth();
  const [date,            setDate]            = useState(format(new Date(), 'yyyy-MM-dd'));
  const [providerQuery,   setProviderQuery]   = useState('');
  const [providerResults, setProviderResults] = useState<Provider[]>([]);
  const [selectedProvider,setSelectedProvider]= useState<Provider | null>(null);
  const [distanceKm,      setDistanceKm]      = useState('');
  const [ratePerKm,       setRatePerKm]       = useState(String(SOUTHERN_RATE_PER_KM));
  const [isRoundTrip,     setIsRoundTrip]     = useState(true);
  const [notes,           setNotes]           = useState('');
  const [saving,          setSaving]          = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setDate(format(new Date(), 'yyyy-MM-dd')); setProviderQuery('');
      setSelectedProvider(null); setProviderResults([]); setDistanceKm('');
      setRatePerKm(String(SOUTHERN_RATE_PER_KM)); setIsRoundTrip(true);
      setNotes(''); setSaving(false);
    }
  }, [visible]);

  const searchProviders = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim() || !session) { setProviderResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      const { data } = await supabase.from('providers')
        .select('id, name, category, city, address')
        .eq('parent_id', session.user.id)
        .ilike('name', `%${q}%`).limit(6);
      setProviderResults((data ?? []) as Provider[]);
    }, 250);
  }, [session]);

  function onProviderSelect(p: Provider) {
    setSelectedProvider(p); setProviderQuery(''); setProviderResults([]);
    setNotes(prev => (prev.trim() ? prev : composeTripPurpose(p)));
  }

  async function handleSave() {
    const km = parseFloat(distanceKm);
    if (!km || km <= 0) { Alert.alert('Distance required', 'Enter the trip distance in km.'); return; }
    setSaving(true);
    try {
      const finalKm = isRoundTrip ? km * 2 : km;
      await supabase.from('mileage_logs').insert({
        child_id:        childId,
        funding_year_id: fundingYearId,
        description:     notes.trim() || (selectedProvider ? composeTripPurpose(selectedProvider) : 'Mileage trip'),
        distance_km:     finalKm,
        rate_per_km:     parseFloat(ratePerKm),
        trip_date:       date,
        is_round_trip:   isRoundTrip,
        expense_id:      null,
      });
      onSaved(); onClose();
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? 'Please try again.');
    } finally { setSaving(false); }
  }

  const km = parseFloat(distanceKm) || 0;
  const rate = parseFloat(ratePerKm) || 0;
  const displayKm = isRoundTrip ? km * 2 : km;
  const total = displayKm * rate;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
        <View style={s.mHeader}>
          <Text style={s.mTitle}>Log a Trip</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 16, color: Colors.purple, fontWeight: '500' }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.mBody} keyboardShouldPersistTaps="handled">

            <Text style={s.label}>Date</Text>
            <DateField value={date} onChange={setDate} />

            <Text style={[s.label, { marginTop: 18 }]}>Private provider (optional)</Text>
            {selectedProvider ? (
              <View style={s.selectedProv}>
                <Text style={s.selectedProvText}>{selectedProvider.name}</Text>
                <TouchableOpacity onPress={() => {
                  setNotes(prev => (selectedProvider && prev === composeTripPurpose(selectedProvider) ? '' : prev));
                  setSelectedProvider(null); setDistanceKm('');
                }}>
                  <Text style={{ color: Colors.textMuted, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={s.searchBox}>
                  <TextInput
                    style={s.searchInput}
                    placeholder="Search provider…"
                    placeholderTextColor={Colors.textMuted}
                    value={providerQuery}
                    onChangeText={q => { setProviderQuery(q); searchProviders(q); }}
                    autoCorrect={false}
                  />
                </View>
                {providerResults.length > 0 && (
                  <View style={s.dropdown}>
                    {providerResults.map((p, i) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[s.dropItem, i < providerResults.length - 1 && { borderBottomWidth: 1, borderColor: Colors.border }]}
                        onPress={() => onProviderSelect(p)}
                      >
                        <Text style={s.dropName}>{p.name}</Text>
                        <Text style={s.dropSub}>{p.city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            <Text style={[s.label, { marginTop: 18 }]}>One-way distance (km)</Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted, marginBottom: 6 }}>
              Enter the distance manually; the app does not send addresses to a mapping service.
            </Text>
            <TextInput
              style={s.field} value={distanceKm} onChangeText={setDistanceKm}
              placeholder="e.g. 22.4" placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity style={s.toggleRow} onPress={() => setIsRoundTrip(!isRoundTrip)} activeOpacity={0.7}>
              <Text style={s.toggleLabel}>🔄  Round trip (×2 distance)</Text>
              <View style={[s.toggle, isRoundTrip && s.toggleOn]}>
                <View style={[s.toggleThumb, isRoundTrip && s.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <Text style={[s.label, { marginTop: 18 }]}>Purpose of Travel</Text>
            <TextInput
              style={s.field} value={notes} onChangeText={setNotes}
              placeholder="e.g. Speech & Language — Pathways Clinic, Saskatoon" placeholderTextColor={Colors.textMuted}
            />

            {displayKm > 0 && rate > 0 && (
              <View style={s.calcCard}>
                <Text style={s.calcText}>
                  {displayKm.toFixed(1)} km × ${rate.toFixed(4)}/km = <Text style={{ fontWeight: '800', color: '#15803D' }}>{CAD(total)}</Text>
                </Text>
              </View>
            )}

            <TouchableOpacity style={{ marginTop: 28 }} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <LinearGradient
                colors={['#1D4ED8', '#3B82F6']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.saveBtn}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Trip</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── TripRow ──────────────────────────────────────────────────────────────────

function tripStyle(desc: string): { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string } {
  const d = desc.toLowerCase();
  if (d.includes('speech') || d.includes('language'))
    return { icon: 'chatbubble-ellipses', color: '#7C3AED', bg: '#EDE9FE' };
  if (d.includes('occupational') || d.includes(' ot'))
    return { icon: 'hand-left', color: '#2563EB', bg: '#DBEAFE' };
  if (d.includes('behaviour') || d.includes('behavior') || d.includes('psych') || d.includes('aba'))
    return { icon: 'pulse', color: '#DB2777', bg: '#FCE7F3' };
  return { icon: 'person', color: '#16A34A', bg: '#DCFCE7' };
}

function TripRow({ log, onPress }: { log: MileageLog; onPress: () => void }) {
  const desc = log.description ?? 'Mileage trip';
  const t = tripStyle(desc);
  return (
    <TouchableOpacity style={s.tripRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.tripIcon, { backgroundColor: t.bg, borderColor: t.bg }]}>
        <Ionicons name={t.icon} size={20} color={t.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.tripTitle} numberOfLines={1}>{desc}</Text>
        <Text style={s.tripMeta}>{format(parseISO(log.trip_date), 'MMM d, yyyy')}  ·  {Number(log.distance_km).toFixed(1)} km</Text>
      </View>
      <Text style={s.tripAmount}>{CAD(Number(log.reimbursement_amount))}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={{ marginLeft: 6 }} />
    </TouchableOpacity>
  );
}

// ─── TripDetailModal ───────────────────────────────────────────────────────────

function TripDetailModal({
  log, visible, onClose, onDeleted,
}: {
  log: MileageLog | null; visible: boolean;
  onClose: () => void; onDeleted: () => void;
}) {
  if (!log) return null;

  function confirmDelete() {
    Alert.alert('Delete this trip?', 'This removes the mileage trip permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('mileage_logs').delete().eq('id', log!.id);
          onDeleted(); onClose();
        },
      },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
        <View style={s.mHeader}>
          <Text style={s.mTitle}>Trip Detail</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 16, color: Colors.purple, fontWeight: '500' }}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.mBody}>
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ fontSize: 40, fontWeight: '800', color: '#15803D' }}>
              {CAD(Number(log.reimbursement_amount))}
            </Text>
            <Text style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 4 }}>reimbursement</Text>
          </View>

          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Purpose</Text>
            <Text style={s.detailValue}>{log.description ?? 'Mileage trip'}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Date</Text>
            <Text style={s.detailValue}>{format(parseISO(log.trip_date), 'EEEE, MMMM d, yyyy')}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Distance</Text>
            <Text style={s.detailValue}>
              {Number(log.distance_km).toFixed(1)} km{log.is_round_trip ? ' · round trip' : ''}
            </Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Rate</Text>
            <Text style={s.detailValue}>${Number(log.rate_per_km).toFixed(4)} / km</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Linked expense</Text>
            <Text style={s.detailValue}>
              {log.expense_id
                ? 'Auto-logged from an expense — deleting that expense also removes this trip.'
                : 'Added manually.'}
            </Text>
          </View>

          <TouchableOpacity style={s.deleteBtn} onPress={confirmDelete}>
            <Text style={s.deleteBtnText}>Delete Trip</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Car-on-road illustration for the Mileage hero.
function CarArt() {
  return (
    <Svg width={130} height={100} viewBox="0 0 130 100">
      {/* faint cityscape */}
      <Rect x="6"  y="30" width="16" height="40" rx="2" fill="#DCE4F5" />
      <Rect x="108" y="26" width="16" height="44" rx="2" fill="#DCE4F5" />
      {/* hills */}
      <Ellipse cx="24" cy="78" rx="34" ry="20" fill="#34D399" />
      <Ellipse cx="110" cy="80" rx="32" ry="20" fill="#34D399" />
      {/* road */}
      <Path d="M30 100 C 50 70, 80 70, 100 40 L120 44 C 96 78, 64 80, 50 100 Z" fill="#94A3B8" />
      <Path d="M58 92 L70 72" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />
      {/* car body */}
      <Rect x="48" y="44" width="42" height="20" rx="7" fill="#2563EB" transform="rotate(-20 69 54)" />
      <Rect x="56" y="40" width="22" height="13" rx="4" fill="#1E40AF" transform="rotate(-20 67 46)" />
      {/* windows */}
      <Rect x="59" y="42" width="15" height="9" rx="2" fill="#DBEAFE" transform="rotate(-20 66 46)" />
      {/* headlight */}
      <Circle cx="86" cy="50" r="3" fill="#FDE047" transform="rotate(-20 86 50)" />
      {/* wheels */}
      <Circle cx="56" cy="66" r="6" fill="#1E1B4B" />
      <Circle cx="82" cy="56" r="6" fill="#1E1B4B" />
    </Svg>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MileageScreen() {
  const { activeChild }                     = useChild();
  const { session, profile }                = useAuth();
  const { summary }                         = useBudget(activeChild?.id ?? null);
  const [logs,        setLogs]              = useState<MileageLog[]>([]);
  const [loading,     setLoading]           = useState(false);
  const [monthOffset, setMonthOffset]       = useState(0);
  const [showAdd,     setShowAdd]           = useState(false);
  const [exporting,   setExporting]         = useState(false);
  const [detailLog,   setDetailLog]         = useState<MileageLog | null>(null);

  const now = new Date();
  const selected  = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthLabel = format(selected, 'MMMM yyyy');
  const startDate  = format(selected, 'yyyy-MM-dd').slice(0, 8) + '01';
  const nextMonth  = new Date(selected.getFullYear(), selected.getMonth() + 1, 1);
  const endDate    = format(nextMonth, 'yyyy-MM-dd');

  const fetchLogs = useCallback(async () => {
    if (!activeChild) { setLogs([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('mileage_logs')
      .select('*')
      .eq('child_id', activeChild.id)
      .gte('trip_date', startDate)
      .lt('trip_date', endDate)
      .order('trip_date', { ascending: false });
    setLogs((data ?? []) as MileageLog[]);
    setLoading(false);
  }, [activeChild, startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalKm   = logs.reduce((s, l) => s + Number(l.distance_km), 0);
  const totalAmt  = logs.reduce((s, l) => s + Number(l.reimbursement_amount), 0);
  const avgRate   = logs.length ? logs[0].rate_per_km : SOUTHERN_RATE_PER_KM;

  async function handleExport() {
    if (!activeChild || logs.length === 0) return;
    setExporting(true);
    try {
      await generateAndShareMileageWorksheetPdf({
        childName:           activeChild.name,
        healthServicesNumber: activeChild.health_card_number,
        parentName:          profile?.full_name ?? '',
        parentEmail:         session?.user.email ?? '',
        monthLabel,
        rows: [...logs].reverse().map(l => ({
          trip_date:            l.trip_date,
          description:          l.description,
          distance_km:          Number(l.distance_km),
          rate_per_km:          Number(l.rate_per_km),
          reimbursement_amount: Number(l.reimbursement_amount),
        })),
        total: totalAmt,
      });
    } catch {
      Alert.alert('Export failed', 'Could not generate the mileage worksheet. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  async function openOfficialMileageForm() {
    try {
      await Linking.openURL(OFFICIAL_MILEAGE_FORM_URL);
    } catch {
      Alert.alert('Could not open form', 'Please try again or visit Saskatchewan.ca in your browser.');
    }
  }

  const fundingYearId = summary.fundingYear?.id ?? null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <FlatList
        data={logs}
        keyExtractor={l => l.id}
        contentContainerStyle={{ paddingBottom: 40, gap: 0 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={() => (
          <View>
            {/* Header */}
            <View style={s.pageHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AppLogo size={36} />
                  <Text style={s.pageTitle}>Mileage</Text>
                </View>
                <Text style={s.pageSubtitle}>Track your trips for appointments{'\n'}and get reimbursed. 💙</Text>
              </View>
              <View style={{ marginTop: -4, marginRight: -8 }}>
                <CarArt />
              </View>
            </View>

            {/* Month stat card */}
            <View style={[s.card, { marginHorizontal: 16, marginBottom: 14 }]}>
              <View style={s.monthRow}>
                <Text style={s.monthLabel}>This Month</Text>
                <View style={s.monthNav}>
                  <TouchableOpacity onPress={() => setMonthOffset(o => o - 1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={s.monthArrow}>‹</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.purple} />
                    <Text style={s.monthName}>{monthLabel}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setMonthOffset(o => Math.min(o + 1, 0))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    disabled={monthOffset === 0}
                  >
                    <Text style={[s.monthArrow, monthOffset === 0 && { opacity: 0.3 }]}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={s.statsRow}>
                {/* Total km */}
                <View style={s.statBox}>
                  <View style={[s.statIconCircle, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name="speedometer" size={24} color="#2563EB" />
                  </View>
                  <Text style={s.statCaption}>Total Kilometres</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={s.statBig}>{totalKm.toFixed(1)}</Text>
                    <Text style={s.statUnit}>km</Text>
                  </View>
                </View>

                <View style={s.statDivider} />

                {/* Reimbursement */}
                <View style={s.statBox}>
                  <View style={[s.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
                    <Ionicons name="cash" size={24} color="#16A34A" />
                  </View>
                  <Text style={s.statCaption}>Estimated Reimbursement</Text>
                  <Text style={[s.statBig, { color: '#15803D' }]}>{CAD(totalAmt)}</Text>
                  <View style={s.rateBadge}>
                    <Text style={s.rateBadgeText}>Rate: ${Number(avgRate).toFixed(2)} / km</Text>
                  </View>
                </View>
              </View>

              {/* Grant-year total */}
              <View style={s.yearTotalRow}>
                <Text style={s.yearTotalLabel}>This grant year</Text>
                <Text style={s.yearTotalValue}>{CAD(summary.totalMileage)}</Text>
              </View>
            </View>

            {/* Add Trip + Export Worksheet buttons */}
            {activeChild && fundingYearId && (
              <View style={{ paddingHorizontal: 16, marginBottom: 20, gap: 10 }}>
                <TouchableOpacity onPress={() => setShowAdd(true)} activeOpacity={0.88} style={s.addBtn}>
                  <View style={s.addBtnCircle}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={s.addBtnText}>Add Trip</Text>
                </TouchableOpacity>
                {logs.length > 0 && (
                  <TouchableOpacity
                    onPress={handleExport}
                    disabled={exporting}
                    activeOpacity={0.88}
                    style={[s.addBtn, { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#16A34A' }]}
                  >
                    {exporting ? (
                      <ActivityIndicator size="small" color="#16A34A" />
                    ) : (
                      <View style={[s.addBtnCircle, { backgroundColor: '#16A34A' }]}>
                        <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                      </View>
                    )}
                    <Text style={[s.addBtnText, { color: '#15803D' }]}>Export Worksheet</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={openOfficialMileageForm}
                  activeOpacity={0.88}
                  style={[s.addBtn, { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#2563EB', shadowOpacity: 0, elevation: 0 }]}
                >
                  <View style={[s.addBtnCircle, { backgroundColor: '#2563EB', borderColor: '#2563EB' }]}>
                    <Ionicons name="open-outline" size={17} color="#FFFFFF" />
                  </View>
                  <Text style={[s.addBtnText, { color: '#1D4ED8', fontSize: 15, flex: 1, textAlign: 'center' }]}>Open Official Mileage Form</Text>
                  <Ionicons name="chevron-forward" size={18} color="#2563EB" />
                </TouchableOpacity>
              </View>
            )}

            {/* Recent trips header */}
            {logs.length > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 }}>
                <Text style={s.sectionTitle}>Recent Trips</Text>
                <Text style={{ fontSize: 13, color: Colors.purple, fontWeight: '600' }}>{logs.length} trip{logs.length !== 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <TripRow log={item} onPress={() => setDetailLog(item)} />
            <View style={{ height: 1, backgroundColor: Colors.border }} />
          </View>
        )}
        ListEmptyComponent={() => (
          loading ? (
            <ActivityIndicator color={Colors.purple} style={{ marginTop: 40 }} />
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 32, gap: 10 }}>
              <TripArt />
              <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.textPrimary }}>No trips this month</Text>
              <Text style={{ fontSize: 14, color: Colors.textMuted }}>Tap Add Trip to log your first one</Text>
            </View>
          )
        )}
        ListFooterComponent={() => logs.length > 0 ? (
          <View style={s.secureNote}>
            <Ionicons name="shield-checkmark" size={20} color="#1D4ED8" />
            <Text style={s.secureText}>All trips are secure and saved{'\n'}for easy reporting.</Text>
          </View>
        ) : null}
      />

      {activeChild && fundingYearId && (
        <AddTripModal
          visible={showAdd}
          onClose={() => setShowAdd(false)}
          childId={activeChild.id}
          fundingYearId={fundingYearId}
          onSaved={fetchLogs}
        />
      )}

      <TripDetailModal
        log={detailLog}
        visible={!!detailLog}
        onClose={() => setDetailLog(null)}
        onDeleted={fetchLogs}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  pageHeader:   { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  pageTitle:    { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  card:       { backgroundColor: Colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  monthRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  monthNav:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  monthArrow: { fontSize: 22, color: Colors.purple, fontWeight: '600', paddingHorizontal: 4 },
  monthName:  { fontSize: 13, fontWeight: '600', color: Colors.purple },

  statsRow:       { flexDirection: 'row', alignItems: 'flex-start' },
  statBox:        { flex: 1, alignItems: 'center', gap: 6 },
  statDivider:    { width: 1, backgroundColor: Colors.border, marginHorizontal: 8, marginVertical: 4 },
  statIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  statCaption:    { fontSize: 11, color: Colors.textMuted, textAlign: 'center', fontWeight: '500' },
  statBig:        { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  statUnit:       { fontSize: 14, color: Colors.textMuted, fontWeight: '600', marginBottom: 2 },
  rateBadge:      { backgroundColor: Colors.surfaceAlt, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: Colors.border },
  rateBadgeText:  { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  yearTotalRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  yearTotalLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  yearTotalValue: { fontSize: 17, fontWeight: '800', color: '#15803D' },

  addBtn:     {
    backgroundColor: '#1E40AF', borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#1E40AF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  addBtnCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  tripRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  tripIcon:   { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  tripTitle:  { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  tripMeta:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  tripAmount: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16, backgroundColor: '#EFF6FF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#BFDBFE' },
  secureText: { fontSize: 13, color: '#1D4ED8', fontWeight: '500', lineHeight: 18 },

  // Modal
  mHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.border },
  mTitle:     { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  mBody:      { padding: 20, paddingBottom: 48 },
  label:      { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  field:      { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, color: Colors.textPrimary },
  searchBox:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 4 },
  searchInput:{ flex: 1, fontSize: 15, color: Colors.textPrimary },
  dropdown:   { marginTop: 4, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  dropItem:   { padding: 12 },
  dropName:   { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  dropSub:    { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  selectedProv:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  selectedProvText: { fontSize: 15, fontWeight: '600', color: Colors.purple },
  toggleRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 12, marginTop: 14 },
  toggleLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  toggle:      { width: 44, height: 26, borderRadius: 13, backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn:    { backgroundColor: '#1D4ED8' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },
  calcCard:   { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#86EFAC', marginTop: 14 },
  calcText:   { fontSize: 15, color: '#166534' },
  saveBtn:    { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnText:{ fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  // Trip detail
  detailRow:    { backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, marginTop: 10 },
  detailLabel:  { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  detailValue:  { fontSize: 14, color: Colors.textPrimary, marginTop: 4 },
  deleteBtn:    { marginTop: 20, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#FECDD3', alignItems: 'center' },
  deleteBtnText:{ color: '#BE123C', fontWeight: '600', fontSize: 14 },
});
