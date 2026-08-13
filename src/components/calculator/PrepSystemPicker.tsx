import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  getAvailablePrepSystems,
  isPrepConditionLocked,
  type PrepConditionId,
} from '@/constants/prep-systems';
import type { SubstrateId } from '@/constants/substrates';
import { Colors, Fonts, Radius, Spacing, TAP_TARGET_MIN, Typography } from '@/constants/theme';

interface PrepSystemPickerProps {
  substrate: SubstrateId;
  selected: PrepConditionId;
  onSelect: (id: PrepConditionId) => void;
}

export function PrepSystemPicker({ substrate, selected, onSelect }: PrepSystemPickerProps) {
  const systems = getAvailablePrepSystems(substrate);
  const locked = isPrepConditionLocked(substrate);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Surface condition / SIP prep</Text>
      <Text style={styles.help}>
        Choose the actual condition. The calculator uses the SIP cleaning order and the 2026 dealer planning coverage for each required pass.
      </Text>

      <View style={styles.options} accessibilityRole="radiogroup">
        {systems.map((system) => {
          const checked = selected === system.id;
          return (
            <TouchableOpacity
              key={system.id}
              accessibilityRole="radio"
              accessibilityState={{ checked, disabled: locked }}
              accessibilityLabel={`${system.sipType ? `SIP Type ${system.sipType}: ` : ''}${system.label}`}
              disabled={locked}
              onPress={() => onSelect(system.id)}
              style={[styles.option, checked && styles.optionSelected, locked && styles.optionLocked]}
            >
              <View style={styles.optionHeader}>
                {system.sipType ? (
                  <View style={[styles.typeBadge, checked && styles.typeBadgeSelected]}>
                    <Text style={[styles.typeText, checked && styles.typeTextSelected]}>{system.sipType}</Text>
                  </View>
                ) : null}
                <Text style={[styles.optionTitle, checked && styles.optionTitleSelected]}>{system.label}</Text>
              </View>
              <Text style={[styles.optionBody, checked && styles.optionBodySelected]}>{system.useWhen}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {locked ? (
        <Text style={styles.lockedNote}>This prep type is required by the selected substrate/system detail.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.sm },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  help: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.xs * 1.4,
  },
  options: { gap: Spacing.sm },
  option: {
    minHeight: TAP_TARGET_MIN,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  optionSelected: {
    borderColor: Colors.darkTeal,
    backgroundColor: Colors.primaryMuted,
  },
  optionLocked: { opacity: 0.92 },
  optionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typeBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.softGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeSelected: { backgroundColor: Colors.darkTeal },
  typeText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  typeTextSelected: { color: Colors.white },
  optionTitle: {
    flex: 1,
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  optionTitleSelected: { color: Colors.darkTeal },
  optionBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.xs * 1.35,
  },
  optionBodySelected: { color: Colors.navy },
  lockedNote: {
    color: Colors.offlineAmber,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.semibold,
    lineHeight: Typography.size.xs * 1.35,
  },
});
