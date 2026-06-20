import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SUBSTRATE_MAP, VISIBLE_SUBSTRATES, SubstrateId } from '@/constants/substrates';
import { Colors, Fonts, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';

interface SubstratePickerProps {
  selected: SubstrateId | null;
  onSelect: (id: SubstrateId) => void;
}

export function SubstratePicker({ selected, onSelect }: SubstratePickerProps) {
  return (
    <View>
      <Text style={styles.label}>Substrate Type</Text>
      <View style={styles.grid}>
        {VISIBLE_SUBSTRATES.map((sub) => {
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
      </View>
      {selected && SUBSTRATE_MAP[selected]?.notes ? (
        <Text style={styles.note}>
          Note: {SUBSTRATE_MAP[selected].notes}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  chip: {
    minHeight: TAP_TARGET_MIN,
    flexGrow: 1,
    flexBasis: '30%',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1.5,
    borderColor: Colors.lightTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    borderColor: Colors.semcoOrange,
    backgroundColor: Colors.semcoOrange,
  },
  chipText: {
    color: Colors.darkTeal,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
    fontWeight: Typography.weight.medium,
  },
  chipTextSelected: { color: Colors.white },
  note: {
    marginTop: Spacing.sm,
    color: Colors.offlineAmber,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
    lineHeight: Typography.size.sm * 1.5,
  },
});
