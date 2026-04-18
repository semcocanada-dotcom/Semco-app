import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useCalculator } from '@/hooks/useCalculator';
import { Input, Button } from '@/components/ui';
import { SubstratePicker } from '@/components/calculator/SubstratePicker';
import { WasteToggle } from '@/components/calculator/WasteToggle';
import { MaterialBreakdownCard } from '@/components/calculator/MaterialBreakdownCard';
import { Colors, Typography, Spacing } from '@/constants/theme';

const SEALER_OPTIONS = [
  { sku: 'SEAL-2K-M', label: 'Matte' },
  { sku: 'SEAL-2K-S', label: 'Satin' },
  { sku: 'SEAL-2K-G', label: 'Gloss' },
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
          <Text style={styles.heading}>Coverage Calculator</Text>
          <Text style={styles.subheading}>
            Input your area and substrate to get the full material list.
          </Text>

          <View style={styles.section}>
            <Input
              label="Area"
              value={form.areaSqm}
              onChangeText={setAreaSqm}
              keyboardType="decimal-pad"
              placeholder="e.g. 45"
              suffix="m²"
              error={error && error.includes('area') ? error : undefined}
            />
          </View>

          <View style={styles.section}>
            <SubstratePicker selected={form.substrateType} onSelect={setSubstrate} />
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
                  style={styles.sealerBtn}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <WasteToggle value={form.wastePct} onChange={setWastePct} />
          </View>

          {error && !error.includes('area') ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <Button
            label="Calculate Materials"
            onPress={runCalculation}
            fullWidth
            size="lg"
          />

          {result && (
            <View style={styles.resultSection}>
              <MaterialBreakdownCard result={result} />
              <Button label="Reset" onPress={reset} variant="ghost" fullWidth />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { padding: Spacing.base, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  heading: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
  subheading: { color: Colors.textSecondary, fontSize: Typography.size.sm, marginTop: 2 },
  section: { gap: Spacing.sm },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sealerRow: { flexDirection: 'row', gap: Spacing.sm },
  sealerBtn: { flex: 1 },
  error: { color: Colors.danger, fontSize: Typography.size.sm },
  resultSection: { gap: Spacing.md },
});
