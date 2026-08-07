import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, ScrollView,
  StyleSheet, Alert, ActivityIndicator, TextInput, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as CalendarAPI from 'expo-calendar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { Colors } from '@constants/colors';
import { AppLogo } from '@components/AppLogo';
import { CalendarArt } from '@components/EmptyArt';
import { DateField } from '@components/DateField';
import { supabase } from '@lib/supabase';
import type { Appointment, Provider, ProviderCategory } from '@lib/types';
import { useChild } from '@context/ChildContext';
import { useAuth } from '@context/AuthContext';
import { useBudget } from '@hooks/useBudget';
import { useAppointments } from '@hooks/useAppointments';
import { scheduleAppointmentReminder, requestNotificationPermission } from '@lib/notifications';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: { value: ProviderCategory; label: string; emoji: string }[] = [
  { value: 'aba_ibi',              label: 'ABA / IBI',     emoji: '🧩' },
  { value: 'speech_language',      label: 'Speech',        emoji: '🗣️' },
  { value: 'occupational_therapy', label: 'OT',            emoji: '✋' },
  { value: 'physical_therapy',     label: 'PT',            emoji: '🏃' },
  { value: 'psychology',           label: 'Psychology',    emoji: '🧠' },
  { value: 'respite',              label: 'Respite',       emoji: '🏠' },
  { value: 'swimming',             label: 'Swimming',      emoji: '🏊' },
  { value: 'social_skills',        label: 'Social Skills', emoji: '👫' },
  { value: 'music_therapy',        label: 'Music',         emoji: '🎵' },
  { value: 'art_therapy',          label: 'Art',           emoji: '🎨' },
  { value: 'assistive_technology', label: 'Assistive Tech',emoji: '📱' },
  { value: 'other',                label: 'Other',         emoji: '📋' },
];

const catEmoji = (cat: ProviderCategory) =>
  CATEGORY_CONFIG.find(c => c.value === cat)?.emoji ?? '📋';
const catLabel = (cat: ProviderCategory) =>
  CATEGORY_CONFIG.find(c => c.value === cat)?.label ?? cat;

async function getWritableCalendarId(): Promise<string | null> {
  const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;
  const cals = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
  return cals.find(c => c.allowsModifications)?.id ?? null;
}

// ─── AppointmentCard ──────────────────────────────────────────────────────────

function AppointmentCard({
  appointment, onPress, onDelete,
}: {
  appointment: Appointment;
  onPress: () => void;
  onDelete: () => void;
}) {
  const dt      = parseISO(appointment.scheduled_at);
  const upcoming = isFuture(dt);
  const prov    = (appointment as any).providers;

  return (
    <TouchableOpacity style={[s.card, !upcoming && s.cardPast]} onPress={onPress} activeOpacity={0.8}>
      {/* Date bubble */}
      <LinearGradient
        colors={(upcoming ? Colors.gradients.purple : ['#D1D5DB', '#9CA3AF']) as string[]}
        style={s.dateBubble}
      >
        <Text style={s.dateDay}>{format(dt, 'd')}</Text>
        <Text style={s.dateMon}>{format(dt, 'MMM')}</Text>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        <Text style={[s.cardTitle, !upcoming && { color: Colors.textMuted }]} numberOfLines={1}>
          {appointment.title}
        </Text>
        {prov && (
          <Text style={s.cardSub} numberOfLines={1}>
            {catEmoji(prov.category)} {prov.name}
          </Text>
        )}
        <Text style={s.cardTime}>{format(dt, 'h:mm a')} · {upcoming ? 'Upcoming' : 'Past'}</Text>
      </View>

      <TouchableOpacity
        style={s.deleteBtn}
        onPress={e => { e.stopPropagation?.(); onDelete(); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={{ fontSize: 16, color: Colors.textMuted }}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── AddAppointmentModal ──────────────────────────────────────────────────────

function AddAppointmentModal({
  visible, onClose, childId, fundingYearId, onSaved, initialProvider,
}: {
  visible: boolean; onClose: () => void;
  childId: string; fundingYearId: string | null; onSaved: () => void;
  initialProvider?: Provider | null;
}) {
  const { session } = useAuth();
  const [title,           setTitle]           = useState('');
  const [date,            setDate]            = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time,            setTime]            = useState('09:00');
  const [notes,           setNotes]           = useState('');
  const [providerQuery,   setProviderQuery]   = useState('');
  const [providerResults, setProviderResults] = useState<Provider[]>([]);
  const [selectedProvider,setSelectedProvider]= useState<Provider | null>(null);
  const [syncCalendar,    setSyncCalendar]    = useState(false);
  const [scheduleReminder,setScheduleReminder]= useState(false);
  const [reminderOffset,  setReminderOffset]  = useState(1440);
  const [saving,          setSaving]          = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle(initialProvider?.name ?? '');
      setDate(format(new Date(), 'yyyy-MM-dd')); setTime('09:00');
      setNotes(''); setProviderQuery(''); setSelectedProvider(initialProvider ?? null);
      setProviderResults([]); setSyncCalendar(false); setScheduleReminder(false); setReminderOffset(1440);
      setSaving(false);
    }
  }, [visible, initialProvider]);

  const searchProviders = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim() || !session) { setProviderResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('providers')
        .select('id, name, category, city, address')
        .eq('parent_id', session.user.id)
        .ilike('name', `%${q}%`)
        .limit(6);
      setProviderResults((data ?? []) as Provider[]);
    }, 250);
  }, [session]);

  function onProviderSelect(p: Provider) {
    setSelectedProvider(p);
    if (!title) setTitle(p.name);
    setProviderQuery('');
    setProviderResults([]);
  }

  async function handleSave() {
    if (!title.trim()) { Alert.alert('Title required', 'Add an appointment title.'); return; }
    setSaving(true);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`);
      let calendarEventId: string | null = null;

      if (syncCalendar) {
        try {
          const calId = await getWritableCalendarId();
          if (calId) {
            const end = new Date(scheduledAt.getTime() + 60 * 60 * 1000); // +1h
            calendarEventId = await CalendarAPI.createEventAsync(calId, {
              title: title.trim(),
              startDate: scheduledAt,
              endDate: end,
              notes: notes.trim() || undefined,
              alarms: [{ relativeOffset: -reminderOffset }],
            });
          }
        } catch {}
      }

      const { data: row, error } = await supabase
        .from('appointments')
        .insert({
          child_id:          childId,
          provider_id:       selectedProvider?.id ?? null,
          title:             title.trim(),
          scheduled_at:      scheduledAt.toISOString(),
          notes:             notes.trim() || null,
          calendar_event_id: calendarEventId,
        })
        .select('id').single();

      if (error || !row) throw error;

      // Notification access is requested only after the user explicitly opts in.
      // Denial or scheduling failure never prevents the appointment from saving.
      if (scheduleReminder) {
        try {
          const granted = await requestNotificationPermission();
          if (granted) {
            await scheduleAppointmentReminder(row.id, scheduledAt, reminderOffset);
          }
        } catch {}
      }

      onSaved(); onClose();
    } catch (err: any) {
      Alert.alert('Save failed', err?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
        <View style={s.mHeader}>
          <Text style={s.mTitle}>New Appointment</Text>
          <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 16, color: Colors.purple, fontWeight: '500' }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={s.mBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Text style={s.fieldLabel}>Title *</Text>
            <TextInput
              style={s.textField}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. ABA Session"
              placeholderTextColor={Colors.textMuted}
              returnKeyType="next"
            />

            {/* Provider */}
            <Text style={[s.fieldLabel, { marginTop: 18 }]}>Provider (optional)</Text>
            {selectedProvider ? (
              <View style={s.selectedProv}>
                <Text style={s.selectedProvText}>{selectedProvider.name}</Text>
                <TouchableOpacity onPress={() => { setSelectedProvider(null); setProviderQuery(''); }}>
                  <Text style={{ color: Colors.textMuted, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={s.searchBox}>
                  <Text style={{ fontSize: 14 }}>🔍</Text>
                  <TextInput
                    style={s.searchInput}
                    placeholder="Search providers…"
                    placeholderTextColor={Colors.textMuted}
                    value={providerQuery}
                    onChangeText={q => { setProviderQuery(q); searchProviders(q); }}
                    returnKeyType="search"
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
                        <Text style={s.dropSub}>{catEmoji(p.category)} {catLabel(p.category)} · {p.city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Date & Time */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
              <View style={{ flex: 3 }}>
                <Text style={s.fieldLabel}>Date</Text>
                <DateField value={date} onChange={setDate} maximumDate={new Date(2100, 0, 1)} />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={s.fieldLabel}>Time</Text>
                <TextInput
                  style={s.textField}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {/* Notes */}
            <Text style={[s.fieldLabel, { marginTop: 18 }]}>Notes (optional)</Text>
            <TextInput
              style={[s.textField, { minHeight: 72, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Session notes, prep reminders…"
              placeholderTextColor={Colors.textMuted}
              multiline
              returnKeyType="done"
            />

            {/* Calendar sync toggle */}
            <TouchableOpacity
              style={s.toggleRow}
              onPress={() => setSyncCalendar(!syncCalendar)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.toggleLabel}>📅 Add to Device Calendar</Text>
                <Text style={s.toggleSub}>Off by default · asks only when you choose this</Text>
              </View>
              <View style={[s.toggle, syncCalendar && s.toggleOn]}>
                <View style={[s.toggleThumb, syncCalendar && s.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.toggleRow}
              onPress={() => setScheduleReminder(!scheduleReminder)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.toggleLabel}>🔔 Schedule Notification Reminder</Text>
                <Text style={s.toggleSub}>Off by default · lock-screen text stays private</Text>
              </View>
              <View style={[s.toggle, scheduleReminder && s.toggleOn]}>
                <View style={[s.toggleThumb, scheduleReminder && s.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            {(syncCalendar || scheduleReminder) && (
              <>
                <Text style={[s.fieldLabel, { marginTop: 18 }]}>Reminder timing</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {([
                    { label: '1 hr before', value: 60 },
                    { label: '2 hrs before', value: 120 },
                    { label: 'Day before', value: 1440 },
                  ] as const).map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[s.reminderChip, reminderOffset === opt.value && s.reminderChipActive]}
                      onPress={() => setReminderOffset(opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.reminderChipText, reminderOffset === opt.value && s.reminderChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {selectedProvider && (
              <View style={s.homePrompt}>
                <Text style={s.homePromptText}>Mileage can be logged manually from the Mileage tab.</Text>
              </View>
            )}

            {/* Save */}
            <TouchableOpacity style={{ marginTop: 28 }} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <LinearGradient
                colors={Colors.gradients.purple as unknown as string[]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.saveBtn}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.saveBtnText}>Save Appointment</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AppointmentsScreen() {
  const { activeChild }                              = useChild();
  const { session }                                  = useAuth();
  const { summary }                                  = useBudget(activeChild?.id ?? null);
  const { appointments, loading, refetch }           = useAppointments(activeChild?.id ?? null);
  const [showAdd, setShowAdd]                        = useState(false);
  const [showPast, setShowPast]                      = useState(false);
  const [preselectProvider, setPreselectProvider]    = useState<Provider | null>(null);
  const { preselectId }                              = useLocalSearchParams<{ preselectId?: string }>();
  const router                                       = useRouter();

  useEffect(() => {
    if (!preselectId || !activeChild || !session) return;
    supabase
      .from('providers')
      .select('*')
      .eq('id', preselectId)
      .eq('parent_id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPreselectProvider(data as Provider);
          setShowAdd(true);
        }
      });
    // Clear the param after handling so re-visiting the tab doesn't re-open
    router.setParams({ preselectId: undefined });
  }, [preselectId, activeChild, router, session]);

  const upcoming = appointments.filter(a => isFuture(parseISO(a.scheduled_at)));
  const past     = appointments.filter(a => isPast(parseISO(a.scheduled_at)));

  async function deleteAppointment(a: Appointment) {
    Alert.alert('Delete appointment?', a.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          if (a.calendar_event_id) {
            try { await CalendarAPI.deleteEventAsync(a.calendar_event_id); } catch {}
          }
          await supabase.from('appointments').delete().eq('id', a.id);
          refetch();
        },
      },
    ]);
  }

  const listData = [
    ...upcoming,
    ...(showPast ? past : []),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={() => (
          <View style={{ gap: 10 }}>
            <View style={s.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppLogo size={30} />
                <Text style={s.headerTitle}>Calendar</Text>
              </View>
              {activeChild && <Text style={s.headerSub}>Appointments for {activeChild.name} 💙</Text>}
            </View>

            {upcoming.length === 0 && !loading && (
              <View style={s.emptyCard}>
                <CalendarArt />
                <Text style={{ fontWeight: '700', color: Colors.textPrimary, fontSize: 16, marginTop: 8 }}>No upcoming appointments</Text>
                <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 4 }}>Tap + to schedule one</Text>
              </View>
            )}

            {upcoming.length > 0 && (
              <Text style={s.sectionLabel}>UPCOMING — {upcoming.length}</Text>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onPress={() => {}}
            onDelete={() => deleteAppointment(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListFooterComponent={() => (
          <View>
            {past.length > 0 && (
              <TouchableOpacity
                style={s.pastToggle}
                onPress={() => setShowPast(!showPast)}
                activeOpacity={0.7}
              >
                <Text style={s.pastToggleText}>
                  {showPast ? '▲ Hide' : '▼ Show'} past appointments ({past.length})
                </Text>
              </TouchableOpacity>
            )}
            {showPast && past.map(a => (
              <View key={a.id} style={{ marginBottom: 8 }}>
                <AppointmentCard
                  appointment={a}
                  onPress={() => {}}
                  onDelete={() => deleteAppointment(a)}
                />
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={() =>
          loading ? <ActivityIndicator color={Colors.purple} style={{ marginTop: 40 }} /> : null
        }
      />

      {/* FAB — always visible when a child is selected */}
      {activeChild && (
        <TouchableOpacity style={s.fabWrap} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
          <LinearGradient
            colors={Colors.gradients.purple as unknown as string[]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.fab}
          >
            <Text style={s.fabPlus}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {activeChild && (
        <AddAppointmentModal
          visible={showAdd}
          onClose={() => { setShowAdd(false); setPreselectProvider(null); }}
          childId={activeChild.id}
          fundingYearId={summary.fundingYear?.id ?? null}
          onSaved={refetch}
          initialProvider={preselectProvider}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header:      { gap: 3, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  headerSub:   { fontSize: 14, color: Colors.textMuted },
  listContent: { paddingHorizontal: 16, paddingBottom: 110, gap: 0, paddingTop: 8 },
  sectionLabel:{ fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.6, marginTop: 4 },

  emptyCard: {
    backgroundColor: Colors.surface, borderRadius: 18, padding: 28,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginTop: 8,
  },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.purple, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardPast:  { opacity: 0.6 },
  dateBubble:{ width: 48, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dateDay:   { fontSize: 20, fontWeight: '800', color: '#fff' },
  dateMon:   { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: -2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardSub:   { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardTime:  { fontSize: 11, color: Colors.textMuted, marginTop: 3 },
  deleteBtn: { padding: 6 },

  pastToggle:     { alignItems: 'center', paddingVertical: 14 },
  pastToggleText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },

  // FAB
  fabWrap: {
    position: 'absolute', bottom: 28, right: 20, borderRadius: 29,
    shadowColor: Colors.purple, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  fab:    { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  fabPlus:{ fontSize: 30, color: '#fff', fontWeight: '300', marginTop: -1 },

  // Modal
  mHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: Colors.border,
  },
  mTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  mBody:  { padding: 20, paddingBottom: 48 },

  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  textField:  { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, color: Colors.textPrimary },

  searchBox:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 4, gap: 8 },
  searchInput:  { flex: 1, fontSize: 15, color: Colors.textPrimary },
  dropdown:     { marginTop: 4, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  dropItem:     { padding: 12 },
  dropName:     { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  dropSub:      { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  selectedProv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  selectedProvText: { fontSize: 15, fontWeight: '600', color: Colors.purple },

  toggleRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 12, marginTop: 14 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  toggleSub:   { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  toggle:      { width: 44, height: 26, borderRadius: 13, backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn:    { backgroundColor: Colors.purple },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },

  mileageBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 10 },
  mileageBannerText: { fontSize: 13, color: Colors.textSecondary },

  mileageCard:   { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#86EFAC', marginTop: 8 },
  roundTripRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox:      { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn:    { backgroundColor: Colors.purple, borderColor: Colors.purple },
  roundTripLabel:{ fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  mileageCalc:   { fontSize: 14, color: '#166534', marginTop: 8 },

  homePrompt:     { marginTop: 10, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FDE68A' },
  homePromptText: { fontSize: 13, color: '#92400E', fontWeight: '500' },

  reminderChip:         { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  reminderChipActive:   { backgroundColor: Colors.purple, borderColor: Colors.purple },
  reminderChipText:     { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  reminderChipTextActive:{ color: '#fff' },

  saveBtn:    { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnText:{ fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
});
