import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput,
  StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { differenceInYears, parseISO, isValid } from 'date-fns';
import { Colors } from '@constants/colors';
import { supabase } from '@lib/supabase';
import { useAuth } from '@context/AuthContext';
import { useChildren } from '@hooks/useChildren';
import type { Child, FundingYear } from '@lib/types';
import { AddressAutocomplete } from '@components/AddressAutocomplete';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAD = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);

// Auto-formats digits as YYYY/MM/DD as user types
function autoFormatDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}

// YYYY/MM/DD → YYYY-MM-DD for DB storage
function dateDisplayToISO(display: string): string | null {
  const digits = display.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

// YYYY-MM-DD → YYYY/MM/DD for display
function isoToDateDisplay(iso: string | null | undefined): string {
  if (!iso) return '';
  return iso.replace(/-/g, '/');
}

// SK ASD-IF tiered amounts: <6 → $8,000 | 6–11 → $6,000 | 12+ → ineligible
function calcASDIFAmount(dobISO: string | null, atISO?: string): number {
  if (!dobISO) return 8000;
  try {
    const dob = parseISO(dobISO);
    const ref = atISO ? parseISO(atISO) : new Date();
    const age = differenceInYears(ref, dob);
    if (age < 6) return 8000;
    if (age < 12) return 6000;
    return 0;
  } catch {
    return 8000;
  }
}

// Returns eligibility info string from a YYYY/MM/DD display value
function grantEligibilityText(dobDisplay: string): string | null {
  const iso = dateDisplayToISO(dobDisplay);
  if (!iso) return null;
  try {
    const dob = parseISO(iso);
    if (!isValid(dob)) return null;
    const age = differenceInYears(new Date(), dob);
    if (age < 0 || age > 25) return null;
    if (age < 2) return `${age} year${age !== 1 ? 's' : ''} old · ASD-IF eligibility requires an ASD diagnosis`;
    if (age < 6) return `${age} years old · $8,000/year ASD-IF (under 6 tier)`;
    if (age < 12) return `${age} years old · $6,000/year ASD-IF (ages 6–11 tier)`;
    if (age < 18) return `${age} years old · ASD-IF childhood funding ends at age 12 — check Saskatchewan.ca for other programs`;
    return `${age} years old · ASD-IF program is for children under 12`;
  } catch {
    return null;
  }
}

// ─── ChildModal ───────────────────────────────────────────────────────────────

function ChildModal({
  visible, child, onClose, onSaved,
}: {
  visible: boolean;
  child: Child | null; // null = add new
  onClose: () => void;
  onSaved: () => void;
}) {
  const { session } = useAuth();
  const [name,        setName]        = useState('');
  const [dob,         setDob]         = useState('');
  const [healthCard,  setHealthCard]  = useState('');
  const [diagDate,    setDiagDate]    = useState('');
  const [diagNotes,   setDiagNotes]   = useState('');
  const [fundingYears,setFundingYears]= useState<FundingYear[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [showAddYear, setShowAddYear] = useState(false);

  // Funding year form
  const [fyLabel,  setFyLabel]  = useState('');
  const [fyStart,  setFyStart]  = useState('');
  const [fyEnd,    setFyEnd]    = useState('');
  const [fyBudget, setFyBudget] = useState('8000');
  const [fyActive, setFyActive] = useState(true);
  const [savingFY, setSavingFY] = useState(false);

  // Auto-recalculate suggested budget when start date changes
  useEffect(() => {
    if (!child?.date_of_birth || !fyStart) return;
    const startISO = dateDisplayToISO(fyStart);
    if (!startISO) return;
    const suggested = calcASDIFAmount(child.date_of_birth, startISO);
    setFyBudget(String(suggested));
  }, [fyStart, child?.date_of_birth]);

  useEffect(() => {
    if (!visible) return;
    setName(child?.name ?? '');
    setDob(isoToDateDisplay(child?.date_of_birth));
    setHealthCard(child?.health_card_number ?? '');
    setDiagDate(isoToDateDisplay(child?.diagnosis_date));
    setDiagNotes(child?.diagnosis_notes ?? '');
    setShowAddYear(false);
    if (child) fetchFundingYears(child.id);
    else setFundingYears([]);
  }, [visible, child]);

  async function fetchFundingYears(childId: string) {
    const { data } = await supabase
      .from('funding_years')
      .select('*')
      .eq('child_id', childId)
      .order('start_date', { ascending: false });
    setFundingYears((data ?? []) as FundingYear[]);
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    if (!session) return;
    setSaving(true);
    try {
      const dobISO = dateDisplayToISO(dob);
      const diagDateISO = dateDisplayToISO(diagDate);
      if (child) {
        await supabase.from('children').update({
          name: name.trim(),
          date_of_birth: dobISO,
          health_card_number: healthCard || null,
          diagnosis_date: diagDateISO,
          diagnosis_notes: diagNotes || null,
        }).eq('id', child.id);
      } else {
        await supabase.from('children').insert({
          parent_id: session.user.id,
          name: name.trim(),
          date_of_birth: dobISO,
          health_card_number: healthCard || null,
          diagnosis_date: diagDateISO,
          diagnosis_notes: diagNotes || null,
        });
      }
      onSaved(); onClose();
    } catch (err: any) {
      Alert.alert('Save failed', err?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteChild() {
    if (!child) return;
    Alert.alert('Delete child?', `This will delete ${child.name} and all their data. This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('children').delete().eq('id', child.id);
          onSaved(); onClose();
        },
      },
    ]);
  }

  async function handleAddFundingYear() {
    const startISO = dateDisplayToISO(fyStart);
    const endISO   = dateDisplayToISO(fyEnd);
    if (!child || !fyLabel.trim() || !startISO || !endISO) {
      Alert.alert('Fill in all funding year fields', 'Use YYYY/MM/DD format for dates.');
      return;
    }
    setSavingFY(true);
    try {
      if (fyActive) {
        await supabase.from('funding_years').update({ is_active: false }).eq('child_id', child.id);
      }
      await supabase.from('funding_years').insert({
        child_id:     child.id,
        label:        fyLabel.trim(),
        total_budget: parseFloat(fyBudget) || 8000,
        start_date:   startISO,
        end_date:     endISO,
        is_active:    fyActive,
      });
      setFyLabel(''); setFyStart(''); setFyEnd(''); setFyBudget('8000'); setFyActive(true);
      setShowAddYear(false);
      fetchFundingYears(child.id);
    } catch (err: any) {
      Alert.alert('Save failed', err?.message ?? 'Please try again.');
    } finally {
      setSavingFY(false);
    }
  }

  async function setYearActive(fy: FundingYear) {
    if (!child) return;
    await supabase.from('funding_years').update({ is_active: false }).eq('child_id', child.id);
    await supabase.from('funding_years').update({ is_active: true }).eq('id', fy.id);
    fetchFundingYears(child.id);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
        <View style={s.mHeader}>
          <Text style={s.mTitle}>{child ? 'Edit Child' : 'Add Child'}</Text>
          <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 16, color: Colors.purple, fontWeight: '500' }}>Done</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.mBody} keyboardShouldPersistTaps="handled">

            {/* Child info */}
            <Text style={s.fieldLabel}>Name *</Text>
            <TextInput style={s.textField} value={name} onChangeText={setName} placeholder="Child's full name" placeholderTextColor={Colors.textMuted} />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Date of Birth</Text>
                <TextInput
                  style={s.textField}
                  value={dob}
                  onChangeText={v => setDob(autoFormatDate(v))}
                  placeholder="YYYY/MM/DD"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {!!grantEligibilityText(dob) && (
                  <View style={s.eligibilityBanner}>
                    <Text style={s.eligibilityText}>{grantEligibilityText(dob)}</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>SK Health Card #</Text>
                <TextInput style={s.textField} value={healthCard} onChangeText={setHealthCard} placeholder="000 000 000" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Diagnosis Date</Text>
                <TextInput
                  style={s.textField}
                  value={diagDate}
                  onChangeText={v => setDiagDate(autoFormatDate(v))}
                  placeholder="YYYY/MM/DD"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>

            <Text style={[s.fieldLabel, { marginTop: 14 }]}>Diagnosis Notes</Text>
            <TextInput
              style={[s.textField, { minHeight: 80, textAlignVertical: 'top' }]}
              value={diagNotes}
              onChangeText={setDiagNotes}
              placeholder="DSM-5 diagnosis, level of support, etc."
              placeholderTextColor={Colors.textMuted}
              multiline
            />

            <TouchableOpacity style={{ marginTop: 20 }} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              <LinearGradient
                colors={Colors.gradients.purple as unknown as string[]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.saveBtn}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>{child ? 'Save Changes' : 'Add Child'}</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Funding years (only when editing) */}
            {child && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Funding Years</Text>
                  <TouchableOpacity onPress={() => setShowAddYear(!showAddYear)}>
                    <Text style={{ color: Colors.purple, fontWeight: '600', fontSize: 14 }}>+ Add</Text>
                  </TouchableOpacity>
                </View>

                {showAddYear && (
                  <View style={s.addYearCard}>
                    <Text style={s.fieldLabel}>Label (e.g. 2024-2025)</Text>
                    <TextInput style={s.textField} value={fyLabel} onChangeText={setFyLabel} placeholder="2024-2025" placeholderTextColor={Colors.textMuted} />
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.fieldLabel}>Start Date</Text>
                        <TextInput style={s.textField} value={fyStart} onChangeText={v => setFyStart(autoFormatDate(v))} placeholder="YYYY/MM/DD" placeholderTextColor={Colors.textMuted} keyboardType="number-pad" maxLength={10} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.fieldLabel}>End Date</Text>
                        <TextInput style={s.textField} value={fyEnd} onChangeText={v => setFyEnd(autoFormatDate(v))} placeholder="YYYY/MM/DD" placeholderTextColor={Colors.textMuted} keyboardType="number-pad" maxLength={10} />
                      </View>
                    </View>
                    <Text style={[s.fieldLabel, { marginTop: 10 }]}>Grant Amount</Text>
                    <TextInput style={s.textField} value={fyBudget} onChangeText={setFyBudget} keyboardType="decimal-pad" placeholder="8000" placeholderTextColor={Colors.textMuted} />
                    <Text style={s.fieldHint}>SK ASD-IF: $8,000/yr (under 6) · $6,000/yr (ages 6–11) · auto-set from child's age</Text>
                    <TouchableOpacity style={{ marginTop: 12 }} onPress={handleAddFundingYear} disabled={savingFY} activeOpacity={0.85}>
                      <LinearGradient colors={Colors.gradients.teal as unknown as string[]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveBtn}>
                        {savingFY ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Create Funding Year</Text>}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {fundingYears.map(fy => (
                  <View key={fy.id} style={[s.fyRow, fy.is_active && s.fyRowActive]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.fyLabel, fy.is_active && { color: Colors.purple }]}>{fy.label}</Text>
                      <Text style={s.fySub}>{CAD(fy.total_budget)} · {fy.start_date} → {fy.end_date}</Text>
                    </View>
                    {!fy.is_active && (
                      <TouchableOpacity onPress={() => setYearActive(fy)} style={s.setActiveBtn}>
                        <Text style={{ fontSize: 11, color: Colors.purple, fontWeight: '600' }}>Set Active</Text>
                      </TouchableOpacity>
                    )}
                    {fy.is_active && (
                      <View style={s.activePill}>
                        <Text style={{ fontSize: 11, color: Colors.purple, fontWeight: '700' }}>Active</Text>
                      </View>
                    )}
                  </View>
                ))}

                {child && (
                  <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteChild}>
                    <Text style={s.deleteBtnText}>Delete {child.name}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { session, profile, refetchProfile, signOut } = useAuth();
  const { children, refetch: refetchChildren }         = useChildren();
  const [editName,        setEditName]        = useState(profile?.full_name ?? '');
  const [editAddress,     setEditAddress]     = useState(profile?.home_address ?? '');
  const [editCity,        setEditCity]        = useState(profile?.home_city ?? '');
  const [editPostal,      setEditPostal]      = useState(profile?.home_postal_code ?? '');
  const [savingProfile,   setSavingProfile]   = useState(false);
  const [profileDirty,    setProfileDirty]    = useState(false);
  const [childModal,      setChildModal]      = useState<{ visible: boolean; child: Child | null }>({ visible: false, child: null });

  useEffect(() => {
    setEditName(profile?.full_name ?? '');
    setEditAddress(profile?.home_address ?? '');
    setEditCity(profile?.home_city ?? '');
    setEditPostal(profile?.home_postal_code ?? '');
  }, [profile]);

  async function saveProfile() {
    if (!session) return;
    setSavingProfile(true);
    await supabase.from('profiles').update({
      full_name:         editName.trim() || null,
      home_address:      editAddress.trim() || null,
      home_city:         editCity.trim() || null,
      home_postal_code:  editPostal.trim().toUpperCase() || null,
    }).eq('id', session.user.id);
    await refetchProfile();
    setSavingProfile(false);
    setProfileDirty(false);
  }

  async function handleSignOut() {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.avatarRow}>
          <LinearGradient colors={Colors.gradients.purple as unknown as string[]} style={s.avatar}>
            <Text style={{ fontSize: 28, color: '#fff' }}>
              {(editName || profile?.full_name || 'U')[0].toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={s.nameText}>{profile?.full_name ?? 'Your Account'}</Text>
            <Text style={s.emailText}>{session?.user.email ?? ''}</Text>
          </View>
        </View>

        {/* Profile info */}
        <View style={s.card}>
          <Text style={s.cardSectionTitle}>Account Info</Text>

          <Text style={s.fieldLabel}>Full Name</Text>
          <TextInput
            style={s.textField}
            value={editName}
            onChangeText={v => { setEditName(v); setProfileDirty(true); }}
            placeholder="Your full name"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="next"
          />

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>Home Address</Text>
          <AddressAutocomplete
            value={editAddress}
            onChangeText={v => { setEditAddress(v); setProfileDirty(true); }}
            onSelect={suggestion => {
              setEditAddress(suggestion.street);
              if (suggestion.city)   setEditCity(suggestion.city);
              if (suggestion.postal) setEditPostal(suggestion.postal);
              setProfileDirty(true);
            }}
            placeholder="123 Main St"
          />
          <Text style={s.fieldHint}>Type your address and pick from the suggestions</Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
            <View style={{ flex: 2 }}>
              <Text style={s.fieldLabel}>Home City</Text>
              <TextInput
                style={s.textField}
                value={editCity}
                onChangeText={v => { setEditCity(v); setProfileDirty(true); }}
                placeholder="Saskatoon"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="next"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Postal Code</Text>
              <TextInput
                style={s.textField}
                value={editPostal}
                onChangeText={v => { setEditPostal(v); setProfileDirty(true); }}
                placeholder="S7K 1A1"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                returnKeyType="done"
                maxLength={7}
              />
            </View>
          </View>

          {profileDirty && (
            <TouchableOpacity style={{ marginTop: 16 }} onPress={saveProfile} disabled={savingProfile} activeOpacity={0.85}>
              <LinearGradient
                colors={Colors.gradients.purple as unknown as string[]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.saveBtn}
              >
                {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Save Profile</Text>}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Children */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.cardSectionTitle}>Children</Text>
            <TouchableOpacity onPress={() => setChildModal({ visible: true, child: null })}>
              <Text style={{ color: Colors.purple, fontWeight: '600', fontSize: 14 }}>+ Add Child</Text>
            </TouchableOpacity>
          </View>

          {children.length === 0 && (
            <Text style={{ color: Colors.textMuted, fontSize: 13, paddingVertical: 8 }}>
              No children added yet.
            </Text>
          )}

          {children.map((child, i) => (
            <TouchableOpacity
              key={child.id}
              style={[s.childRow, i < children.length - 1 && { borderBottomWidth: 1, borderColor: Colors.border }]}
              onPress={() => setChildModal({ visible: true, child })}
              activeOpacity={0.7}
            >
              <LinearGradient colors={Colors.gradients.blue as unknown as string[]} style={s.childAvatar}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                  {child.name[0].toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={s.childName}>{child.name}</Text>
                {child.date_of_birth && (
                  <Text style={s.childSub}>Born {child.date_of_birth}</Text>
                )}
                {child.health_card_number && (
                  <Text style={s.childSub}>Health Card: {child.health_card_number}</Text>
                )}
              </View>
              <Text style={{ color: Colors.textMuted, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reports */}
        <TouchableOpacity style={s.actionBtn} onPress={() => router.push('/(tabs)/reports')} activeOpacity={0.8}>
          <Text style={{ fontSize: 20 }}>📊</Text>
          <Text style={s.actionBtnText}>Generate Grant Report</Text>
          <Text style={{ color: Colors.textMuted, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={[s.actionBtn, { borderColor: '#FECDD3' }]} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={{ fontSize: 20 }}>🚪</Text>
          <Text style={[s.actionBtnText, { color: '#BE123C' }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Autism Fund Tracker v1.0 · Saskatchewan ASD-IF</Text>
      </ScrollView>

      <ChildModal
        visible={childModal.visible}
        child={childModal.child}
        onClose={() => setChildModal({ visible: false, child: null })}
        onSaved={() => { refetchChildren(); setChildModal({ visible: false, child: null }); }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 60, gap: 14 },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  avatar:    { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  nameText:  { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emailText: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  card: {
    backgroundColor: Colors.surface, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.border, gap: 0,
  },
  cardSectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  cardHeaderRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },

  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  fieldHint:  { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  textField:  { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 15, color: Colors.textPrimary },
  eligibilityBanner: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#86EFAC' },
  eligibilityText: { fontSize: 12, color: '#15803D', fontWeight: '500' },

  saveBtn:    { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  saveBtnText:{ fontSize: 16, fontWeight: '700', color: '#fff' },

  childRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  childAvatar:{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  childName:  { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  childSub:   { fontSize: 12, color: Colors.textMuted, marginTop: 1 },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  actionBtnText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  version: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, marginTop: 8 },

  // Modal
  mHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: Colors.border,
  },
  mTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  mBody:  { padding: 20, paddingBottom: 60 },

  sectionHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  addYearCard: { backgroundColor: Colors.surfaceAlt, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },

  fyRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  fyRowActive: { borderColor: Colors.purple, backgroundColor: '#F5F0FF' },
  fyLabel:     { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  fySub:       { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  setActiveBtn:{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: Colors.purple },
  activePill:  { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F5F0FF', borderWidth: 1, borderColor: Colors.purple },

  deleteBtn:     { marginTop: 20, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#FECDD3', alignItems: 'center' },
  deleteBtnText: { color: '#BE123C', fontWeight: '600', fontSize: 14 },
});
