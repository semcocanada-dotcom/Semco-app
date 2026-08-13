import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCalculator } from '@/hooks/useCalculator';
import { AppHeader, Button, Card, Input } from '@/components/ui';
import { MaterialBreakdownCard } from '@/components/calculator/MaterialBreakdownCard';
import { MaterialRetailEstimateCard } from '@/components/calculator/MaterialRetailEstimateCard';
import { PrepSystemPicker } from '@/components/calculator/PrepSystemPicker';
import { SubstratePicker } from '@/components/calculator/SubstratePicker';
import { WasteToggle } from '@/components/calculator/WasteToggle';
import { SEALER_OPTIONS, WATERPROOFING_OPTIONS, XBOND_FINISH_OPTIONS } from '@/constants/product-coverage';
import {
  getPrepSystem,
  isLiquidMembraneRequired,
  type InstallationScope,
} from '@/constants/prep-systems';
import { CURRENT_POOL_SEALER_SKU } from '@/constants/stocked-sealers';
import { resolveDealerContext } from '@/constants/dealers';
import type { InstallerProfile } from '@/database/schema/installers';
import { getInstallerProfile, LOCAL_INSTALLER_ID, profileToDealerInput } from '@/services/installer-profile';
import { savePendingMaterialRequest } from '@/services/pending-material-request';
import { useAuthStore } from '@/store/auth';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';

const ESTIMATOR_POINTS = [
  'X-Bond Stone plus required X-Bond Liquid',
  'SIP Type A-E prep and cleaner sequence',
  'Cleaner quantities plus 1 / 5 gal pricing',
  'Liquid Membrane optional where allowed',
];

const INSTALLATION_SCOPE_OPTIONS: readonly {
  id: InstallationScope;
  label: string;
  description: string;
}[] = [
  {
    id: 'floor_or_other',
    label: 'Floor / Other',
    description: 'Use the selected substrate and system detail.',
  },
  {
    id: 'non_wet_wall',
    label: 'Dry Wall',
    description: 'Wall in a non-wet interior area. Membrane is optional.',
  },
  {
    id: 'wet_area',
    label: 'Wet Wall / Shower',
    description: 'Wet wall, shower, or wet room. Membrane is required.',
  },
  {
    id: 'submerged',
    label: 'Pool / Submerged',
    description: 'Continuously submerged or water-containment work.',
  },
];

function getMembraneRequirementText(
  substrate: string | null,
  installationScope: InstallationScope,
  prepCondition?: string,
): string {
  if (installationScope === 'submerged' || substrate === 'pool') {
    return 'Required for pool, submerged, or water-containment work; the 4-coat mode is applied automatically.';
  }
  if (installationScope === 'wet_area') {
    return 'Required for a wet wall, shower, or wet room; the standard 2-coat mode is applied automatically.';
  }
  if (substrate === 'plywood' || prepCondition === 'type_e') {
    return 'Required by the SIP Type E wood / plywood / OSB membrane-and-fabric assembly.';
  }
  if (substrate === 'existing_tile') {
    return 'Required by the selected tile system detail.';
  }
  return 'Required by the selected substrate or system detail.';
}

export default function CalculatorScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const installerId = user?.id ?? LOCAL_INSTALLER_ID;
  const {
    form,
    result,
    error,
    setAreaSqft,
    setSubstrate,
    setWastePct,
    setSealerSku,
    setWaterproofingMode,
    setInstallationScope,
    setFinishSku,
    setPrepCondition,
    runCalculation,
    reset,
  } = useCalculator();
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [profile, setProfile] = useState<InstallerProfile | null>(null);
  const isPool = form.substrateType === 'pool';
  const membraneRequired = Boolean(
    form.substrateType
      && isLiquidMembraneRequired(
        form.substrateType,
        form.prepCondition ?? undefined,
        form.installationScope,
      ),
  );
  const selectedPrepSystem = form.prepCondition ? getPrepSystem(form.prepCondition) : null;
  const wetDrywallSelected = form.substrateType === 'gypsum_board'
    && (form.installationScope === 'wet_area' || form.installationScope === 'submerged');

  useEffect(() => {
    let mounted = true;
    getInstallerProfile(installerId)
      .then((row) => {
        if (mounted) setProfile(row);
      })
      .catch(console.error);
    return () => {
      mounted = false;
    };
  }, [installerId]);

  const dealerContext = useMemo(
    () => resolveDealerContext(profileToDealerInput(profile)),
    [profile],
  );

  async function createMaterialRequest() {
    if (!result) return;
    setCreatingRequest(true);
    try {
      await savePendingMaterialRequest(result);
      router.push({ pathname: '/orders', params: { source: 'calculator' } } as any);
    } finally {
      setCreatingRequest(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <AppHeader title="Calculator" subtitle="Fast field material estimating." rightIcon="calculator-outline" />

            <Card style={styles.infoCard}>
              <View style={styles.calculatorRow}>
                <View style={styles.calculatorIcon}>
                  <Ionicons name="calculator-outline" size={24} color={Colors.white} />
                </View>
                <View style={styles.calculatorCopy}>
                  <Text style={styles.calculatorTitle}>Coverage estimator</Text>
                  <Text style={styles.calculatorBody}>Enter square footage, choose the common substrate, then review what to stage and what to buy.</Text>
                </View>
              </View>
              <View style={styles.pointList}>
                {ESTIMATOR_POINTS.map((point) => (
                  <View key={point} style={styles.pointRow}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primary} />
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={styles.formCard}>
              <Text style={styles.heading}>Coverage Calculator</Text>
              <Text style={styles.subheading}>
                Input area and scope to estimate prep items, X-Bond Stone, X-Bond Liquid, Liquid Membrane, MicroBond, and sealer.
              </Text>

              <Input
                label="Area"
                value={form.areaSqft}
                onChangeText={setAreaSqft}
                keyboardType="decimal-pad"
                placeholder="e.g. 500"
                suffix="sq ft"
                error={error && error.includes('area') ? error : undefined}
              />

              <SubstratePicker selected={form.substrateType} onSelect={setSubstrate} />

              <View style={styles.section}>
                <Text style={styles.label}>Project Area</Text>
                <Text style={styles.helperText}>
                  Choose the exposure so the calculator can apply the correct Liquid Membrane rule.
                </Text>
                <View style={styles.scopeGrid}>
                  {INSTALLATION_SCOPE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.id}
                      label={opt.label}
                      onPress={() => setInstallationScope(opt.id)}
                      variant={form.installationScope === opt.id ? 'primary' : 'secondary'}
                      size="sm"
                      style={styles.scopeBtn}
                      textStyle={styles.optionText}
                      disabled={isPool && opt.id !== 'submerged'}
                    />
                  ))}
                </View>
                <Text style={styles.helperText}>
                  {INSTALLATION_SCOPE_OPTIONS.find((opt) => opt.id === form.installationScope)?.description}
                </Text>
                {wetDrywallSelected ? (
                  <View style={styles.warningNote}>
                    <Ionicons name="warning-outline" size={18} color={Colors.danger} />
                    <Text style={styles.warningText}>
                      Regular drywall is not a wet-area substrate. Select Wet-area board / Cement board or another approved wet-area substrate.
                    </Text>
                  </View>
                ) : null}
              </View>

              {form.substrateType && form.prepCondition ? (
                <PrepSystemPicker
                  substrate={form.substrateType}
                  selected={form.prepCondition}
                  onSelect={setPrepCondition}
                />
              ) : null}

              <View style={styles.section}>
                <Text style={styles.label}>X-Bond Finish</Text>
                <View style={styles.optionGrid}>
                  {XBOND_FINISH_OPTIONS.map((opt) => (
                    <Button
                      key={opt.sku}
                      label={opt.label}
                      onPress={() => setFinishSku(opt.sku)}
                      variant={form.finishSku === opt.sku ? 'primary' : 'secondary'}
                      size="sm"
                      style={styles.optionBtn}
                      textStyle={styles.optionText}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Liquid Membrane</Text>
                {membraneRequired ? (
                  <View style={styles.requiredMembrane}>
                    <Ionicons name="lock-closed-outline" size={19} color={Colors.darkTeal} />
                    <View style={styles.requiredMembraneCopy}>
                      <Text style={styles.requiredMembraneTitle}>Liquid Membrane required</Text>
                      <Text style={styles.helperText}>
                        {form.installationScope === 'submerged' || isPool
                          ? 'The 4-coat pool/submerged system is included automatically.'
                          : 'The standard 2-coat membrane system is included automatically.'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.optionGrid}>
                    {WATERPROOFING_OPTIONS.map((opt) => {
                      const selected = opt.mode === 'none'
                        ? form.waterproofingMode === 'none'
                        : form.waterproofingMode !== 'none';
                      return (
                        <Button
                          key={opt.mode}
                          label={opt.label}
                          onPress={() => setWaterproofingMode(opt.mode)}
                          variant={selected ? 'primary' : 'secondary'}
                          size="sm"
                          style={styles.membraneBtn}
                        />
                      );
                    })}
                  </View>
                )}
                <View style={styles.systemNote}>
                  <View style={styles.systemNoteIcon}>
                    <Ionicons
                      name={membraneRequired ? 'lock-closed-outline' : 'water-outline'}
                      size={18}
                      color={Colors.darkTeal}
                    />
                  </View>
                  <Text style={styles.systemNoteText}>
                    {membraneRequired
                      ? getMembraneRequirementText(
                        form.substrateType,
                        form.installationScope,
                        selectedPrepSystem?.id,
                      )
                      : form.waterproofingMode === 'none'
                        ? form.installationScope === 'non_wet_wall'
                          ? 'Optional for a wall in a non-wet area. Liquid Membrane is not included in this estimate.'
                          : 'Not included. Use this only where the selected project detail does not specify membrane.'
                        : form.installationScope === 'non_wet_wall'
                          ? 'Optional for this non-wet wall and included by your selection.'
                          : 'Included as an optional waterproofing layer for this estimate.'}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Sealer Finish</Text>
                <View style={styles.sealerRow}>
                  {SEALER_OPTIONS.map((opt) => (
                    <Button
                      key={opt.sku}
                      label={opt.label}
                      onPress={() => setSealerSku(opt.sku)}
                      variant={form.sealerSku === opt.sku ? 'primary' : 'secondary'}
                      size="sm"
                      style={styles.sealerBtn}
                      disabled={isPool && opt.sku !== CURRENT_POOL_SEALER_SKU}
                    />
                  ))}
                </View>
                {isPool ? (
                  <Text style={styles.helperText}>
                    Pool, submerged, and exterior exposure use Natural Shield as the current stocked penetrating sealer.
                  </Text>
                ) : null}
              </View>

              <WasteToggle value={form.wastePct} onChange={setWastePct} />

              {error && !error.includes('area') ? (
                <Text style={styles.error}>{error}</Text>
              ) : null}

              <Button
                label="Calculate"
                onPress={runCalculation}
                fullWidth
                size="lg"
              />
            </Card>

            {result ? (
              <View style={styles.resultSection}>
                <MaterialBreakdownCard result={result} />
                <MaterialRetailEstimateCard result={result} dealerContext={dealerContext} />
                <Button
                  label="Create Material Request"
                  onPress={createMaterialRequest}
                  disabled={creatingRequest}
                  fullWidth
                />
                <Button label="Reset" onPress={reset} variant="ghost" fullWidth />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  flex: { flex: 1 },
  scroll: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.xxxl + 44 },
  content: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    gap: Spacing.md,
  },
  infoCard: { gap: Spacing.md },
  calculatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  calculatorIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkTeal,
  },
  calculatorCopy: { flex: 1, gap: 4 },
  calculatorTitle: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  calculatorBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.sm * 1.35,
  },
  pointList: { gap: Spacing.sm },
  pointRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pointText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
    flex: 1,
  },
  formCard: { gap: Spacing.md },
  heading: {
    color: Colors.navy,
    fontSize: Typography.size.lg,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  subheading: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    marginTop: -Spacing.sm,
  },
  section: { gap: Spacing.sm },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.medium,
    textTransform: 'uppercase',
  },
  sealerRow: { flexDirection: 'row', gap: Spacing.sm },
  sealerBtn: { flex: 1 },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  scopeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  scopeBtn: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 132,
  },
  optionBtn: {
    flexGrow: 1,
    flexBasis: '31%',
    paddingHorizontal: Spacing.sm,
  },
  optionText: {
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.2,
  },
  membraneBtn: {
    flexGrow: 1,
    flexBasis: '46%',
  },
  warningNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#F4B4AE',
    backgroundColor: '#FFF2F0',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  warningText: {
    flex: 1,
    color: Colors.danger,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    lineHeight: Typography.size.sm * 1.35,
  },
  requiredMembrane: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C6EEF0',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  requiredMembraneCopy: { flex: 1, gap: 2 },
  requiredMembraneTitle: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  helperText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.xs * 1.35,
  },
  systemNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryMuted,
    borderColor: '#C6EEF0',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  systemNoteIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  systemNoteText: {
    flex: 1,
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    lineHeight: Typography.size.sm * 1.35,
  },
  error: { color: Colors.danger, fontSize: Typography.size.sm },
  resultSection: { gap: Spacing.md },
});
