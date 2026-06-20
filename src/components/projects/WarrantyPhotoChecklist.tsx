import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card } from '@/components/ui';
import type { PhotoStage, ProjectPhoto } from '@/database/schema/projects';
import { getWarrantyPhotoStatus } from '@/services/warranty';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

interface WarrantyPhotoChecklistProps {
  photos: ProjectPhoto[];
  onAddPhoto: (stage: PhotoStage) => void;
  compact?: boolean;
}

export function WarrantyPhotoChecklist({ photos, onAddPhoto, compact = false }: WarrantyPhotoChecklistProps) {
  const status = useMemo(() => getWarrantyPhotoStatus(photos), [photos]);
  const percent = Math.round((status.completedCount / status.requiredCount) * 100);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Warranty Photo Record</Text>
          <Text style={styles.subtitle}>
            {status.completedCount}/{status.requiredCount} required stages photographed
          </Text>
        </View>
        <Badge
          label={status.isQualified ? 'Ready' : `${percent}%`}
          variant={status.isQualified ? 'success' : 'warning'}
        />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>

      {!compact ? (
        <Text style={styles.note}>
          Warranty review requires at least one clear photo for every required stage.
        </Text>
      ) : null}

      <View style={styles.stageList}>
        {status.stages.map((stage) => (
          <View key={stage.id} style={styles.stageRow}>
            <View style={[styles.stageIcon, stage.isComplete ? styles.stageIconDone : styles.stageIconMissing]}>
              <Ionicons
                name={stage.isComplete ? 'checkmark' : 'camera-outline'}
                size={16}
                color={stage.isComplete ? Colors.white : Colors.semcoOrange}
              />
            </View>
            <View style={styles.stageBody}>
              <Text style={styles.stageLabel}>{stage.label}</Text>
              <Text style={styles.stageMeta}>
                {stage.count > 0 ? `${stage.count} photo${stage.count === 1 ? '' : 's'}` : 'Required for warranty'}
              </Text>
            </View>
            {!stage.isComplete ? (
              <TouchableOpacity
                onPress={() => onAddPhoto(stage.id)}
                style={styles.addButton}
                accessibilityRole="button"
                accessibilityLabel={`Add warranty photo for ${stage.label}`}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  headerText: { flex: 1, gap: 3 },
  title: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.softGrey,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.semcoOrange,
  },
  note: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
    fontFamily: Fonts.regular,
  },
  stageList: { gap: Spacing.sm },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 50,
  },
  stageIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconDone: { backgroundColor: Colors.success },
  stageIconMissing: {
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.semcoOrange,
  },
  stageBody: { flex: 1, gap: 2 },
  stageLabel: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
  },
  stageMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
  },
  addButton: {
    minHeight: 36,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.lightTeal,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
  },
});
