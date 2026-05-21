import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, ScrollView,
  TextInput, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { AppLogo } from '@components/AppLogo';
import { Colors } from '@constants/colors';
import { supabase } from '@lib/supabase';
import type { RespiteSession } from '@lib/types';
import { useChild } from '@context/ChildContext';
import { useAuth } from '@context/AuthContext';
import { useBudget } from '@hooks/useBudget';
import { fillAndShareOfficialRespitePdf } from '@lib/pdfForms';

const CAD = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);

// ─── Add Session Modal ─────────────────────────────────────────────────────────

function AddSessionModal({
  visible, onClose, childId, fundingYearId, onSaved,
}: {
  visible: boolean; onClose: () => void;
  childId: string; fundingYearId: string; onSaved: () => void;
}) {
  const { session } = useAuth();
  const [date,         setDate]         = useState(format(new Date(), 'yyyy-MM-dd'));
  const [providerName, setProviderName] = useState('');
  const [phone,        setPhone]        = useState('');
  const [useHourly,    setUseHourly]    = useState(true);
  const [hours,        setHours]        = useState('');
  const [rate,         setRate]         = useState('');
  const [flatAmount,   setFlatAmount]   = useState('');
  const [notes,        setNotes]        = useState('');
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    if (visible) {
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setProviderName(''); setPhone(''); setUseHourly(true);
      setHours(''); setRate(''); setFlatAmount(''); setNotes('');
    }
  }, [visible]);

  const computedAmount = useHourly
    ? (parseFloat(hours) || 0) * (parseFloat(rate) || 0)
    : parseFloat(flatAmount) || 0;

  async function handleSave() {
    if (!providerName.trim()) { Alert.alert('Missing info', 'Please enter the provider name.'); return; }
    if (computedAmount <= 0) { Alert.alert('Missing info', 'Please enter a valid amount.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('respite_sessions').insert({
        child_id:        childId,
        funding_year_id: fundingYearId,
        session_date:    date,
        provider_name:   providerName.trim(),
        provider_phone:  phone.trim() || null,
        hours:           useHourly ? (parseFloat(hours) || null) : null,
        rate_per_hour:   useHourly ? (parseFloat(rate) || null) : null,
        amount_paid:     computedAmount,
        notes:           notes.trim() || null,
        logged_by:       session!.user.id,
      });
      if (error) throw error;

      // Also create a corresponding expense for budget tracking
      await supabase.from('expenses').insert({
        child_id:        childId,
        funding_year_id: fundingYearId,
        category:        'respite',
        amount:          computedAmount,
        expense_date:    date,
        status:          'approved',
        description:     `Respite — ${providerName.trim()}${notes.trim() ? `: ${notes.trim()}` : ''}`,
        logged_by:       session!.user.id,
      });

      onSaved();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save session.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={m.modalHeader}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={m.modalTitle}>Log Respite Session</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={Colors.purple} /> : <Text style={m.saveBtn}>Save</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
            {/* Date */}
            <View>
              <Text style={m.label}>Date</Text>
              <TextInput
                style={m.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Provider name */}
            <View>
              <Text style={m.label}>Service Provider Name</Text>
              <TextInput
                style={m.input}
                value={providerName}
                onChangeText={setProviderName}
                placeholder="Family member, neighbour, agency..."
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            {/* Phone */}
            <View>
              <Text style={m.label}>Phone Number (optional)</Text>
              <TextInput
                style={m.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="306-555-0100"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            {/* Amount toggle */}
            <View>
              <Text style={m.label}>Amount Type</Text>
              <View style={m.toggle}>
                <TouchableOpacity
                  style={[m.toggleBtn, useHourly && m.toggleBtnActive]}
                  onPress={() => setUseHourly(true)}
                >
                  <Text style={[m.toggleTxt, useHourly && m.toggleTxtActive]}>Hourly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[m.toggleBtn, !useHourly && m.toggleBtnActive]}
                  onPress={() => setUseHourly(false)}
                >
                  <Text style={[m.toggleTxt, !useHourly && m.toggleTxtActive]}>Flat Amount</Text>
                </TouchableOpacity>
              </View>
            </View>

            {useHourly ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={m.label}>Hours</Text>
                  <TextInput style={m.input} value={hours} onChangeText={setHours}
                    placeholder="4.0" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={m.label}>Rate / hr ($)</Text>
                  <TextInput style={m.input} value={rate} onChangeText={setRate}
                    placeholder="15.00" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad" />
                </View>
              </View>
            ) : (
              <View>
                <Text style={m.label}>Amount Paid ($)</Text>
                <TextInput style={m.input} value={flatAmount} onChangeText={setFlatAmount}
                  placeholder="0.00" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad" />
              </View>
            )}

            {/* Computed total */}
            {computedAmount > 0 && (
              <View style={m.totalPreview}>
                <Text style={m.totalPreviewLabel}>Amount to log</Text>
                <Text style={m.totalPreviewAmt}>{CAD(computedAmount)}</Text>
              </View>
            )}

            {/* Notes */}
            <View>
              <Text style={m.label}>Notes (optional)</Text>
              <TextInput
                style={[m.input, { height: 72, textAlignVertical: 'top' }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Activities, location, etc."
                placeholderTextColor={Colors.textMuted}
                multiline
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Session Row ───────────────────────────────────────────────────────────────

function SessionRow({ session }: { session: RespiteSession }) {
  return (
    <View style={s.row}>
      <View style={s.rowIcon}>
        <Ionicons name="home-outline" size={20} color={Colors.purple} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowName} numberOfLines={1}>{session.provider_name}</Text>
        <Text style={s.rowSub}>
          {format(parseISO(session.session_date), 'MMM d, yyyy')}
          {session.hours ? `  ·  ${Number(session.hours).toFixed(1)} hrs` : ''}
          {session.provider_phone ? `  ·  ${session.provider_phone}` : ''}
        </Text>
      </View>
      <Text style={s.rowAmt}>{CAD(Number(session.amount_paid))}</Text>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function RespiteScreen() {
  const { activeChild }   = useChild();
  const { session, profile } = useAuth();
  const { summary }       = useBudget(activeChild?.id ?? null);
  const [sessions, setSessions] = useState<RespiteSession[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [showAdd,  setShowAdd]  = useState(false);
  const [exporting, setExporting] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const now        = new Date();
  const selected   = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthLabel = format(selected, 'MMMM yyyy');
  const startDate  = format(selected, 'yyyy-MM-01');
  const nextMonth  = new Date(selected.getFullYear(), selected.getMonth() + 1, 1);
  const endDate    = format(nextMonth, 'yyyy-MM-dd');

  const fetchSessions = useCallback(async () => {
    if (!activeChild) { setSessions([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('respite_sessions')
      .select('*')
      .eq('child_id', activeChild.id)
      .gte('session_date', startDate)
      .lt('session_date', endDate)
      .order('session_date', { ascending: false });
    setSessions((data ?? []) as RespiteSession[]);
    setLoading(false);
  }, [activeChild, startDate, endDate]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const totalAmt  = sessions.reduce((s, r) => s + Number(r.amount_paid), 0);
  const totalHrs  = sessions.reduce((s, r) => s + (r.hours ? Number(r.hours) : 0), 0);
  const fundingYearId = summary.fundingYear?.id ?? null;

  async function handleExport() {
    if (!activeChild || sessions.length === 0) return;
    setExporting(true);
    try {
      await fillAndShareOfficialRespitePdf({
        childName:            activeChild.name,
        healthServicesNumber: activeChild.health_card_number,
        parentName:           profile?.full_name ?? '',
        parentEmail:          session?.user.email ?? '',
        monthLabel,
        rows: [...sessions].reverse().map(r => ({
          session_date:  r.session_date,
          provider_name: r.provider_name,
          provider_phone: r.provider_phone,
          amount_paid:   Number(r.amount_paid),
        })),
        total: totalAmt,
      });
    } catch {
      Alert.alert('Export failed', 'Could not generate the invoice. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <FlatList
        data={sessions}
        keyExtractor={r => r.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={() => (
          <View>
            {/* Page header */}
            <View style={s.pageHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AppLogo size={36} />
                  <Text style={s.pageTitle}>Respite</Text>
                </View>
                <Text style={s.pageSubtitle}>Log sessions and pay your{'\n'}support workers. 🏡</Text>
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
                <View style={s.statBox}>
                  <View style={[s.statIconCircle, { backgroundColor: '#EDE9FE' }]}>
                    <Ionicons name="home" size={24} color={Colors.purple} />
                  </View>
                  <Text style={s.statCaption}>Sessions</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={s.statBig}>{sessions.length}</Text>
                    {totalHrs > 0 && <Text style={s.statUnit}>{totalHrs.toFixed(1)} hrs</Text>}
                  </View>
                </View>

                <View style={s.statDivider} />

                <View style={s.statBox}>
                  <View style={[s.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
                    <Ionicons name="cash" size={24} color="#16A34A" />
                  </View>
                  <Text style={s.statCaption}>Total Paid</Text>
                  <Text style={[s.statBig, { color: '#15803D' }]}>{CAD(totalAmt)}</Text>
                </View>
              </View>
            </View>

            {/* Buttons */}
            {activeChild && fundingYearId && (
              <View style={{ paddingHorizontal: 16, marginBottom: 20, gap: 10 }}>
                <TouchableOpacity onPress={() => setShowAdd(true)} activeOpacity={0.88} style={s.addBtn}>
                  <View style={s.addBtnCircle}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={s.addBtnText}>Log Session</Text>
                </TouchableOpacity>

                {sessions.length > 0 && (
                  <TouchableOpacity
                    onPress={handleExport}
                    disabled={exporting}
                    activeOpacity={0.88}
                    style={[s.addBtn, { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#16A34A' }]}
                  >
                    {exporting
                      ? <ActivityIndicator size="small" color="#16A34A" />
                      : <View style={[s.addBtnCircle, { backgroundColor: '#16A34A' }]}>
                          <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                        </View>
                    }
                    <Text style={[s.addBtnText, { color: '#15803D' }]}>Export Invoice</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {sessions.length > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 }}>
                <Text style={s.sectionTitle}>Sessions</Text>
                <Text style={{ fontSize: 13, color: Colors.purple, fontWeight: '600' }}>
                  {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <SessionRow session={item} />
            <View style={{ height: 1, backgroundColor: Colors.border }} />
          </View>
        )}
        ListEmptyComponent={() => (
          loading ? (
            <ActivityIndicator color={Colors.purple} style={{ marginTop: 40 }} />
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 32, gap: 10 }}>
              <Ionicons name="home-outline" size={40} color={Colors.textMuted} />
              <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.textPrimary }}>No sessions this month</Text>
              <Text style={{ fontSize: 14, color: Colors.textMuted }}>Tap Log Session to record your first one</Text>
            </View>
          )
        )}
      />

      {activeChild && fundingYearId && (
        <AddSessionModal
          visible={showAdd}
          onClose={() => setShowAdd(false)}
          childId={activeChild.id}
          fundingYearId={fundingYearId}
          onSaved={fetchSessions}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  pageHeader:   { padding: 20, paddingBottom: 12 },
  pageTitle:    { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4, lineHeight: 20 },

  card:       { backgroundColor: Colors.surface, borderRadius: 20, padding: 16,
                shadowColor: Colors.purple, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  monthRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  monthLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  monthNav:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  monthArrow: { fontSize: 22, color: Colors.purple, fontWeight: '600', lineHeight: 26 },
  monthName:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  statsRow:       { flexDirection: 'row', gap: 0 },
  statBox:        { flex: 1, alignItems: 'center', gap: 4 },
  statIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statCaption:    { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.3 },
  statBig:        { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  statUnit:       { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  statDivider:    { width: 1, backgroundColor: Colors.border, marginVertical: 8 },

  addBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.purple,
                  borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, gap: 10 },
  addBtnCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center', justifyContent: 'center' },
  addBtnText:   { fontSize: 15, fontWeight: '700', color: '#FFFFFF', flex: 1, textAlign: 'center' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  row:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  rowIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#EDE9FE',
             alignItems: 'center', justifyContent: 'center' },
  rowName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rowSub:  { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  rowAmt:  { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
});

const m = StyleSheet.create({
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 paddingHorizontal: 20, paddingVertical: 14,
                 borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle:  { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  saveBtn:     { fontSize: 15, fontWeight: '700', color: Colors.purple },

  label: { fontSize: 12, fontWeight: '600', color: Colors.textMuted,
           textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 },
  input: { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14,
           paddingVertical: 12, fontSize: 15, color: Colors.textPrimary,
           borderWidth: 1, borderColor: Colors.border },

  toggle:        { flexDirection: 'row', backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 3 },
  toggleBtn:     { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  toggleBtnActive: { backgroundColor: Colors.surface, shadowColor: '#000',
                     shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08,
                     shadowRadius: 4, elevation: 2 },
  toggleTxt:     { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  toggleTxtActive: { color: Colors.textPrimary },

  totalPreview:    { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14,
                     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalPreviewLabel: { fontSize: 13, color: '#15803D', fontWeight: '600' },
  totalPreviewAmt:   { fontSize: 18, fontWeight: '800', color: '#15803D' },
});
