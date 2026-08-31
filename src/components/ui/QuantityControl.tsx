import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Typography } from '@/constants/theme';

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  accessibilityLabel?: string;
}

export function QuantityControl({
  value,
  onChange,
  min = 0,
  step = 1,
  accessibilityLabel = 'quantity',
}: QuantityControlProps) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(value + step);
  const atMinimum = value <= min;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={decrement}
        style={[styles.button, atMinimum && styles.buttonDisabled]}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${accessibilityLabel}`}
        accessibilityState={{ disabled: atMinimum }}
        disabled={atMinimum}
      >
        <Ionicons name="remove" size={18} color={Colors.navy} />
      </TouchableOpacity>
      <Text style={styles.value} accessibilityLabel={`${value} ${accessibilityLabel}`}>{value}</Text>
      <TouchableOpacity
        onPress={increment}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${accessibilityLabel}`}
      >
        <Ionicons name="add" size={18} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    overflow: 'hidden',
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.semcoOrange,
  },
  buttonDisabled: { opacity: 0.42 },
  value: {
    minWidth: 48,
    textAlign: 'center',
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.base,
  },
});
