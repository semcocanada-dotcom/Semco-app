import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

interface BatchCardProps {
  batchNumber: string;
  detail?: string;
  notes?: string | null;
  style?: ViewStyle;
}

export function BatchCard({ batchNumber, detail, notes, style }: BatchCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name="layers-outline" size={20} color={Colors.darkTeal} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Batch: {batchNumber}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        {notes ? <Text style={styles.notes}>{notes}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  copy: { flex: 1, gap: 3 },
  title: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  detail: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: Typography.size.sm },
  notes: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm },
});
