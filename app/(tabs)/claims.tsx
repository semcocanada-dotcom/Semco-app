import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { Colors } from '@constants/colors';
import { db } from '@lib/supabase';
import { useChild } from '@context/ChildContext';
import { useAuth } from '@context/AuthContext';
import type { Expense, MileageLog, MonthlyClaim, FundingYear, Provider } from '@lib/types';
import {
  generateAndShareExpenseWorksheetPdf,
  generateAndShareMileageWorksheetPdf,
} from '@lib/pdfForms';

const OFFICIAL_ASD_IF_EXPENSE_PORTAL = 'https://autismfunding.saskatchewan.ca/';

const CATEGORY_LABELS: Record<string, string> = {
  aba_ibi: 'ABA/IBI',
  speech_language: 'Speech-Language',
  occupational_therapy: 'Occupational Therapy',
  physical_therapy: 'Physical Therapy',
  psychology: 'Psychology',
  respite: 'Respite',
  swimming: 'Swimming',
  social_skills: 'Social Skills',
  music_therapy: 'Music Therapy',
  art_therapy: 'Art Therapy',
  assistive_technology: 'Assistive Technology',
  other: 'Other',
};

type ExpenseWithProvider = Expense & { providers?: Pick<Provider, 'name'> | null };

interface MonthGroup {
  month: string;
  monthLabel: string;
  expenses: ExpenseWithProvider[];
  mileage: MileageLog[];
  total: number;
  claim: MonthlyClaim | null;
}

export default function ClaimsScreen() {
  const { activeChild } = useChild();
  const { session, profile } = useAuth();

  const [fundingYear, setFundingYear] = useState<FundingYear | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithProvider[]>([]);
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
  const [claims, setClaims] = useState<MonthlyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<MonthGroup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const fetchData = useCallback(async () => {
    if (!activeChild) {
      setLoading(false);
      return;
    }

    const { data: yearData } = await db.fundingYears()
      .select('*')
      .eq('child_id', activeChild.id)
      .eq('is_active', true)
      .single();

    const fy = yearData as FundingYear | null;
    setFundingYear(fy);

    if (!fy) {
      setLoading(false);
      return;
    }

    const [expRes, milRes, claimRes] = await Promise.all([
      db.expenses()
        .select('*, providers(name)')
        .eq('child_id', activeChild.id)
        .eq('funding_year_id', fy.id)
        .order('expense_date', { ascending: true }),
      db.mileageLogs()
        .select('*')
        .eq('child_id', activeChild.id)
        .eq('funding_year_id', fy.id)
        .order('trip_date', { ascending: true }),
      db.monthlyClaims()
        .select('*')
        .eq('child_id', activeChild.id)
        .eq('funding_year_id', fy.id),
    ]);

    setExpenses((expRes.data ?? []) as ExpenseWithProvider[]);
    setMileageLogs((milRes.data ?? []) as MileageLog[]);
    setClaims((claimRes.data ?? []) as MonthlyClaim[]);
    setLoading(false);
  }, [activeChild]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const monthGroups = useMemo((): MonthGroup[] => {
    const map = new Map<string, MonthGroup>();

    expenses.forEach((e) => {
      const m = e.expense_date.slice(0, 7);
      if (!map.has(m)) {
        map.set(m, {
          month: m,
          monthLabel: format(parseISO(`${m}-01`), 'MMMM yyyy'),
          expenses: [],
          mileage: [],
          total: 0,
          claim: null,
        });
      }
      const g = map.get(m)!;
      g.expenses.push(e);
      g.total += Number(e.amount);
    });

    mileageLogs.forEach((ml) => {
      const m = ml.trip_date.slice(0, 7);
      if (!map.has(m)) {
        map.set(m, {
          month: m,
          monthLabel: format(parseISO(`${m}-01`), 'MMMM yyyy'),
          expenses: [],
          mileage: [],
          total: 0,
          claim: null,
        });
      }
      const g = map.get(m)!;
      g.mileage.push(ml);
      g.total += Number(ml.reimbursement_amount);
    });

    claims.forEach((c) => {
      const g = map.get(c.month);
      if (g) g.claim = c;
    });

    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
  }, [expenses, mileageLogs, claims]);

  function handleSubmit(_group: MonthGroup) {
    Alert.alert(
      'Continue on the Saskatchewan government website',
      'Autism Fund Tracker is an independent app and does not submit claims for the Government of Saskatchewan. The government ASD-IF expense portal will open so you can complete any required submission there. Generate and save any worksheets you need before continuing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Government Portal',
          onPress: async () => {
            setSubmitting(true);
            try {
              await Linking.openURL(OFFICIAL_ASD_IF_EXPENSE_PORTAL);
            } catch {
              Alert.alert(
                'Could not open portal',
                `Visit ${OFFICIAL_ASD_IF_EXPENSE_PORTAL} in your browser.`,
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  }

  function openGroup(group: MonthGroup) {
    setJustSubmitted(false);
    setSelectedGroup(group);
  }

  function closeModal() {
    setSelectedGroup(null);
    setJustSubmitted(false);
  }

  async function saveBatchNumber(claimId: string, value: string) {
    const trimmed = value.trim() || null;
    await db.monthlyClaims().update({ batch_number: trimmed }).eq('id', claimId);
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, batch_number: trimmed } : c));
  }

  function renderRow({ item }: { item: MonthGroup }) {
    const isSubmitted = !!item.claim;
    const count = item.expenses.length + item.mileage.length;
    return (
      <TouchableOpacity style={s.row} onPress={() => openGroup(item)} activeOpacity={0.7}>
        <View style={s.rowLeft}>
          <Text style={s.rowIcon}>{isSubmitted ? '✅' : '📋'}</Text>
          <View>
            <Text style={s.rowMonth}>{item.monthLabel}</Text>
            <Text style={s.rowMeta}>
              {count} {count === 1 ? 'item' : 'items'}
              {isSubmitted && item.claim?.submitted_at
                ? ` · Submitted ${format(parseISO(item.claim.submitted_at), 'MMM d')}`
                : ' · Ready to submit'}
            </Text>
          </View>
        </View>
        <View style={s.rowRight}>
          <Text style={s.rowAmount}>${item.total.toFixed(2)}</Text>
          {!isSubmitted && <Text style={s.chevron}>›</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.center}>
          <ActivityIndicator color={Colors.purple} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Monthly Claims</Text>
        {activeChild && <Text style={s.subtitle}>{activeChild.name}</Text>}
      </View>

      {!activeChild ? (
        <View style={s.center}>
          <Text style={s.emptyIcon}>👶</Text>
          <Text style={s.emptyTitle}>No child selected</Text>
          <Text style={s.emptyBody}>Add a child on the Home screen to get started.</Text>
        </View>
      ) : !fundingYear ? (
        <View style={s.center}>
          <Text style={s.emptyIcon}>📅</Text>
          <Text style={s.emptyTitle}>No active funding year</Text>
          <Text style={s.emptyBody}>Set up a funding year in the Expenses tab first.</Text>
        </View>
      ) : monthGroups.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyTitle}>No expenses yet</Text>
          <Text style={s.emptyBody}>
            Add expenses in the Expenses tab and they'll appear here as monthly claims ready to submit.
          </Text>
        </View>
      ) : (
        <FlatList
          data={monthGroups}
          keyExtractor={(item) => item.month}
          renderItem={renderRow}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purple} />
          }
          ItemSeparatorComponent={() => <View style={s.separator} />}
        />
      )}

      <Modal
        visible={!!selectedGroup}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        {selectedGroup && (
          <ClaimDetail
            group={selectedGroup}
            onClose={closeModal}
            onSubmit={() => handleSubmit(selectedGroup)}
            submitting={submitting}
            justSubmitted={justSubmitted}
            childName={activeChild?.name ?? ''}
            healthServicesNumber={activeChild?.health_card_number ?? null}
            parentName={profile?.full_name ?? ''}
            parentEmail={session?.user.email ?? ''}
            onSaveBatchNumber={saveBatchNumber}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

interface ClaimDetailProps {
  group: MonthGroup;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  justSubmitted: boolean;
  childName: string;
  healthServicesNumber: string | null;
  parentName: string;
  parentEmail: string;
  onSaveBatchNumber: (claimId: string, value: string) => Promise<void>;
}

function ClaimDetail({
  group, onClose, onSubmit, submitting, justSubmitted,
  childName, healthServicesNumber, parentName, parentEmail,
  onSaveBatchNumber,
}: ClaimDetailProps) {
  const isSubmitted = !!group.claim || justSubmitted;
  const [generatingPdf,        setGeneratingPdf]        = useState(false);
  const [generatingExpensePdf, setGeneratingExpensePdf] = useState(false);
  const [batchInput, setBatchInput] = useState(group.claim?.batch_number ?? '');
  const router = useRouter();

  async function handleGenerateExpensePdf() {
    if (group.expenses.length === 0) {
      Alert.alert('No Expenses', 'This month has no expenses to include in the worksheet.');
      return;
    }
    setGeneratingExpensePdf(true);
    try {
      await generateAndShareExpenseWorksheetPdf({
        childName,
        healthServicesNumber,
        parentName,
        parentEmail,
        monthLabel: group.monthLabel,
        rows: group.expenses.map(e => ({
          expense_date:   e.expense_date,
          category_label: CATEGORY_LABELS[e.category] ?? e.category,
          provider_name:  e.providers?.name ?? null,
          description:    e.description ?? null,
          amount:         Number(e.amount),
        })),
        total: group.expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      });
    } catch {
      Alert.alert('PDF Error', 'Could not generate the PDF. Please try again.');
    } finally {
      setGeneratingExpensePdf(false);
    }
  }

  async function handleGeneratePdf() {
    if (group.mileage.length === 0) {
      Alert.alert('No Mileage', 'This month has no mileage entries to include in the worksheet.');
      return;
    }
    setGeneratingPdf(true);
    try {
      await generateAndShareMileageWorksheetPdf({
        childName,
        healthServicesNumber,
        parentName,
        parentEmail,
        monthLabel: group.monthLabel,
        rows: group.mileage,
        total: group.mileage.reduce((sum, m) => sum + Number(m.reimbursement_amount), 0),
      });
    } catch {
      Alert.alert('PDF Error', 'Could not generate the PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  }

  return (
    <View style={s.modal}>
      <View style={s.modalHeader}>
        <Text style={s.modalTitle}>{group.monthLabel}</Text>
        <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.modalScroll} contentContainerStyle={s.modalScrollContent}>
        {group.expenses.length > 0 && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionLabel}>Expenses</Text>
              <TouchableOpacity
                style={s.pdfBtn}
                onPress={handleGenerateExpensePdf}
                disabled={generatingExpensePdf}
                activeOpacity={0.7}
              >
                {generatingExpensePdf
                  ? <ActivityIndicator size="small" color={Colors.purple} />
                  : <Text style={s.pdfBtnText}>📄 Expense Worksheet</Text>
                }
              </TouchableOpacity>
            </View>
            {group.expenses.map((e) => (
              <View key={e.id} style={s.lineItem}>
                <View style={s.lineItemLeft}>
                  <Text style={s.lineItemDate}>{format(parseISO(e.expense_date), 'MMM d')}</Text>
                  <View style={s.lineItemDetails}>
                    <Text style={s.lineItemPrimary}>
                      {e.providers?.name ?? CATEGORY_LABELS[e.category] ?? e.category}
                    </Text>
                    {e.description ? (
                      <Text style={s.lineItemSecondary}>{e.description}</Text>
                    ) : null}
                  </View>
                </View>
                <Text style={s.lineItemAmount}>${Number(e.amount).toFixed(2)}</Text>
              </View>
            ))}
          </>
        )}

        {group.mileage.length > 0 && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionLabel}>Mileage</Text>
              <TouchableOpacity
                style={s.pdfBtn}
                onPress={handleGeneratePdf}
                disabled={generatingPdf}
                activeOpacity={0.7}
              >
                {generatingPdf
                  ? <ActivityIndicator size="small" color={Colors.purple} />
                  : <Text style={s.pdfBtnText}>📄 Mileage Worksheet</Text>
                }
              </TouchableOpacity>
            </View>
            {group.mileage.map((m) => (
              <View key={m.id} style={s.lineItem}>
                <View style={s.lineItemLeft}>
                  <Text style={s.lineItemDate}>{format(parseISO(m.trip_date), 'MMM d')}</Text>
                  <View style={s.lineItemDetails}>
                    <Text style={s.lineItemPrimary}>
                      {m.distance_km} km @ ${Number(m.rate_per_km).toFixed(4)}/km
                    </Text>
                    {m.description ? (
                      <Text style={s.lineItemSecondary}>{m.description}</Text>
                    ) : null}
                  </View>
                </View>
                <Text style={s.lineItemAmount}>${Number(m.reimbursement_amount).toFixed(2)}</Text>
              </View>
            ))}
          </>
        )}

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total Claim</Text>
          <Text style={s.totalAmount}>${group.total.toFixed(2)}</Text>
        </View>

        {isSubmitted && (
          <>
            <View style={s.successBanner}>
              <Text style={s.successIcon}>✅</Text>
              <Text style={s.successText}>
                {justSubmitted
                  ? 'This month is marked as submitted in your records.'
                  : `Submitted ${group.claim?.submitted_at
                      ? format(parseISO(group.claim.submitted_at), 'MMMM d, yyyy')
                      : ''}`}
              </Text>
            </View>
            {group.claim && (
              <View style={s.batchRow}>
                <Text style={s.batchLabel}>Exp Batch #</Text>
                <TextInput
                  style={s.batchInput}
                  value={batchInput}
                  onChangeText={setBatchInput}
                  onBlur={() => onSaveBatchNumber(group.claim!.id, batchInput)}
                  placeholder="000___"
                  placeholderTextColor="#aaa"
                  autoCapitalize="none"
                  returnKeyType="done"
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={s.modalFooter}>
        {!isSubmitted && (
          <>
            <TouchableOpacity
              style={[s.submitBtn, submitting && s.submitBtnDisabled]}
              onPress={onSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitBtnText}>Open Government Portal</Text>
              )}
            </TouchableOpacity>
            <Text style={s.submitNote}>
              Opens autismfunding.saskatchewan.ca. Autism Fund Tracker is independent and is not affiliated with the Government of Saskatchewan.
            </Text>
          </>
        )}
        <TouchableOpacity
          style={s.addExpenseBtn}
          onPress={() => { onClose(); router.navigate('/(tabs)/expenses'); }}
          activeOpacity={0.7}
        >
          <Text style={s.addExpenseBtnText}>+ Add Expense or Mileage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginTop: 2 },

  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 4 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIcon: { fontSize: 26 },
  rowMonth: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  rowMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowAmount: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  chevron: { fontSize: 22, color: Colors.textMuted },

  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  emptyBody: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  // Modal
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: Colors.textSecondary },

  modalScroll: { flex: 1 },
  modalScrollContent: { padding: 20, paddingBottom: 40 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pdfBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.purple,
  },

  lineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lineItemLeft: { flexDirection: 'row', gap: 10, flex: 1, marginRight: 12 },
  lineItemDate: { fontSize: 13, color: Colors.textMuted, width: 44, marginTop: 2 },
  lineItemDetails: { flex: 1 },
  lineItemPrimary: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  lineItemSecondary: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  lineItemAmount: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  totalAmount: { fontSize: 22, fontWeight: '800', color: Colors.purple },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successIcon: { fontSize: 22 },
  successText: { flex: 1, fontSize: 15, color: '#065F46', lineHeight: 22 },

  batchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  batchLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, minWidth: 80 },
  batchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary, paddingVertical: 0 },

  modalFooter: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  submitBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  submitNote: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
  addExpenseBtn: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.purple,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addExpenseBtnText: { fontSize: 15, color: Colors.purple, fontWeight: '600' },
});
