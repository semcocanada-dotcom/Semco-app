import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '@/components/ui';
import { SubstratePicker } from '@/components/calculator/SubstratePicker';
import { db } from '@/database/client';
import { projects } from '@/database/schema/projects';
import type { SubstrateId } from '@/constants/substrates';
import { useAuthStore } from '@/store/auth';
import { Colors, Typography, Spacing } from '@/constants/theme';

const FINISH_OPTIONS: { id: string; label: string }[] = [
  { id: 'matte', label: 'Matte' },
  { id: 'satin', label: 'Satin' },
  { id: 'gloss', label: 'Gloss' },
];

export default function CreateProjectScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [substrateType, setSubstrateType] = useState<SubstrateId | null>(null);
  const [totalAreaSqm, setTotalAreaSqm] = useState('');
  const [finishType, setFinishType] = useState('satin');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!clientName.trim()) { setError('Client name is required'); return; }
    setError(null);
    setIsSaving(true);

    const area = parseFloat(totalAreaSqm);

    await db.insert(projects).values({
      id: `proj-${Date.now()}`,
      installerId: user?.id ?? 'local',
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || null,
      clientPhone: clientPhone.trim() || null,
      siteAddress: siteAddress.trim() || null,
      substrateType: substrateType ?? null,
      totalAreaSqm: isNaN(area) ? null : area,
      finishType,
      status: 'active',
      warrantyIssued: false,
      notes: notes.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setIsSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>New Project</Text>
        </View>

        <Text style={styles.sectionLabel}>Client Details</Text>
        <Input label="Client Name *" value={clientName} onChangeText={setClientName} placeholder="Jane Smith" error={error ?? undefined} />
        <Input label="Email" value={clientEmail} onChangeText={setClientEmail} keyboardType="email-address" autoCapitalize="none" placeholder="client@email.com" />
        <Input label="Phone" value={clientPhone} onChangeText={setClientPhone} keyboardType="phone-pad" placeholder="+1 (555) 000-0000" />
        <Input label="Site Address" value={siteAddress} onChangeText={setSiteAddress} placeholder="123 Main St, City" multiline />

        <Text style={styles.sectionLabel}>Application Spec</Text>
        <SubstratePicker selected={substrateType} onSelect={setSubstrateType} />

        <Input label="Total Area" value={totalAreaSqm} onChangeText={setTotalAreaSqm} keyboardType="decimal-pad" placeholder="e.g. 45" suffix="m²" />

        <Text style={styles.label}>Finish</Text>
        <View style={styles.finishRow}>
          {FINISH_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              label={opt.label}
              onPress={() => setFinishType(opt.id)}
              variant={finishType === opt.id ? 'primary' : 'secondary'}
              style={styles.finishBtn}
            />
          ))}
        </View>

        <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional notes…" multiline />

        <Button label="Create Project" onPress={handleSave} isLoading={isSaving} fullWidth size="lg" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: Spacing.sm,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  finishRow: { flexDirection: 'row', gap: Spacing.sm },
  finishBtn: { flex: 1 },
});
