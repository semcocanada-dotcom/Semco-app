import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput,
  StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { differenceInYears, parseISO, isValid } from 'date-fns';
import { Colors } from '@constants/colors';
import {
  ACCOUNT_DELETION_CONFIRMATION,
  ACCOUNT_DELETION_ERROR_MESSAGE,
} from '@lib/accountDeletion';
import { supabase } from '@lib/supabase';
import { useAuth } from '@context/AuthContext';
import { useChildren } from '@hooks/useChildren';
import type { Child, FundingYear } from '@lib/types';
import {
  CHILD_DATA_ATTESTATION,
  CHILD_DATA_CONSENT_VERSION,
  PRIVACY_POLICY_URL,
} from '@lib/privacyConsent';
import { SASKATCHEWAN_AUTISM_SERVICES_URL } from '@lib/officialLinks';

const SUPPORT_URL = 'https://semcocanada-dotcom.github.io/Semco-app/support.html';

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

// Estimates based on the Saskatchewan program page, checked August 2026.
// The account holder remains responsible for entering their actual approved amount.
function calcASDIFEstimate(dobISO: string | null, atISO?: string): number | null {
  if (!dobISO) return null;
  try {
    const dob = parseISO(dobISO);
    const ref = atISO ? parseISO(atISO) : new Date();
    const age = differenceInYears(ref, dob);
    if (age < 0) return null;
    if (age < 6) return 8000;
    if (age < 12) return 6000;
    return null;
  } catch {
    return null;
  }
}

// Provides a non-binding estimate; the app never decides eligibility or approval.
function grantEstimateText(dobDisplay: string): string | null {
  const iso = dateDisplayToISO(dobDisplay);
  if (!iso) return null;
  try {
    const dob = parseISO(iso);
    if (!isValid(dob)) return null;
    const age = differenceInYears(new Date(), dob);
    if (age < 0 || age > 25) return null;
    if (age < 6) {
      return `Estimate: up to $8,000/year based on age ${age} (program information current as of Aug 2026). Confirm actual approval and amount with Saskatchewan.`;
    }
    if (age < 12) {
      return `Estimate: up to $6,000/year based on age ${age} (program information current as of Aug 2026). Confirm actual approval and amount with Saskatchewan.`;
    }
    return `No automatic ASD-IF amount estimate is shown for age ${age}. Confirm current eligibility and any approved amount with Saskatchewan.`;
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
  const [childConsentAccepted, setChildConsentAccepted] = useState(false);
  const [fundingYears,setFundingYears]= useState<FundingYear[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [showAddYear, setShowAddYear] = useState(false);

  // Funding year form
  const [fyLabel,  setFyLabel]  = useState('');
  const [fyStart,  setFyStart]  = useState('');
  const [fyEnd,    setFyEnd]    = useState('');
  const [fyBudget, setFyBudget] = useState('');
  const [fyActive, setFyActive] = useState(true);
  const [savingFY, setSavingFY] = useState(false);

  // Auto-recalculate suggested budget when start date changes
  useEffect(() => {
    if (!child?.date_of_birth || !fyStart) return;
    const startISO = dateDisplayToISO(fyStart);
    if (!startISO) return;
    const suggested = calcASDIFEstimate(child.date_of_birth, startISO);
    setFyBudget(suggested === null ? '' : String(suggested));
  }, [fyStart, child?.date_of_birth]);

  useEffect(() => {
    if (!visible) return;
    setName(child?.name ?? '');
    setDob(isoToDateDisplay(child?.date_of_birth));
    setHealthCard(child?.health_card_number ?? '');
    setDiagDate(isoToDateDisplay(child?.diagnosis_date));
    setDiagNotes(child?.diagnosis_notes ?? '');
    setChildConsentAccepted(false);
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
    if (!child && !childConsentAccepted) {
      Alert.alert(
        'Authorization required',
        'Confirm that you are authorized to store this child\'s information and agree to the Privacy Policy.',
      );
      return;
    }
    if (!session) return;
    setSaving(true);
    try {
      const dobISO = dateDisplayToISO(dob);
      const diagDateISO = dateDisplayToISO(diagDate);
      if (child) {
        const { error } = await supabase.from('children').update({
          name: name.trim(),
          date_of_birth: dobISO,
          health_card_number: healthCard || null,
          diagnosis_date: diagDateISO,
          diagnosis_notes: diagNotes || null,
        }).eq('id', child.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('children').insert({
          parent_id: session.user.id,
          name: name.trim(),
          date_of_birth: dobISO,
          health_card_number: healthCard || null,
          diagnosis_date: diagDateISO,
          diagnosis_notes: diagNotes || null,
          data_consent_version: CHILD_DATA_CONSENT_VERSION,
          data_consent_accepted_at: new Date().toISOString(),
        });
        if (error) throw error;
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
    const enteredBudget = Number(fyBudget);
    if (!Number.isFinite(enteredBudget) || enteredBudget <= 0) {
      Alert.alert('Grant amount required', 'Enter the actual amount approved for this funding year.');
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
        total_budget: enteredBudget,
        start_date:   startISO,
        end_date:     endISO,
        is_active:    fyActive,
      });
      setFyLabel(''); setFyStart(''); setFyEnd(''); setFyBudget(''); setFyActive(true);
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
                {!!grantEstimateText(dob) && (
                  <View style={s.eligibilityBanner}>
                    <Text style={s.eligibilityText}>{grantEstimateText(dob)}</Text>
                    <TouchableOpacity onPress={() => { void Linking.openURL(SASKATCHEWAN_AUTISM_SERVICES_URL); }}>
                      <Text style={s.consentLink}>Check the official Saskatchewan program page</Text>
                    </TouchableOpacity>
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

            {!child && (
              <View style={s.consentCard}>
                <Text style={s.consentTitle}>Adult authorization required</Text>
                <Text style={s.consentDisclosure}>
                  Child information is stored in your private cloud account. Health Services Number, diagnosis date,
                  and diagnosis notes are optional.
                </Text>
                <TouchableOpacity
                  style={s.consentRow}
                  onPress={() => setChildConsentAccepted(value => !value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: childConsentAccepted }}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={childConsentAccepted ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={childConsentAccepted ? Colors.purple : Colors.textMuted}
                  />
                  <Text style={s.consentText}>{CHILD_DATA_ATTESTATION}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { void Linking.openURL(PRIVACY_POLICY_URL); }}>
                  <Text style={s.consentLink}>Read the Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            )}

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
                    <TextInput style={s.textField} value={fyBudget} onChangeText={setFyBudget} keyboardType="decimal-pad" placeholder="Enter approved amount" placeholderTextColor={Colors.textMuted} />
                    <Text style={s.fieldHint}>
                      The age-based value is only an estimate from Saskatchewan program information current as of
                      Aug 2026. Edit it to match the amount actually approved for this funding year.
                    </Text>
                    <TouchableOpacity onPress={() => { void Linking.openURL(SASKATCHEWAN_AUTISM_SERVICES_URL); }}>
                      <Text style={s.consentLink}>Official Saskatchewan ASD-IF information</Text>
                    </TouchableOpacity>
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
  const { session, profile, refetchProfile, signOut, deleteAccount } = useAuth();
  const { children, refetch: refetchChildren }         = useChildren();
  const [editName,        setEditName]        = useState(profile?.full_name ?? '');
  const [savingProfile,   setSavingProfile]   = useState(false);
  const [profileDirty,    setProfileDirty]    = useState(false);
  const [childModal,      setChildModal]      = useState<{ visible: boolean; child: Child | null }>({ visible: false, child: null });
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    setEditName(profile?.full_name ?? '');
  }, [profile]);

  async function saveProfile() {
    if (!session) return;
    setSavingProfile(true);
    await supabase.from('profiles').update({
      full_name:         editName.trim() || null,
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

  function openDeleteAccountConfirmation() {
    setDeleteConfirmation('');
    setDeleteAccountVisible(true);
  }

  function closeDeleteAccountConfirmation() {
    if (deletingAccount) return;
    setDeleteConfirmation('');
    setDeleteAccountVisible(false);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== ACCOUNT_DELETION_CONFIRMATION || deletingAccount) return;

    setDeletingAccount(true);
    try {
      await deleteAccount();
      setDeleteAccountVisible(false);
      setDeleteConfirmation('');
    } catch {
      Alert.alert('Account not deleted', ACCOUNT_DELETION_ERROR_MESSAGE);
    } finally {
      setDeletingAccount(false);
    }
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
          <View style={[s.actionIcon, { backgroundColor: Colors.purple + '1A' }]}>
            <Ionicons name="bar-chart" size={18} color={Colors.purple} />
          </View>
          <Text style={s.actionBtnText}>Generate Grant Worksheet</Text>
          <Text style={{ color: Colors.textMuted, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => { void Linking.openURL(PRIVACY_POLICY_URL); }}
          activeOpacity={0.8}
        >
          <View style={[s.actionIcon, { backgroundColor: Colors.teal + '1A' }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.teal} />
          </View>
          <Text style={s.actionBtnText}>Privacy Policy</Text>
          <Text style={{ color: Colors.textMuted, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => { void Linking.openURL(SUPPORT_URL); }}
          activeOpacity={0.8}
        >
          <View style={[s.actionIcon, { backgroundColor: Colors.blue + '1A' }]}>
            <Ionicons name="help-circle-outline" size={18} color={Colors.blue} />
          </View>
          <Text style={s.actionBtnText}>Support</Text>
          <Text style={{ color: Colors.textMuted, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity style={[s.actionBtn, { borderColor: '#FECDD3' }]} onPress={handleSignOut} activeOpacity={0.8}>
          <View style={[s.actionIcon, { backgroundColor: '#BE123C1A' }]}>
            <Ionicons name="log-out-outline" size={18} color="#BE123C" />
          </View>
          <Text style={[s.actionBtnText, { color: '#BE123C' }]}>Sign Out</Text>
        </TouchableOpacity>

        {/* Account deletion is deliberately visible in-app for App Store
            Guideline 5.1.1(v), with a separate destructive confirmation. */}
        <TouchableOpacity
          style={s.deleteAccountEntry}
          onPress={openDeleteAccountConfirmation}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          accessibilityHint="Permanently deletes your account and all associated data"
        >
          <Ionicons name="trash-outline" size={18} color="#BE123C" />
          <Text style={s.deleteAccountEntryText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={s.version}>Autism Fund Tracker v1.0 · Independent ASD-IF recordkeeping</Text>
      </ScrollView>

      <ChildModal
        visible={childModal.visible}
        child={childModal.child}
        onClose={() => setChildModal({ visible: false, child: null })}
        onSaved={() => { refetchChildren(); setChildModal({ visible: false, child: null }); }}
      />

      <Modal
        visible={deleteAccountVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteAccountConfirmation}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.deleteAccountBackdrop}
        >
          <View
            style={s.deleteAccountDialog}
            accessibilityViewIsModal
            accessibilityRole="alert"
          >
            <View style={s.deleteAccountIcon}>
              <Ionicons name="warning-outline" size={28} color="#BE123C" />
            </View>
            <Text style={s.deleteAccountTitle}>Permanently delete account?</Text>
            <Text style={s.deleteAccountBody}>
              This permanently deletes your profile, children, funding years, expenses,
              mileage, respite records, appointments, custom providers, and receipt
              files. This cannot be undone.
            </Text>
            <Text style={s.deleteAccountPrompt}>
              Type <Text style={{ fontWeight: '800' }}>{ACCOUNT_DELETION_CONFIRMATION}</Text> to confirm
            </Text>
            <TextInput
              style={s.deleteAccountInput}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder={ACCOUNT_DELETION_CONFIRMATION}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!deletingAccount}
              accessibilityLabel="Type DELETE to confirm account deletion"
            />
            <View style={s.deleteAccountActions}>
              <TouchableOpacity
                style={s.deleteAccountCancel}
                onPress={closeDeleteAccountConfirmation}
                disabled={deletingAccount}
                accessibilityRole="button"
              >
                <Text style={s.deleteAccountCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.deleteAccountConfirm,
                  deleteConfirmation !== ACCOUNT_DELETION_CONFIRMATION && s.deleteAccountConfirmDisabled,
                ]}
                onPress={handleDeleteAccount}
                disabled={deleteConfirmation !== ACCOUNT_DELETION_CONFIRMATION || deletingAccount}
                accessibilityRole="button"
                accessibilityLabel="Permanently delete account"
              >
                {deletingAccount
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={s.deleteAccountConfirmText}>Delete Account</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  consentCard: { marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#C4B5FD', backgroundColor: '#F5F3FF', gap: 9 },
  consentTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  consentDisclosure: { fontSize: 12, lineHeight: 18, color: Colors.textSecondary },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  consentText: { flex: 1, fontSize: 12, lineHeight: 18, color: Colors.textPrimary },
  consentLink: { color: Colors.purple, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },

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
  actionIcon: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },

  deleteAccountEntry: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12,
  },
  deleteAccountEntryText: { color: '#BE123C', fontSize: 14, fontWeight: '600' },

  deleteAccountBackdrop: {
    flex: 1, justifyContent: 'center', padding: 24,
    backgroundColor: 'rgba(30, 27, 75, 0.45)',
  },
  deleteAccountDialog: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 22,
    borderWidth: 1, borderColor: '#FECDD3',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 10,
  },
  deleteAccountIcon: {
    width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF1F2', alignSelf: 'center', marginBottom: 12,
  },
  deleteAccountTitle: {
    color: Colors.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center',
  },
  deleteAccountBody: {
    color: Colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 10,
  },
  deleteAccountPrompt: {
    color: Colors.textPrimary, fontSize: 13, textAlign: 'center', marginTop: 18, marginBottom: 8,
  },
  deleteAccountInput: {
    backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: '#FDA4AF',
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    color: Colors.textPrimary, fontSize: 15, textAlign: 'center', letterSpacing: 1.5,
  },
  deleteAccountActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  deleteAccountCancel: {
    flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
  },
  deleteAccountCancelText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  deleteAccountConfirm: {
    flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, backgroundColor: '#BE123C',
  },
  deleteAccountConfirmDisabled: { opacity: 0.4 },
  deleteAccountConfirmText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

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
