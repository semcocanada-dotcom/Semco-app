import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCalculator } from '@/hooks/useCalculator';
import { AppHeader, Button, Card, Input } from '@/components/ui';
import { MaterialBreakdownCard } from '@/components/calculator/MaterialBreakdownCard';
import { SubstratePicker } from '@/components/calculator/SubstratePicker';
import { WasteToggle } from '@/components/calculator/WasteToggle';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

const SEALER_OPTIONS = [
  { sku: 'SEAL-2K-M', label: 'Matte' },
  { sku: 'SEAL-2K-S', label: 'Satin' },
  { sku: 'SEAL-2K-G', label: 'Gloss' },
];

const CALCULATOR_LIST = [
  { title: 'Coverage Calculator', body: 'Calculate coverage by area and product', icon: 'calculator-outline' as const },
  { title: 'Material Estimator', body: 'Estimate materials and quantities', icon: 'reader-outline' as const },
  { title: 'Mix Ratio Calculator', body: 'Calculate mix ratios and component amounts', icon: 'beaker-outline' as const },
  { title: 'Cost Calculator', body: 'Estimate project costs and budget', icon: 'cash-outline' as const },
];

export default function CalculatorScreen() {
  const {
    form,
    result,
    error,
    setAreaSqm,
    setSubstrate,
    setWastePct,
    setSealerSku,
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
          <AppHeader title="Calculators" subtitle="Fast field math for estimating and planning." rightIcon="ellipsis-vertical" />

          <View style={styles.calculatorList}>
            {CALCULATOR_LIST.map((item) => (
              <Card key={item.title} style={styles.calculatorRow}>
                <View style={styles.calculatorIcon}>
                  <Ionicons name={item.icon} size={24} color={Colors.white} />
                </View>
                <View style={styles.calculatorCopy}>
                  <Text style={styles.calculatorTitle}>{item.title}</Text>
                  <Text style={styles.calculatorBody}>{item.body}</Text>
                </View>
              </Card>
            ))}
          </View>

          <Card style={styles.formCard}>
            <Text style={styles.heading}>Coverage Calculator</Text>
            <Text style={styles.subheading}>
              Input your area and substrate to get the full material list.
            </Text>

            <Input
              label="Area"
              value={form.areaSqm}
              onChangeText={setAreaSqm}
              keyboardType="decimal-pad"
              placeholder="e.g. 45"
              suffix="m2"
              error={error && error.includes('area') ? error : undefined}
            />

            <SubstratePicker selected={form.substrateType} onSelect={setSubstrate} />

            <View style={styles.section}>
              <Text style={styles.label}>Sealer Finish</Text>
              <View style={styles.sealerRow}>
                {SEALER_OPTIONS.map((opt) => (
                  <Button
                    key={opt.sku}
                    label={opt.label}
                    onPress={() => setSealerSku(opt.sku)}
                    variant={form.sealerSku === opt.sku ? 'primary' : 'secondary'}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  flex: { flex: 1 },
  scroll: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.xxxl + 44 },
  calculatorList: { gap: Spacing.sm },
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
  error: { color: Colors.danger, fontSize: Typography.size.sm },
  resultSection: { gap: Spacing.md },
});
