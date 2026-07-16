import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Badge, Button, Card, Input, SectionHeader } from '@/components/ui';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';
import { resolveDealerContext } from '@/constants/dealers';
import { useAuthStore } from '@/store/auth';
import {
  getInstallerProfile,
  LOCAL_INSTALLER_ID,
  upsertInstallerProfile,
} from '@/services/installer-profile';
import type { InstallerProfile } from '@/database/schema/installers';

export default function CompanyProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const installerId = user?.id ?? LOCAL_INSTALLER_ID;
  const [profile, setProfile] = useState<InstallerProfile | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [semcoAccountId, setSemcoAccountId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getInstallerProfile(installerId)
      .then((row) => {
        setProfile(row);
        setCompanyName(row?.companyName ?? '');
        setContactName(row?.contactName ?? '');
        setEmail(row?.email ?? user?.email ?? '');
        setPhone(row?.phone ?? '');
        setCompanyAddress(row?.companyAddress ?? '');
        setCity(row?.city ?? '');
        setProvince(row?.province ?? '');
        setPostalCode(row?.postalCode ?? '');
        setSemcoAccountId(row?.semcoAccountId ?? '');
      })
      .catch(console.error);
  }, [installerId, user?.email]);

  const dealerContext = useMemo(
    () => resolveDealerContext({ companyPostalCode: postalCode, companyProvince: province, companyAddress }),
    [companyAddress, postalCode, province],
  );

  const completionItems = [
    companyName.trim(),
    contactName.trim(),
    email.trim(),
    phone.trim(),
    companyAddress.trim(),
    city.trim(),
    province.trim(),
    postalCode.trim(),
  ];
  const completionCount = completionItems.filter(Boolean).length;
  const completionPct = Math.round((completionCount / completionItems.length) * 100);

  async function saveProfile() {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const nextProfile = await upsertInstallerProfile(installerId, {
        companyName: companyName.trim() || null,
        contactName: contactName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        companyAddress: companyAddress.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        postalCode: postalCode.trim().toUpperCase() || null,
        semcoAccountId: semcoAccountId.trim() || null,
        certificationStatus: profile?.certificationStatus ?? 'pending',
      });
      setProfile(nextProfile);
      setSaved(true);
    } catch (error) {
      console.error('[profile] save failed', error);
      setSaveError(
        error instanceof Error
          ? error.message
          : 'The profile could not be saved. Check your connection and try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AppHeader title="Company Profile" subtitle="Used for dealer routing, warranty records, and reward tracking." rightIcon="business-outline" />

        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Badge label={`${completionPct}% complete`} variant={completionPct >= 80 ? 'success' : 'warning'} />
            <Badge label={dealerContext.dealerId ? dealerContext.dealerName : 'Dealer pending'} variant={dealerContext.dealerId ? 'primary' : 'warning'} />
          </View>
          <Text style={styles.heroTitle}>{companyName.trim() || 'Add company information'}</Text>
          <Text style={styles.heroBody}>
            Postal code keeps the contractor profile clean for warranty, rewards, and dealer routing. Manitoba and western orders route to Innovative Finishes; Ontario and eastern orders route to Modern Arc.
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
          </View>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Company" subtitle="This becomes the installer record Semco can review." />
          <Input label="Company Name" value={companyName} onChangeText={setCompanyName} placeholder="Company name" />
          <Input label="Contact Name" value={contactName} onChangeText={setContactName} placeholder="Main contact" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="email@company.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
          <Input label="Semco Account ID" value={semcoAccountId} onChangeText={setSemcoAccountId} placeholder="Optional" />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Business Address" subtitle="Dealer assignment is based on the company profile, not a single job address." />
          <Input label="Street Address" value={companyAddress} onChangeText={setCompanyAddress} placeholder="123 Main St" multiline />
          <View style={styles.inlineRow}>
            <Input label="City" value={city} onChangeText={setCity} placeholder="City" containerStyle={styles.inlineInput} />
            <Input label="Province" value={province} onChangeText={setProvince} placeholder="ON" autoCapitalize="characters" containerStyle={styles.inlineInput} />
          </View>
          <Input label="Postal Code" value={postalCode} onChangeText={setPostalCode} placeholder="A1A 1A1" autoCapitalize="characters" />
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>Why this matters</Text>
            <Text style={styles.infoBody}>
              Warranty documents, project review, dealer orders, and verified square footage rewards all need a clean contractor account record.
            </Text>
          </View>
        </Card>

        {saved ? <Text style={styles.savedText}>Profile saved.</Text> : null}
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
        <Button label="Save Company Profile" onPress={saveProfile} isLoading={saving} fullWidth size="lg" />
        <Button label="View Reward Progress" variant="secondary" onPress={() => router.push('/rewards' as any)} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 44,
    gap: Spacing.md,
  },
  heroCard: { gap: Spacing.md, borderColor: Colors.primaryMuted, backgroundColor: Colors.surfaceElevated },
  heroTop: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  heroTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  heroBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  progressTrack: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.semcoOrange,
  },
  section: { gap: Spacing.sm },
  inlineRow: { flexDirection: 'row', gap: Spacing.sm },
  inlineInput: { flex: 1 },
  infoCard: { flexDirection: 'row', gap: Spacing.md, borderColor: Colors.primaryMuted },
  infoIcon: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  infoCopy: { flex: 1, gap: 3 },
  infoTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  infoBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  savedText: {
    color: Colors.success,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.danger,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
});
