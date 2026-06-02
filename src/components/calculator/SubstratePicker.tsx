import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SUBSTRATES, SubstrateId } from '@/constants/substrates';
import { Colors, Fonts, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';

interface SubstratePickerProps {
  selected: SubstrateId | null;
  onSelect: (id: SubstrateId) => void;
}

export function SubstratePicker({ selected, onSelect }: SubstratePickerProps) {
  return (
    <View>
      <Text style={styles.label}>Substrate Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {SUBSTRATES.map((sub) => {
          const isSelected = selected === sub.id;
          return (
            <TouchableOpacity
              key={sub.id}
              onPress={() => onSelect(sub.id)}
              style={[styles.chip, isSelected && styles.chipSelected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={sub.label}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {sub.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {selected && SUBSTRATES.find((s) => s.id === selected)?.notes ? (
        <Text style={styles.note}>
          Warning: {SUBSTRATES.find((s) => s.id === selected)!.notes}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: Spacing.sm,
  },
  scroll: { gap: Spacing.sm, paddingBottom: Spacing.xs },
  chip: {
    minHeight: TAP_TARGET_MIN,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: Colors.semcoOrange,
    backgroundColor: Colors.accentMuted,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
    fontWeight: Typography.weight.medium,
  },
  chipTextSelected: { color: Colors.semcoOrange },
  note: {
    marginTop: Spacing.sm,
    color: Colors.offlineAmber,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
    lineHeight: Typography.size.sm * 1.5,
  },
});
