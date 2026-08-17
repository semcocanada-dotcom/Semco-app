import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WASTE_PCT_MIN, WASTE_PCT_MAX, WASTE_PCT_STEP } from '@/constants/waste-factors';
import { Colors, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';

interface WasteToggleProps {
  value: number;
  onChange: (pct: number) => void;
}

export function WasteToggle({ value, onChange }: WasteToggleProps) {
  const decrement = () => onChange(Math.max(WASTE_PCT_MIN, value - WASTE_PCT_STEP));
  const increment = () => onChange(Math.min(WASTE_PCT_MAX, value + WASTE_PCT_STEP));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Waste Factor</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={decrement} style={styles.btn} accessibilityLabel="Decrease waste">
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{value}%</Text>
        </View>
        <TouchableOpacity onPress={increment} style={styles.btn} accessibilityLabel="Increase waste">
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>
        {value <= 10 ? 'Smooth substrate, experienced installer' :
         value <= 15 ? 'Standard allowance' :
         'Rough substrate, complex geometry, or training project'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  btn: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontWeight: Typography.weight.medium },
  valueBox: {
    minWidth: 72,
    height: TAP_TARGET_MIN,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { color: Colors.primary, fontSize: Typography.size.lg, fontWeight: Typography.weight.bold },
  hint: { color: Colors.textDisabled, fontSize: Typography.size.sm },
});
