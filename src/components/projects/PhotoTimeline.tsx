import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PHOTO_STAGES, type ProjectPhoto, type PhotoStage } from '@/database/schema/projects';
import { Button, EmptyState, TabControl } from '@/components/ui';
import { Colors, Fonts, Typography, Spacing, Radius } from '@/constants/theme';

interface PhotoTimelineProps {
  photos: ProjectPhoto[];
  onAddPhoto: (stage: PhotoStage) => void;
}

export function PhotoTimeline({ photos, onAddPhoto }: PhotoTimelineProps) {
  const [selectedStage, setSelectedStage] = useState<PhotoStage>('substrate');
  const { width } = useWindowDimensions();
  const tileSize = Math.max(130, Math.floor((Math.min(width, 430) - Spacing.base * 2 - Spacing.sm) / 2));

  const stageOptions = useMemo(
    () => PHOTO_STAGES.map((stage) => ({ value: stage.id, label: shortStageLabel(stage.label) })),
    [],
  );

  const visiblePhotos = photos.filter((photo) => photo.stage === selectedStage);
  const selectedLabel = PHOTO_STAGES.find((stage) => stage.id === selectedStage)?.label ?? 'Stage';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Photos by Stage</Text>
          <Text style={styles.subheading}>{selectedLabel}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onAddPhoto(selectedStage)}
          style={styles.iconButton}
          accessibilityLabel={`Add photo for ${selectedLabel}`}
        >
          <Ionicons name="camera-outline" size={20} color={Colors.darkTeal} />
        </TouchableOpacity>
      </View>

      <TabControl value={selectedStage} options={stageOptions} onChange={setSelectedStage} />

      {visiblePhotos.length > 0 ? (
        <View style={styles.grid}>
          {visiblePhotos.map((photo) => (
            <Image
              key={photo.id}
              source={{ uri: photo.photoUrl }}
              style={[styles.thumb, { width: tileSize, height: tileSize * 1.08 }]}
              contentFit="cover"
              transition={200}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="camera-outline"
          title="No photos for this stage"
          body="Add photos as work progresses to keep the project record clean."
        />
      )}

      <Button label="Add Photo" variant="primary" onPress={() => onAddPhoto(selectedStage)} fullWidth />
    </View>
  );
}

function shortStageLabel(label: string) {
  return label
    .replace('Substrate / Prep', 'Prep')
    .replace('Liquid Membrane / Primer', 'Membrane')
    .replace('Scratch / Base Coat', 'Base')
    .replace('Finish Coat', 'Finish')
    .replace('Sealer Applied', 'Sealer')
    .replace('Final / Handover', 'Final');
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  heading: {
    color: Colors.navy,
    fontSize: Typography.size.lg,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  subheading: {
    color: Colors.semcoOrange,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  thumb: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
  },
});
