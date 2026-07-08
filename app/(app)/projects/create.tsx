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
import { ColorTile } from '@/components/colors/ColorTile';
import { db } from '@/database/client';
import colorsData from '@/database/seed/colors.json';
import type { Color } from '@/database/schema/colors';
import { projects } from '@/database/schema/projects';
import type { SubstrateId } from '@/constants/substrates';
import {
  CURRENT_POOL_SEALER_SKU,
  STOCKED_SEALERS,
  type StockedSealerSku,
} from '@/constants/stocked-sealers';
import { useAuthStore } from '@/store/auth';
import { sqftToSqm } from '@/utils/area';
import { Colors, Fonts, Layout, Radius, Typography, Spacing } from '@/constants/theme';
import { createLocalId } from '@/utils/id';

const FINISH_OPTIONS: { id: string; label: string }[] = [
  { id: 'matte', label: 'Matte' },
  { id: 'satin', label: 'Satin' },
  { id: 'gloss', label: 'Gloss' },
];

const FINISH_TO_SEALER: Record<string, StockedSealerSku> = {
  matte: 'MATTE-SEALER',
  satin: 'SATIN-STONE',
  gloss: 'TITAN-SHIELD',
};

const STANDARD_COLORS = colorsData as Color[];

export default function CreateProjectScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [substrateType, setSubstrateType] = useState<SubstrateId | null>(null);
  const [totalAreaSqft, setTotalAreaSqft] = useState('');
  const [finishType, setFinishType] = useState('satin');
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [sealerProductId, setSealerProductId] = useState<StockedSealerSku>('SATIN-STONE');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedColor = STANDARD_COLORS.find((color) => color.id === selectedColorId) ?? null;

  const handleSubstrateSelect = (value: SubstrateId) => {
    setSubstrateType(value);
    if (value === 'pool') {
      setSealerProductId(CURRENT_POOL_SEALER_SKU);
    }
  };

  const handleFinishSelect = (value: string) => {
    setFinishType(value);
    if (substrateType !== 'pool') {
      setSealerProductId(FINISH_TO_SEALER[value] ?? 'SATIN-STONE');
    }
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      setError('Client name is required');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const areaSqft = parseFloat(totalAreaSqft);
      const projectId = createLocalId('proj');
      const now = new Date().toISOString();

      await db.insert(projects).values({
        id: projectId,
        installerId: user?.id ?? 'local',
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || null,
        clientPhone: clientPhone.trim() || null,
        siteAddress: siteAddress.trim() || null,
        substrateType: substrateType ?? null,
        totalAreaSqm: isNaN(areaSqft) ? null : sqftToSqm(areaSqft),
        selectedColorId,
        finishType,
        sealerProductId,
        status: 'active',
        warrantyIssued: false,
        notes: notes.trim() || null,
        createdAt: now,
        updatedAt: now,
      });

      router.replace({ pathname: '/projects/[id]', params: { id: projectId } } as any);
    } catch (saveError) {
      console.error(saveError);
      setError('Project could not be saved. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
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
        <SubstratePicker selected={substrateType} onSelect={handleSubstrateSelect} />

        <Input label="Total Area" value={totalAreaSqft} onChangeText={setTotalAreaSqft} keyboardType="decimal-pad" placeholder="e.g. 500" suffix="sq ft" />

        <Text style={styles.label}>Finish</Text>
        <View style={styles.finishRow}>
          {FINISH_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              label={opt.label}
              onPress={() => handleFinishSelect(opt.id)}
              variant={finishType === opt.id ? 'primary' : 'secondary'}
              style={styles.finishBtn}
            />
          ))}
        </View>

        <Text style={styles.label}>Colour</Text>
        <View style={styles.colorPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorStrip}>
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => setSelectedColorId(null)}
              style={[styles.noColorTile, !selectedColorId && styles.colorTileSelected]}
              accessibilityRole="button"
              accessibilityLabel="Select colour later"
            >
              <Ionicons name="add" size={22} color={Colors.primary} />
            </TouchableOpacity>
            {STANDARD_COLORS.map((color) => (
              <ColorTile
                key={color.id}
                color={color}
                onPress={() => setSelectedColorId(color.id)}
                size={52}
                style={selectedColorId === color.id ? styles.colorTileSelected : undefined}
              />
            ))}
          </ScrollView>
          <Text style={styles.selectionText}>
            {selectedColor ? `${selectedColor.name}${selectedColor.code ? ` (${selectedColor.code})` : ''}` : 'Select later in the project file'}
          </Text>
        </View>

        <Text style={styles.label}>Sealer</Text>
        <View style={styles.sealerGrid}>
          {STOCKED_SEALERS.map((sealer) => {
            const selected = sealerProductId === sealer.sku;
            return (
              <TouchableOpacity
                key={sealer.sku}
                activeOpacity={0.78}
                onPress={() => setSealerProductId(sealer.sku)}
                style={[styles.sealerOption, selected && styles.sealerOptionSelected]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={sealer.productName}
              >
                <Text style={[styles.sealerLabel, selected && styles.sealerLabelSelected]}>{sealer.label}</Text>
                <Text style={[styles.sealerName, selected && styles.sealerNameSelected]}>{sealer.productName}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional notes..." multiline />

        <Button label="Create Project" onPress={handleSave} isLoading={isSaving} fullWidth size="lg" />
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
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
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
  colorPanel: {
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
  },
  colorStrip: { gap: Spacing.sm, paddingRight: Spacing.sm },
  noColorTile: {
    width: 52,
    minHeight: 55,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorTileSelected: {
    borderWidth: 2,
    borderColor: Colors.semcoOrange,
  },
  selectionText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
  },
  sealerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sealerOption: {
    width: '48%',
    minHeight: 72,
    justifyContent: 'center',
    gap: 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.lightTeal,
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.md,
  },
  sealerOptionSelected: {
    borderColor: Colors.semcoOrange,
    backgroundColor: Colors.semcoOrange,
  },
  sealerLabel: {
    color: Colors.darkTeal,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  sealerName: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
  },
  sealerLabelSelected: { color: Colors.white },
  sealerNameSelected: { color: Colors.white },
});
