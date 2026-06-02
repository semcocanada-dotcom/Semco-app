import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '@/components/ui';
import { FormulaDisplay } from '@/components/colors/FormulaDisplay';
import { useColorCamera } from '@/hooks/useColorCamera';
import { buildPigmentRatio } from '@/services/color-scaler';
import { db } from '@/database/client';
import { colors } from '@/database/schema/colors';
import type { PigmentRatio } from '@/database/schema/colors';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';

// Common XBond tints available to installers for custom mixes
const AVAILABLE_PIGMENTS = [
  { code: 'KX', name: 'Titanium White' },
  { code: 'LAMP-BLK', name: 'Lamp Black' },
  { code: 'RAW-UMB', name: 'Raw Umber' },
  { code: 'BRN-UMB', name: 'Burnt Umber' },
  { code: 'YLW-OCH', name: 'Yellow Ochre' },
  { code: 'EXT-RED', name: 'Exterior Red' },
  { code: 'PHTH-BLU', name: 'Phthalo Blue' },
  { code: 'CHR-GRN', name: 'Chrome Green Oxide' },
];

export default function CreateColorScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { localUri, capture, upload, isUploading } = useColorCamera();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [pigments, setPigments] = useState<PigmentRatio[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePigment = (pigmentCode: string, pigmentName: string, mlValue: string) => {
    const ml = parseFloat(mlValue) || 0;
    setPigments((prev) => {
      const existing = prev.find((p) => p.pigmentCode === pigmentCode);
      if (existing) {
        return ml === 0
          ? prev.filter((p) => p.pigmentCode !== pigmentCode)
          : prev.map((p) =>
              p.pigmentCode === pigmentCode ? buildPigmentRatio(pigmentCode, pigmentName, ml) : p,
            );
      }
      return ml > 0 ? [...prev, buildPigmentRatio(pigmentCode, pigmentName, ml)] : prev;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Color name is required'); return; }
    setError(null);
    setIsSaving(true);

    const id = `custom-${Date.now()}`;
    let photoUrl: string | null = null;
    if (localUri) photoUrl = await upload(id);

    await db.insert(colors).values({
      id,
      name: name.trim(),
      code: code.trim() || null,
      isStandard: false,
      installerId: user?.id ?? null,
      pigments: JSON.stringify(pigments),
      photoUrl,
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
          <Text style={styles.title}>Create Custom Color</Text>
        </View>

        <Input label="Color Name" value={name} onChangeText={setName} placeholder="e.g. Coastal Mist" error={error ?? undefined} />
        <Input label="Code (optional)" value={code} onChangeText={setCode} placeholder="e.g. MY-001" autoCapitalize="characters" />

        <Text style={styles.sectionLabel}>Tints (ml per quart of XBond)</Text>
        <Text style={styles.sectionHint}>Enter amounts for a quart batch. Gallon and 5-gallon scale automatically.</Text>
        {AVAILABLE_PIGMENTS.map((pig) => {
          const existing = pigments.find((p) => p.pigmentCode === pig.code);
          return (
            <View key={pig.code} style={styles.pigmentRow}>
              <View style={styles.pigmentLabel}>
                <Text style={styles.pigmentName}>{pig.name}</Text>
                <Text style={styles.pigmentCode}>{pig.code}</Text>
              </View>
              <Input
                value={existing ? String(existing.mlPerQuart) : ''}
                onChangeText={(v) => updatePigment(pig.code, pig.name, v)}
                keyboardType="decimal-pad"
                placeholder="0"
                suffix="ml"
                containerStyle={styles.pigmentInput}
              />
            </View>
          );
        })}

        {pigments.length > 0 && (
          <FormulaDisplay pigments={pigments} colorName={name || 'Custom Color'} />
        )}

        <Text style={styles.sectionLabel}>Cured Color Photo</Text>
        <View style={styles.cameraSection}>
          {localUri ? (
            <Image source={{ uri: localUri }} style={styles.preview} contentFit="cover" />
          ) : null}
          <TouchableOpacity onPress={capture} style={styles.cameraBtn}>
            <Ionicons name="camera" size={22} color={Colors.primary} />
            <Text style={styles.cameraBtnText}>{localUri ? 'Retake Photo' : 'Capture Cured Sample'}</Text>
          </TouchableOpacity>
        </View>

        <Input label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any mixing notes…" multiline />

        <Button label="Save Custom Color" onPress={handleSave} isLoading={isSaving || isUploading} fullWidth size="lg" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
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
  sectionHint: {
    color: Colors.textDisabled,
    fontSize: Typography.size.sm,
    marginTop: -Spacing.sm,
  },
  pigmentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pigmentLabel: { flex: 1 },
  pigmentName: { color: Colors.textPrimary, fontSize: Typography.size.base },
  pigmentCode: { color: Colors.textDisabled, fontSize: Typography.size.xs },
  pigmentInput: { width: 130, marginBottom: 0 },
  cameraSection: { gap: Spacing.sm },
  preview: { width: '100%', height: 200, borderRadius: Radius.lg, backgroundColor: Colors.surfaceElevated },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
  },
  cameraBtnText: { color: Colors.primary, fontSize: Typography.size.base, fontWeight: Typography.weight.medium },
});
