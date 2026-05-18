import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { format, parseISO } from 'date-fns';
import { Colors } from '@constants/colors';
import { supabase } from '@lib/supabase';
import type { Expense, Provider, ProviderCategory, ExpenseStatus, FundingYear } from '@lib/types';
import { useChild } from '@context/ChildContext';
import { useBudget } from '@hooks/useBudget';
import { useAuth } from '@context/AuthContext';
import { analyseReceipt, buildMileageProposal, AUTO_SELECT_THRESHOLD, SOUTHERN_RATE_PER_KM } from '@lib/mileageUtils';
import type { ReceiptAnalysis, MileageProposal } from '@lib/mileageUtils';
import { AddressAutocomplete } from '@components/AddressAutocomplete';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAD = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);

// SK government portal rejects filenames containing digits — strip them
function sanitizeReceiptFilename(name: string): string {
  const dotIdx = name.lastIndexOf('.');
  const ext    = dotIdx >= 0 ? name.slice(dotIdx).toLowerCase() : '';
  const base   = dotIdx >= 0 ? name.slice(0, dotIdx) : name;
  const clean  = base
    .replace(/[0-9]/g, '')          // strip all digits
    .replace(/[-_]{2,}/g, '_')      // collapse consecutive separators
    .replace(/^[-_]+|[-_]+$/g, '')  // trim leading/trailing separators
    || 'receipt';                    // fallback if entirely numeric
  return `${clean}${ext}`;
}

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

const STATUS_STYLE: Record<ExpenseStatus, { bg: string; text: string; label: string }> = {
  pending:   { bg: '#FFF7ED', text: '#C2410C', label: 'Pending'   },
  submitted: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Submitted' },
  approved:  { bg: '#F0FDF4', text: '#15803D', label: 'Approved'  },
  rejected:  { bg: '#FFF1F2', text: '#BE123C', label: 'Rejected'  },
};

const catEmoji = (cat: ProviderCategory) =>
  CATEGORY_CONFIG.find(c => c.value === cat)?.emoji ?? '📋';
const catLabel = (cat: ProviderCategory) =>
  CATEGORY_CONFIG.find(c => c.value === cat)?.label ?? cat;

// ─── BudgetBar ────────────────────────────────────────────────────────────────

function BudgetBar({
  totalBudget, totalSpent, totalPending, totalMileage, remaining, fundingYear,
}: {
  totalBudget: number; totalSpent: number; totalPending: number;
  totalMileage: number; remaining: number; fundingYear: FundingYear;
}) {
  const spentPct   = Math.min((totalSpent   / totalBudget) * 100, 100);
  const pendingPct = Math.min((totalPending / totalBudget) * 100, 100 - spentPct);
  const milagePct  = Math.min((totalMileage / totalBudget) * 100, 100 - spentPct - pendingPct);
  const usedTotal  = totalSpent + totalPending + totalMileage;

  return (
    <View style={s.budgetCard}>
      <View style={s.budgetTop}>
        <View>
          <Text style={s.budgetBig}>{CAD(usedTotal)}</Text>
          <Text style={s.budgetSub}>used of {CAD(totalBudget)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[s.budgetBig, { color: remaining > 0 ? Colors.green : Colors.purple }]}>
            {CAD(Math.max(remaining, 0))}
          </Text>
          <Text style={s.budgetSub}>remaining</Text>
        </View>
      </View>

      <View style={s.track}>
        <View style={[s.fill, { width: `${spentPct}%`, backgroundColor: Colors.purple }]} />
        <View style={[s.fill, { width: `${pendingPct}%`, backgroundColor: Colors.amber }]} />
        {milagePct > 0 && (
          <View style={[s.fill, { width: `${milagePct}%`, backgroundColor: Colors.teal }]} />
        )}
      </View>

      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.dot, { backgroundColor: Colors.purple }]} />
          <Text style={s.legendText}>Approved</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.dot, { backgroundColor: Colors.amber }]} />
          <Text style={s.legendText}>Pending</Text>
        </View>
        {milagePct > 0 && (
          <View style={s.legendItem}>
            <View style={[s.dot, { backgroundColor: Colors.teal }]} />
            <Text style={s.legendText}>Mileage</Text>
          </View>
        )}
        <Text style={[s.legendText, { marginLeft: 'auto' }]}>
          {fundingYear.label}
        </Text>
      </View>
    </View>
  );
}

// ─── PaceAlert ────────────────────────────────────────────────────────────────

function PaceAlert({ remaining, daysRemaining, totalBudget }: { remaining: number; daysRemaining: number; totalBudget: number }) {
  if (remaining <= 0) {
    return (
      <View style={[s.paceBox, { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' }]}>
        <Text style={[s.paceText, { color: '#15803D' }]}>
          🎉 Grant fully utilized — you're in an excellent position for next year's approval!
        </Text>
      </View>
    );
  }
  if (daysRemaining <= 0) return null;

  const weeksLeft    = daysRemaining / 7;
  const weeklyNeeded = remaining / weeksLeft;

  let bg = '#F0FDF4', border = '#86EFAC', color = '#15803D';
  let msg = `On track · spend ~${CAD(weeklyNeeded)}/week to fully utilize your grant`;

  if (weeklyNeeded > 400 || daysRemaining < 30) {
    bg = '#FFF1F2'; border = '#FECDD3'; color = '#BE123C';
    msg = `🚨 ${daysRemaining} days left — you need ${CAD(weeklyNeeded)}/week to reach ${CAD(totalBudget)}`;
  } else if (weeklyNeeded > 150 || daysRemaining < 90) {
    bg = '#FFFBEB'; border = '#FDE68A'; color = '#92400E';
    msg = `⚠️ ${daysRemaining} days left — aim for ${CAD(weeklyNeeded)}/week to fully utilize`;
  } else {
    msg = `✅ On track · aim for ~${CAD(weeklyNeeded)}/week to fully utilize your grant`;
  }

  return (
    <View style={[s.paceBox, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[s.paceText, { color }]}>{msg}</Text>
    </View>
  );
}

// ─── ExpenseRow ───────────────────────────────────────────────────────────────

function ExpenseRow({ expense, onPress }: { expense: Expense; onPress: () => void }) {
  const st         = STATUS_STYLE[expense.status];
  const hasReceipt = (expense.receipt_urls?.length ?? 0) > 0;
  const name       = (expense as any).providers?.name ?? catLabel(expense.category);

  return (
    <TouchableOpacity style={s.expRow} onPress={onPress} activeOpacity={0.75}>
      <View style={s.catBubble}>
        <Text style={{ fontSize: 20 }}>{catEmoji(expense.category)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.expName} numberOfLines={1}>{name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
          <Text style={s.expDate}>{format(parseISO(expense.expense_date), 'MMM d, yyyy')}</Text>
          {hasReceipt && <Text style={{ fontSize: 11, color: Colors.teal }}>📎 receipt</Text>}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={s.expAmount}>{CAD(expense.amount)}</Text>
        <View style={[s.statusPill, { backgroundColor: st.bg }]}>
          <Text style={[s.statusText, { color: st.text }]}>{st.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── QuickAddModal ────────────────────────────────────────────────────────────

function QuickAddModal({
  visible, onClose, childId, fundingYearId, currentRemaining, onSaved,
}: {
  visible: boolean; onClose: () => void;
  childId: string; fundingYearId: string; currentRemaining: number; onSaved: () => void;
}) {
  const { session, profile, refetchProfile } = useAuth();
  const [amount,          setAmount]          = useState('');
  const [category,        setCategory]        = useState<ProviderCategory>('speech_language');
  const [description,     setDescription]     = useState('');
  const [date,            setDate]            = useState(format(new Date(), 'yyyy-MM-dd'));
  const [receiptUri,      setReceiptUri]      = useState<string | null>(null);
  const [receiptMime,     setReceiptMime]     = useState('image/jpeg');
  const [receiptName,     setReceiptName]     = useState('receipt.jpg');
  const [providerQuery,   setProviderQuery]   = useState('');
  const [providerResults, setProviderResults] = useState<Provider[]>([]);
  const [selectedProvider,setSelectedProvider]= useState<Provider | null>(null);
  const [saving,          setSaving]          = useState(false);
  const [ocrLoading,      setOcrLoading]      = useState(false);
  const [ocrBizName,      setOcrBizName]      = useState<string | null>(null);
  const [providerMatches, setProviderMatches] = useState<ReceiptAnalysis['allMatches']>([]);
  const [mileageProposal, setMileageProposal] = useState<MileageProposal | null>(null);
  const [mileageLoading,  setMileageLoading]  = useState(false);
  const [includeMileage,  setIncludeMileage]  = useState(false);
  const [homeAddress,     setHomeAddress]     = useState(profile?.home_address ?? '');
  const [savingHome,      setSavingHome]      = useState(false);
  const amountRef  = useRef<TextInput>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setAmount(''); setDescription(''); setDate(format(new Date(), 'yyyy-MM-dd'));
      setReceiptUri(null); setProviderQuery(''); setSelectedProvider(null);
      setProviderResults([]); setSaving(false);
      setOcrLoading(false); setOcrBizName(null); setProviderMatches([]);
      setMileageProposal(null); setMileageLoading(false); setIncludeMileage(false);
      setHomeAddress(profile?.home_address ?? '');
      setTimeout(() => amountRef.current?.focus(), 350);
    }
  }, [visible]);

  const searchProviders = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setProviderResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('providers')
        .select('id, name, category, city, organization, address')
        .or(`name.ilike.%${q}%,organization.ilike.%${q}%`)
        .limit(8);
      setProviderResults((data ?? []) as Provider[]);
    }, 250);
  }, []);

  async function tryMileage(provider: Provider) {
    const parts = [profile?.home_address, profile?.home_city, profile?.home_postal_code].filter(Boolean);
    const addr  = parts.length > 0 ? parts.join(', ') : null;
    if (!addr) return;
    setMileageLoading(true);
    try {
      const proposal = await buildMileageProposal(addr, provider);
      if (proposal) {
        // Always save as round trip — SK ASD-IF mileage is claimed both ways
        setMileageProposal({
          ...proposal,
          distanceKm: Math.round(proposal.distanceKm * 2 * 10) / 10,
          amount:     Math.round(proposal.distanceKm * 2 * proposal.ratePerKm * 100) / 100,
        });
        setIncludeMileage(true);
      }
    } catch { /* geocoding failed silently */ } finally {
      setMileageLoading(false);
    }
  }

  async function handleReceiptCaptured(uri: string, mime: string, name?: string) {
    setReceiptUri(uri);
    setReceiptMime(mime);
    setReceiptName(sanitizeReceiptFilename(name ?? `receipt.${mime === 'application/pdf' ? 'pdf' : 'jpg'}`));
    if (mime === 'application/pdf') return;
    setOcrLoading(true);
    try {
      const analysis = await analyseReceipt(uri);
      setOcrBizName(analysis.ocrResult.businessName ?? null);
      setProviderMatches(analysis.allMatches);
      const top = analysis.topMatch;
      if (top && top.score >= AUTO_SELECT_THRESHOLD) {
        setSelectedProvider(top.provider);
        setCategory(top.provider.category);
        await tryMileage(top.provider);
      }
    } catch { /* OCR failed silently */ } finally {
      setOcrLoading(false);
    }
  }

  async function pickCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera access needed', 'Allow camera access in Settings.'); return;
    }
    const r = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: false });
    if (!r.canceled && r.assets[0]) {
      await handleReceiptCaptured(r.assets[0].uri, 'image/jpeg');
    }
  }

  async function pickGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Gallery access needed', 'Allow photo access in Settings.'); return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!r.canceled && r.assets[0]) {
      await handleReceiptCaptured(r.assets[0].uri, 'image/jpeg');
    }
  }

  async function pickFile() {
    try {
      const r = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (!r.canceled && r.assets[0]) {
        const a = r.assets[0];
        await handleReceiptCaptured(a.uri, a.mimeType ?? 'application/octet-stream', a.name ?? undefined);
      }
    } catch {
      Alert.alert('Error', 'Could not open file picker.');
    }
  }

  async function uploadReceipt(expenseId: string): Promise<string | null> {
    if (!receiptUri || !session) return null;
    try {
      const resp = await fetch(receiptUri);
      const blob = await resp.blob();
      const path = `${session.user.id}/${childId}/${expenseId}/${receiptName}`;
      const { data, error } = await supabase.storage
        .from('receipts').upload(path, blob, { contentType: receiptMime, upsert: true });
      if (error || !data) return null;
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(data.path);
      return urlData.publicUrl ?? null;
    } catch {
      return null;
    }
  }

  async function handleSave() {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!parsed || parsed <= 0) {
      Alert.alert('Amount required', 'Enter the expense amount.'); return;
    }
    if (!session) return;
    setSaving(true);
    try {
      const { data: row, error } = await supabase
        .from('expenses')
        .insert({
          child_id:        childId,
          funding_year_id: fundingYearId,
          provider_id:     selectedProvider?.id ?? null,
          category,
          amount:          parsed,
          description:     description.trim() || null,
          expense_date:    date,
          status:          'pending' as ExpenseStatus,
          receipt_urls:    [],
          logged_by:       session.user.id,
        })
        .select('id').single();

      if (error || !row) throw error;

      if (receiptUri) {
        const url = await uploadReceipt(row.id);
        if (url) await supabase.from('expenses').update({ receipt_urls: [url] }).eq('id', row.id);
      }

      if (includeMileage && mileageProposal) {
        await supabase.from('mileage_logs').insert({
          child_id:        childId,
          funding_year_id: fundingYearId,
          description:     `Round trip to ${mileageProposal.providerName}`,
          distance_km:     mileageProposal.distanceKm,
          rate_per_km:     mileageProposal.ratePerKm,
          trip_date:       date,
          is_round_trip:   true,
        });
      }

      const newRemaining = Math.max(currentRemaining - parsed, 0);
      onSaved();
      onClose();
      Alert.alert(
        '✅ Expense Logged',
        `${CAD(parsed)} has been added as pending.\n\nEstimated grant remaining: ${CAD(newRemaining)}`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Save failed', err?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
        {/* Header */}
        <View style={s.mHeader}>
          <Text style={s.mTitle}>Log Expense</Text>
          <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 16, color: Colors.purple, fontWeight: '500' }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.mBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Amount (primary field, top of form) ── */}
            <Text style={s.fieldLabel}>Amount *</Text>
            <View style={s.amountRow}>
              <Text style={s.amountSign}>$</Text>
              <TextInput
                ref={amountRef}
                style={s.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>

            {/* ── Receipt capture ── */}
            <Text style={[s.fieldLabel, { marginTop: 20 }]}>Receipt</Text>
            <View style={s.receiptRow}>
              <TouchableOpacity style={s.receiptBtn} onPress={pickCamera} activeOpacity={0.8}>
                <Text style={s.receiptIcon}>📷</Text>
                <Text style={s.receiptBtnLabel}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.receiptBtn} onPress={pickGallery} activeOpacity={0.8}>
                <Text style={s.receiptIcon}>🖼️</Text>
                <Text style={s.receiptBtnLabel}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.receiptBtn} onPress={pickFile} activeOpacity={0.8}>
                <Text style={s.receiptIcon}>📄</Text>
                <Text style={s.receiptBtnLabel}>File / PDF</Text>
              </TouchableOpacity>
            </View>

            {receiptUri && (
              <View style={s.previewWrap}>
                {receiptMime === 'application/pdf' ? (
                  <View style={s.pdfPreview}>
                    <Text style={{ fontSize: 28 }}>📄</Text>
                    <Text style={s.pdfName} numberOfLines={1}>{receiptName}</Text>
                  </View>
                ) : (
                  <Image source={{ uri: receiptUri }} style={s.previewImg} resizeMode="cover" />
                )}
                <TouchableOpacity style={s.clearBtn} onPress={() => setReceiptUri(null)}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── OCR status & mileage proposal ── */}
            {(ocrLoading || mileageLoading) && (
              <View style={s.ocrBanner}>
                <ActivityIndicator size="small" color={Colors.purple} />
                <Text style={s.ocrBannerText}>
                  {ocrLoading ? 'Reading receipt…' : 'Calculating mileage…'}
                </Text>
              </View>
            )}

            {ocrBizName && !ocrLoading && (
              <View style={s.ocrBanner}>
                <Text style={s.ocrBannerText}>
                  🔍 Found: <Text style={{ fontWeight: '700' }}>{ocrBizName}</Text>
                </Text>
              </View>
            )}

            {mileageProposal && !mileageLoading && (
              <View style={s.mileageCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.mileageTitle}>🚗 Auto-Mileage</Text>
                    <Text style={s.mileageSub}>
                      {mileageProposal.distanceKm} km round trip · {mileageProposal.isNorthern ? 'Northern' : 'Southern'} rate ${mileageProposal.ratePerKm.toFixed(4)}/km
                    </Text>
                    <Text style={s.mileageAmount}>{CAD(mileageProposal.amount)}</Text>
                  </View>
                  <TouchableOpacity
                    style={[s.mileageToggle, includeMileage && s.mileageToggleOn]}
                    onPress={() => setIncludeMileage(!includeMileage)}
                  >
                    <Text style={{ color: includeMileage ? '#fff' : Colors.textMuted, fontSize: 12, fontWeight: '600' }}>
                      {includeMileage ? 'Included ✓' : 'Include'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!profile?.home_city && !mileageProposal && selectedProvider && !mileageLoading && (
              <View style={s.homePrompt}>
                <Text style={s.homePromptText}>📍 Add your home address to auto-calculate mileage</Text>
                <AddressAutocomplete
                  value={homeAddress}
                  onChangeText={setHomeAddress}
                  placeholder="Start typing your address…"
                  onSelect={async suggestion => {
                    if (!session) return;
                    setSavingHome(true);
                    setHomeAddress(suggestion.street);
                    await supabase.from('profiles').update({
                      home_address:     suggestion.street,
                      home_city:        suggestion.city || null,
                      home_postal_code: suggestion.postal || null,
                    }).eq('id', session.user.id);
                    await refetchProfile();
                    setSavingHome(false);
                    await tryMileage(selectedProvider);
                  }}
                />
                {savingHome && <ActivityIndicator size="small" color={Colors.purple} style={{ marginTop: 6 }} />}
              </View>
            )}

            {/* ── Category ── */}
            <Text style={[s.fieldLabel, { marginTop: 20 }]}>Category *</Text>
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
              keyboardShouldPersistTaps="always"
            >
              {CATEGORY_CONFIG.map(cat => {
                const active = category === cat.value;
                return active ? (
                  <LinearGradient
                    key={cat.value}
                    colors={Colors.gradients.purple as unknown as string[]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.catActive}
                  >
                    <TouchableOpacity onPress={() => setCategory(cat.value)} activeOpacity={0.9}>
                      <Text style={s.catActiveText}>{cat.emoji} {cat.label}</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  <TouchableOpacity key={cat.value} style={s.cat} onPress={() => setCategory(cat.value)} activeOpacity={0.7}>
                    <Text style={s.catText}>{cat.emoji} {cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ── Provider (optional) ── */}
            <Text style={[s.fieldLabel, { marginTop: 20 }]}>Provider (optional)</Text>
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
                        onPress={() => { setSelectedProvider(p); setCategory(p.category); setProviderQuery(''); setProviderResults([]); tryMileage(p); }}
                      >
                        <Text style={s.dropName}>{p.name}</Text>
                        <Text style={s.dropSub}>{catEmoji(p.category)} {catLabel(p.category)} · {p.organization ?? p.city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* ── Date & Notes ── */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Date</Text>
                <TextInput
                  style={s.textField}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={s.fieldLabel}>Notes (optional)</Text>
                <TextInput
                  style={s.textField}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. session 12"
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* ── Save ── */}
            <TouchableOpacity style={{ marginTop: 28 }} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <LinearGradient
                colors={Colors.gradients.purple as unknown as string[]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.saveBtn}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.saveBtnText}>
                    Log Expense{parsedAmount > 0 ? `  ·  ${CAD(parsedAmount)}` : ''}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── ExpenseDetailModal ───────────────────────────────────────────────────────

function ExpenseDetailModal({
  expense, visible, onClose, onUpdated,
}: {
  expense: Expense | null; visible: boolean;
  onClose: () => void; onUpdated: () => void;
}) {
  const [refNum,   setRefNum]   = useState('');
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { if (visible) setRefNum(''); }, [visible]);

  if (!expense) return null;

  async function updateStatus(status: ExpenseStatus) {
    setSaving(true);
    const update: any = { status };
    if (status === 'submitted' && refNum.trim()) update.description = refNum.trim();
    await supabase.from('expenses').update(update).eq('id', expense!.id);
    setSaving(false);
    onUpdated(); onClose();
  }

  async function deleteExpense() {
    Alert.alert('Delete expense?', CAD(expense!.amount), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('expenses').delete().eq('id', expense!.id);
          onUpdated(); onClose();
        },
      },
    ]);
  }

  const st   = STATUS_STYLE[expense.status];
  const prov = (expense as any).providers;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
        <View style={s.mHeader}>
          <Text style={s.mTitle}>Expense Detail</Text>
          <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 16, color: Colors.purple, fontWeight: '500' }}>Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.mBody}>
          {/* Summary */}
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ fontSize: 44, fontWeight: '800', color: Colors.textPrimary }}>{CAD(expense.amount)}</Text>
            <Text style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 4 }}>
              {prov?.name ?? catLabel(expense.category)} · {format(parseISO(expense.expense_date), 'MMM d, yyyy')}
            </Text>
            <View style={[s.statusPill, { backgroundColor: st.bg, marginTop: 10, paddingHorizontal: 14, paddingVertical: 6 }]}>
              <Text style={[s.statusText, { color: st.text, fontSize: 13 }]}>{st.label}</Text>
            </View>
          </View>

          {expense.description && (
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Notes</Text>
              <Text style={s.detailValue}>{expense.description}</Text>
            </View>
          )}

          {/* Status actions */}
          <Text style={[s.fieldLabel, { marginTop: 20 }]}>Update Status</Text>

          {expense.status === 'pending' && (
            <>
              <TextInput
                style={[s.textField, { marginBottom: 10 }]}
                value={refNum}
                onChangeText={setRefNum}
                placeholder="Submission reference # (optional)"
                placeholderTextColor={Colors.textMuted}
              />
              <TouchableOpacity onPress={() => updateStatus('submitted')} disabled={saving} activeOpacity={0.85}>
                <LinearGradient colors={Colors.gradients.blue as unknown as string[]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtn}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Mark as Submitted</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {expense.status === 'submitted' && (
            <View style={{ gap: 10 }}>
              <TouchableOpacity onPress={() => updateStatus('approved')} disabled={saving} activeOpacity={0.85}>
                <LinearGradient colors={['#34D399', '#10B981'] as string[]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtn}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Mark as Approved ✓</Text>}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => updateStatus('rejected')} disabled={saving} activeOpacity={0.85} style={[s.saveBtn, { backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3' }]}>
                <Text style={{ color: '#BE123C', fontWeight: '700', fontSize: 16 }}>Mark as Rejected</Text>
              </TouchableOpacity>
            </View>
          )}

          {(expense.status === 'approved' || expense.status === 'rejected') && (
            <TouchableOpacity onPress={() => updateStatus('pending')} disabled={saving} activeOpacity={0.85} style={[s.saveBtn, { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border }]}>
              <Text style={{ color: Colors.textSecondary, fontWeight: '600', fontSize: 15 }}>Reset to Pending</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.deleteRowBtn} onPress={deleteExpense}>
            <Text style={s.deleteRowBtnText}>Delete Expense</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── MileageOnlyModal ─────────────────────────────────────────────────────────

function MileageOnlyModal({
  visible, onClose, childId, fundingYearId, onSaved,
}: {
  visible: boolean; onClose: () => void;
  childId: string; fundingYearId: string; onSaved: () => void;
}) {
  const { profile } = useAuth();
  const [date,            setDate]            = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes,           setNotes]           = useState('');
  const [providerQuery,   setProviderQuery]   = useState('');
  const [providerResults, setProviderResults] = useState<Provider[]>([]);
  const [selectedProvider,setSelectedProvider]= useState<Provider | null>(null);
  const [distanceKm,      setDistanceKm]      = useState('');
  const [ratePerKm,       setRatePerKm]       = useState('');
  const [isRoundTrip,     setIsRoundTrip]     = useState(false);
  const [calcLoading,     setCalcLoading]     = useState(false);
  const [isNorthern,      setIsNorthern]      = useState(false);
  const [saving,          setSaving]          = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setDate(format(new Date(), 'yyyy-MM-dd')); setNotes('');
      setProviderQuery(''); setSelectedProvider(null); setProviderResults([]);
      setDistanceKm(''); setRatePerKm(String(SOUTHERN_RATE_PER_KM)); setIsRoundTrip(false); setSaving(false);
    }
  }, [visible]);

  const searchProviders = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setProviderResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      const { data } = await supabase.from('providers').select('id,name,category,city,address').ilike('name', `%${q}%`).limit(6);
      setProviderResults((data ?? []) as Provider[]);
    }, 250);
  }, []);

  async function onProviderSelect(p: Provider) {
    setSelectedProvider(p); setProviderQuery(''); setProviderResults([]);
    const homeParts = [profile?.home_address, profile?.home_city, profile?.home_postal_code].filter(Boolean);
    if (homeParts.length > 0) {
      setCalcLoading(true);
      try {
        const proposal = await buildMileageProposal(homeParts.join(', '), p);
        if (proposal) {
          setDistanceKm(String(proposal.distanceKm));
          setRatePerKm(String(proposal.ratePerKm));
          setIsNorthern(proposal.isNorthern);
        }
      } catch {} finally { setCalcLoading(false); }
    }
  }

  async function handleSave() {
    const km   = parseFloat(distanceKm);
    const rate = parseFloat(ratePerKm);
    if (!km || km <= 0) { Alert.alert('Distance required', 'Enter distance in km.'); return; }
    if (!rate || rate <= 0) { Alert.alert('Rate required', 'Enter rate per km.'); return; }
    setSaving(true);
    try {
      const totalKm = isRoundTrip ? km * 2 : km;
      await supabase.from('mileage_logs').insert({
        child_id:        childId,
        funding_year_id: fundingYearId,
        description:     notes.trim() || (selectedProvider ? `Trip to ${selectedProvider.name}` : 'Mileage'),
        distance_km:     totalKm,
        rate_per_km:     rate,
        trip_date:       date,
        is_round_trip:   isRoundTrip,
      });
      onSaved(); onClose();
    } catch (err: any) {
      Alert.alert('Save failed', err?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const km    = parseFloat(distanceKm) || 0;
  const rate  = parseFloat(ratePerKm) || 0;
  const total = (isRoundTrip ? km * 2 : km) * rate;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
        <View style={s.mHeader}>
          <Text style={s.mTitle}>Log Mileage</Text>
          <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 16, color: Colors.purple, fontWeight: '500' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.mBody} keyboardShouldPersistTaps="handled">

            <Text style={s.fieldLabel}>Provider (optional)</Text>
            {selectedProvider ? (
              <View style={s.selectedProv}>
                <Text style={s.selectedProvText}>{selectedProvider.name}</Text>
                <TouchableOpacity onPress={() => { setSelectedProvider(null); setProviderQuery(''); setDistanceKm(''); setRatePerKm(''); }}>
                  <Text style={{ color: Colors.textMuted, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={s.searchBox}>
                  <Text style={{ fontSize: 14 }}>🔍</Text>
                  <TextInput style={s.searchInput} placeholder="Search providers…" placeholderTextColor={Colors.textMuted} value={providerQuery} onChangeText={q => { setProviderQuery(q); searchProviders(q); }} returnKeyType="search" autoCorrect={false} />
                </View>
                {providerResults.length > 0 && (
                  <View style={s.dropdown}>
                    {providerResults.map((p, i) => (
                      <TouchableOpacity key={p.id} style={[s.dropItem, i < providerResults.length - 1 && { borderBottomWidth: 1, borderColor: Colors.border }]} onPress={() => onProviderSelect(p)}>
                        <Text style={s.dropName}>{p.name}</Text>
                        <Text style={s.dropSub}>{catEmoji(p.category)} {catLabel(p.category)} · {p.organization ?? p.city}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {calcLoading && (
              <View style={s.ocrBanner}><ActivityIndicator size="small" color={Colors.teal} /><Text style={s.ocrBannerText}>Calculating distance…</Text></View>
            )}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Distance (km) *</Text>
                <TextInput style={s.textField} value={distanceKm} onChangeText={setDistanceKm} placeholder="0.0" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Rate / km *</Text>
                <TextInput style={s.textField} value={ratePerKm} onChangeText={setRatePerKm} placeholder="0.6410" placeholderTextColor={Colors.textMuted} keyboardType="decimal-pad" />
              </View>
            </View>
            {isNorthern && <Text style={{ fontSize: 11, color: Colors.teal, marginTop: 4 }}>🌲 Northern rate applied (north of 54°N)</Text>}

            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }} onPress={() => setIsRoundTrip(!isRoundTrip)} activeOpacity={0.7}>
              <View style={[s.checkbox, isRoundTrip && s.checkboxOn]}>
                {isRoundTrip && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
              </View>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, fontWeight: '500' }}>Round trip (doubles distance)</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Date</Text>
                <TextInput style={s.textField} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={s.fieldLabel}>Notes (optional)</Text>
                <TextInput style={s.textField} value={notes} onChangeText={setNotes} placeholder="e.g. ABA session" placeholderTextColor={Colors.textMuted} returnKeyType="done" />
              </View>
            </View>

            {total > 0 && (
              <View style={s.mileageCard}>
                <Text style={s.mileageAmount}>{CAD(total)}</Text>
                <Text style={s.mileageSub}>{isRoundTrip ? km * 2 : km} km × ${rate.toFixed(4)}/km</Text>
              </View>
            )}

            <TouchableOpacity style={{ marginTop: 24 }} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <LinearGradient colors={Colors.gradients.teal as unknown as string[]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtn}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>{total > 0 ? `Log Mileage · ${CAD(total)}` : 'Log Mileage'}</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type FilterType = 'all' | ExpenseStatus;

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'pending',   label: 'Pending'   },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved',  label: 'Approved'  },
  { value: 'rejected',  label: 'Rejected'  },
];

export default function ExpensesScreen() {
  const { activeChild }                         = useChild();
  const { summary, loading: bLoading, refetch: refetchBudget } = useBudget(activeChild?.id ?? null);
  const [expenses,     setExpenses]             = useState<Expense[]>([]);
  const [loadingExp,   setLoadingExp]           = useState(true);
  const [filter,       setFilter]               = useState<FilterType>('all');
  const [showAdd,      setShowAdd]              = useState(false);
  const [showMileage,  setShowMileage]          = useState(false);
  const [detailExpense,setDetailExpense]        = useState<Expense | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!activeChild || !summary.fundingYear) { setExpenses([]); setLoadingExp(false); return; }
    setLoadingExp(true);
    const { data } = await supabase
      .from('expenses')
      .select('*, providers(name, category)')
      .eq('child_id', activeChild.id)
      .eq('funding_year_id', summary.fundingYear.id)
      .order('expense_date', { ascending: false });
    setExpenses((data ?? []) as Expense[]);
    setLoadingExp(false);
  }, [activeChild, summary.fundingYear]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.status === filter);

  const handleSaved = useCallback(() => { refetchBudget(); fetchExpenses(); }, [refetchBudget, fetchExpenses]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={() => (
          <View style={{ gap: 10 }}>
            {/* Page title */}
            <View style={s.header}>
              <Text style={s.headerTitle}>Expenses</Text>
              {activeChild && <Text style={s.headerSub}>{activeChild.name}</Text>}
            </View>

            {/* Budget bar */}
            {!bLoading && summary.fundingYear && (
              <BudgetBar
                totalBudget={summary.totalBudget}
                totalSpent={summary.totalSpent}
                totalPending={summary.totalPending}
                totalMileage={summary.totalMileage}
                remaining={summary.remaining}
                fundingYear={summary.fundingYear}
              />
            )}

            {/* No funding year message */}
            {!bLoading && !summary.fundingYear && (
              <View style={[s.budgetCard, { alignItems: 'center', paddingVertical: 28 }]}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📅</Text>
                <Text style={{ fontWeight: '700', color: Colors.textPrimary, fontSize: 16 }}>
                  No active funding year
                </Text>
                <Text style={{ color: Colors.textMuted, fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                  Add a funding year for {activeChild?.name ?? 'this child'} to start logging expenses
                </Text>
              </View>
            )}

            {/* Pace / utilization alert */}
            {!bLoading && summary.fundingYear && (
              <PaceAlert remaining={summary.remaining} daysRemaining={summary.daysRemaining} totalBudget={summary.totalBudget} />
            )}

            {/* Filter chips */}
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
              keyboardShouldPersistTaps="always"
            >
              {FILTERS.map(f => {
                const active = filter === f.value;
                return active ? (
                  <LinearGradient
                    key={f.value}
                    colors={Colors.gradients.purple as unknown as string[]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.filterActive}
                  >
                    <TouchableOpacity onPress={() => setFilter(f.value)} activeOpacity={0.9}>
                      <Text style={s.filterActiveText}>{f.label}</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                ) : (
                  <TouchableOpacity key={f.value} style={s.filter} onPress={() => setFilter(f.value)} activeOpacity={0.7}>
                    <Text style={s.filterText}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {!loadingExp && (
              <Text style={s.countText}>
                {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
                {filter !== 'all' ? ` · ${filter}` : ''}
              </Text>
            )}
          </View>
        )}
        renderItem={({ item }) => <ExpenseRow expense={item} onPress={() => setDetailExpense(item)} />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 56 }} />}
        ListEmptyComponent={() =>
          loadingExp ? (
            <ActivityIndicator color={Colors.purple} style={{ marginTop: 40 }} />
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 40, gap: 8 }}>
              <Text style={{ fontSize: 40 }}>🧾</Text>
              <Text style={{ fontWeight: '600', color: Colors.textPrimary, fontSize: 16 }}>No expenses yet</Text>
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>Tap + to log your first expense</Text>
            </View>
          )
        }
      />

      {/* FABs — always visible; alert if no funding year */}
      <View style={s.fabStack}>
        <TouchableOpacity
          style={s.fabMileageWrap}
          onPress={() => {
            if (!summary.fundingYear) {
              Alert.alert('No Active Funding Year', 'Set up a funding year for this child in the Profile tab before logging mileage.');
              return;
            }
            setShowMileage(true);
          }}
          activeOpacity={0.85}
        >
          <LinearGradient colors={Colors.gradients.teal as unknown as string[]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fabSmall}>
            <Text style={{ fontSize: 18 }}>🚗</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.fabWrap}
          onPress={() => {
            if (!summary.fundingYear) {
              Alert.alert('No Active Funding Year', 'Set up a funding year for this child in the Profile tab before logging expenses.');
              return;
            }
            setShowAdd(true);
          }}
          activeOpacity={0.85}
        >
          <LinearGradient colors={Colors.gradients.purple as unknown as string[]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fab}>
            <Text style={s.fabPlus}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {summary.fundingYear && (
        <>
          <QuickAddModal
            visible={showAdd}
            onClose={() => setShowAdd(false)}
            childId={activeChild?.id ?? ''}
            fundingYearId={summary.fundingYear.id}
            currentRemaining={summary.remaining}
            onSaved={handleSaved}
          />
          <MileageOnlyModal
            visible={showMileage}
            onClose={() => setShowMileage(false)}
            childId={activeChild?.id ?? ''}
            fundingYearId={summary.fundingYear.id}
            onSaved={handleSaved}
          />
        </>
      )}

      <ExpenseDetailModal
        expense={detailExpense}
        visible={!!detailExpense}
        onClose={() => setDetailExpense(null)}
        onUpdated={handleSaved}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  headerSub:   { fontSize: 14, color: Colors.textMuted },
  listContent: { paddingHorizontal: 16, paddingBottom: 110, gap: 0, paddingTop: 8 },

  // Budget card
  budgetCard: {
    backgroundColor: Colors.surface, borderRadius: 18,
    padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetBig: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  budgetSub: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  track:     { height: 10, backgroundColor: Colors.border, borderRadius: 6, flexDirection: 'row', overflow: 'hidden' },
  fill:      { height: '100%' },
  legend:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legendItem:{ flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  legendText:{ fontSize: 12, color: Colors.textSecondary },

  // Pace alert
  paceBox:  { borderRadius: 12, borderWidth: 1, padding: 12 },
  paceText: { fontSize: 13, fontWeight: '500' },

  // Filters
  filter:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  filterText:      { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  filterActive:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  filterActiveText:{ fontSize: 13, color: '#fff', fontWeight: '600' },
  countText:       { fontSize: 12, color: Colors.textMuted, paddingHorizontal: 2 },

  // Expense row
  expRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  catBubble: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  expName:   { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  expDate:   { fontSize: 12, color: Colors.textMuted },
  expAmount: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  statusPill:{ marginTop: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText:{ fontSize: 10, fontWeight: '600' },

  // FABs
  fabStack:     { position: 'absolute', bottom: 28, right: 20, alignItems: 'center', gap: 12 },
  fabWrap:      { shadowColor: Colors.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  fabMileageWrap:{ shadowColor: Colors.teal, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  fab:          { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  fabSmall:     { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  fabPlus:      { fontSize: 30, color: '#fff', fontWeight: '300', marginTop: -1 },

  // Expense detail
  detailRow:      { backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, marginTop: 10 },
  detailLabel:    { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  detailValue:    { fontSize: 14, color: Colors.textPrimary, marginTop: 4 },
  deleteRowBtn:   { marginTop: 20, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#FECDD3', alignItems: 'center' },
  deleteRowBtnText:{ color: '#BE123C', fontWeight: '600', fontSize: 14 },

  // Mileage-only
  checkbox:    { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn:  { backgroundColor: Colors.purple, borderColor: Colors.purple },

  // Modal
  mHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: Colors.border,
  },
  mTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  mBody:  { padding: 20, paddingBottom: 48 },

  // Amount
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.purple,
    borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6, gap: 4,
  },
  amountSign: { fontSize: 28, color: Colors.textMuted, fontWeight: '300' },
  amountInput:{ flex: 1, fontSize: 36, fontWeight: '700', color: Colors.textPrimary, padding: 0 },

  // Receipt
  receiptRow:    { flexDirection: 'row', gap: 10 },
  receiptBtn:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 14, backgroundColor: Colors.surfaceAlt, borderWidth: 1.5, borderColor: Colors.border, gap: 6 },
  receiptIcon:   { fontSize: 26 },
  receiptBtnLabel: { fontSize: 12, color: Colors.purple, fontWeight: '600' },
  previewWrap:   { marginTop: 10, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  previewImg:    { width: '100%', height: 180 },
  pdfPreview:    { height: 72, backgroundColor: Colors.surfaceAlt, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  pdfName:       { flex: 1, fontSize: 13, color: Colors.textSecondary },
  clearBtn:      { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },

  // Category chips
  cat:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  catText:      { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catActive:    { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20 },
  catActiveText:{ fontSize: 13, color: '#fff', fontWeight: '600' },

  // Provider search
  searchBox:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 4, gap: 8 },
  searchInput:  { flex: 1, fontSize: 15, color: Colors.textPrimary },
  dropdown:     { marginTop: 4, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  dropItem:     { padding: 12 },
  dropName:     { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  dropSub:      { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  selectedProv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  selectedProvText: { fontSize: 15, fontWeight: '600', color: Colors.purple },

  // Text field
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  textField:  { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, color: Colors.textPrimary },

  // Save button
  saveBtn:    { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnText:{ fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  // OCR banner
  ocrBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: Colors.surfaceAlt, borderRadius: 10, padding: 10 },
  ocrBannerText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },

  // Mileage proposal card
  mileageCard:     { marginTop: 10, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#86EFAC' },
  mileageTitle:    { fontSize: 14, fontWeight: '700', color: '#15803D' },
  mileageSub:      { fontSize: 12, color: '#166534', marginTop: 2 },
  mileageAmount:   { fontSize: 18, fontWeight: '700', color: '#15803D', marginTop: 4 },
  mileageToggle:   { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  mileageToggleOn: { backgroundColor: Colors.purple, borderColor: Colors.purple },

  // Home address prompt
  homePrompt:     { marginTop: 10, backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FDE68A' },
  homePromptText: { fontSize: 13, color: '#92400E', fontWeight: '500' },
});
