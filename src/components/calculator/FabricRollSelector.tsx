import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { getMaterialPrice } from '@/knowledge/material-pricing';

interface FabricRollSelectorProps {
  rolls: number;
  required: boolean;
  onChange: (rolls: number) => void;
}

export function FabricRollSelector({ rolls, required, onChange }: FabricRollSelectorProps) {
  const fabricPrice = getMaterialPrice('FR675');

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Fabric Reinforcement</Text>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.icon}>
            <Ionicons name="git-merge-outline" size={19} color={Colors.darkTeal} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>6 in × 75 ft roll</Text>
            <Text style={styles.meta}>
              {fabricPrice ? `$${fabricPrice.retailPriceCad.toFixed(2)} per roll` : 'Price shown in estimate'}
            </Text>
            <Text style={styles.helper}>
              {required
                ? 'Minimum 1 roll for measured cracks, board joints, inside corners, and transitions.'
                : 'Add rolls as needed for measured cracks, board joints, inside corners, or transitions.'}
            </Text>
          </View>
        </View>
        <View style={styles.controlRow}>
          <Text style={styles.selected} accessibilityLiveRegion="polite">
            {rolls === 0
              ? 'No rolls selected'
              : `${rolls * 75} linear ft selected`}
          </Text>
          <QuantityControl
            value={rolls}
            onChange={onChange}
            min={required ? 1 : 0}
            accessibilityLabel="fabric rolls"
          />
        </View>
      </View>
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
  },
  card: {
    borderWidth: 1,
    borderColor: '#C6EEF0',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  copy: { flex: 1, gap: 2 },
  title: { color: Colors.navy, fontSize: Typography.size.sm, fontFamily: Fonts.bold },
  meta: { color: Colors.semcoOrange, fontSize: Typography.size.xs, fontFamily: Fonts.semibold },
  helper: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.xs * 1.35,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#A9DDE0',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  selected: {
    flex: 1,
    color: Colors.darkTeal,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.semibold,
  },
});
