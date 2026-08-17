import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PHOTO_STAGES, type ProjectPhoto, type PhotoStage } from '@/database/schema/projects';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface PhotoTimelineProps {
  photos: ProjectPhoto[];
  onAddPhoto: (stage: PhotoStage) => void;
}

export function PhotoTimeline({ photos, onAddPhoto }: PhotoTimelineProps) {
  const photosByStage = Object.fromEntries(
    PHOTO_STAGES.map((s) => [s.id, photos.filter((p) => p.stage === s.id)]),
  ) as Record<PhotoStage, ProjectPhoto[]>;

  return (
    <View>
      <Text style={styles.heading}>Progress Photos</Text>
      {PHOTO_STAGES.map((stage) => {
        const stagePhotos = photosByStage[stage.id as PhotoStage] ?? [];
        return (
          <View key={stage.id} style={styles.stageBlock}>
            <View style={styles.stageHeader}>
              <View style={[styles.stageDot, stagePhotos.length > 0 && styles.stageDotDone]} />
              <Text style={styles.stageLabel}>{stage.label}</Text>
              <TouchableOpacity
                onPress={() => onAddPhoto(stage.id as PhotoStage)}
                style={styles.addBtn}
                accessibilityLabel={`Add photo for ${stage.label}`}
              >
                <Ionicons name="camera-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {stagePhotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
                {stagePhotos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.photoUrl }}
                    style={styles.thumb}
                    contentFit="cover"
                    transition={200}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: Colors.textPrimary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
  },
  stageBlock: { marginBottom: Spacing.md },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    borderWidth: 2,
    borderColor: Colors.textDisabled,
  },
  stageDotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stageLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    flex: 1,
  },
  addBtn: { padding: Spacing.xs },
  photoRow: { marginLeft: Spacing.lg },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
  },
});
