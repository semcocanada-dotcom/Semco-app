import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalculator } from '@/hooks/useCalculator';
import { AppHeader, Button, Card, Input } from '@/components/ui';
import { MaterialBreakdownCard } from '@/components/calculator/MaterialBreakdownCard';
import { SubstratePicker } from '@/components/calculator/SubstratePicker';
import { WasteToggle } from '@/components/calculator/WasteToggle';
import { SEALER_OPTIONS, XBOND_FINISH_OPTIONS } from '@/constants/product-coverage';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';

const ESTIMATOR_POINTS = [
  'X-Bond Stone plus required X-Bond Liquid',
  'Liquid Membrane included by system',
  'Sealer coverage on X-Bond surface',
  'Optional MicroBond smooth finish',
];

export default function CalculatorScreen() {
  const {
    form,
    result,
    error,
    setAreaSqft,
    setSubstrate,
    setWastePct,
    setSealerSku,
    setFinishSku,
    runCalculation,
    reset,
  } = useCalculator();

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

              <View style={styles.systemNote}>
                <View style={styles.systemNoteIcon}>
                  <Ionicons name="water-outline" size={18} color={Colors.darkTeal} />
                </View>
                <Text style={styles.systemNoteText}>
                  Liquid Membrane is included by default. Pool uses the wet-area rate automatically.
                </Text>
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
                    />
                  ))}
                </View>
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
  optionBtn: {
    flexGrow: 1,
    flexBasis: '31%',
    paddingHorizontal: Spacing.sm,
  },
  optionText: {
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.2,
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
