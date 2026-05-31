import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { projects, projects_photos } from '@/database/schema/projects';
import { batchLogs } from '@/database/schema/batches';
import type { Project, ProjectPhoto, PhotoStage } from '@/database/schema/projects';
import type { BatchLog } from '@/database/schema/batches';
import { PhotoTimeline } from '@/components/projects/PhotoTimeline';
import { Card, Badge } from '@/components/ui';
import { captureProgressPhoto, uploadPhoto } from '@/services/camera';
import { useAuthStore } from '@/store/auth';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  on_hold: 'warning',
  complete: 'neutral',
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [batches, setBatches] = useState<BatchLog[]>([]);

  const load = useCallback(() => {
    if (!id) return;
    db.select().from(projects).where(eq(projects.id, id)).then((rows) => setProject(rows[0] ?? null));
    db.select().from(projects_photos).where(eq(projects_photos.projectId, id)).then(setPhotos);
    db.select().from(batchLogs).where(eq(batchLogs.projectId, id)).then(setBatches);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAddPhoto = async (stage: PhotoStage) => {
    const photo = await captureProgressPhoto();
    if (!photo || !id) return;

    const photoId = `photo-${Date.now()}`;
    let photoUrl = photo.localUri;

    // Upload in background if online; store local URI immediately
    uploadPhoto(photo.localUri, 'project-photos', `${user?.id ?? 'local'}/${id}/${stage}/${photoId}.jpg`)
      .then((url) => {
        if (url) {
          db.update(projects_photos)
            .set({ photoUrl: url })
            .where(eq(projects_photos.id, photoId))
            .execute();
        }
      });

    await db.insert(projects_photos).values({
      id: photoId,
      projectId: id,
      installerId: user?.id ?? 'local',
      stage,
      photoUrl,
      takenAt: new Date().toISOString(),
    });

    load();
  };

  const handleMarkComplete = () => {
    if (!id) return;
    Alert.alert('Mark Complete', 'Mark this project as complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          await db.update(projects)
            .set({ status: 'complete', updatedAt: new Date().toISOString() })
            .where(eq(projects.id, id));
          load();
        },
      },
    ]);
  };

  if (!project) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Badge
            label={project.status.replace(/_/g, ' ')}
            variant={STATUS_BADGE[project.status] ?? 'neutral'}
          />
        </View>

        <Text style={styles.clientName}>{project.clientName ?? 'Unnamed Project'}</Text>
        {project.siteAddress ? <Text style={styles.address}>{project.siteAddress}</Text> : null}

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/takeoff', params: { projectId: project.id } } as any)} style={styles.actionPill}>
            <Ionicons name="layers-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionPillText}>Takeoff</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/orders', params: { projectId: project.id } } as any)} style={styles.actionPill}>
            <Ionicons name="cart-outline" size={16} color={Colors.accent} />
            <Text style={styles.actionPillText}>Order review</Text>
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={styles.sectionLabel}>Application Spec</Text>
          {project.substrateType ? (
            <InfoRow label="Substrate" value={project.substrateType.replace(/_/g, ' ')} />
          ) : null}
          {project.totalAreaSqm != null ? (
            <InfoRow label="Area" value={`${project.totalAreaSqm} m²`} />
          ) : null}
          {project.finishType ? (
            <InfoRow label="Finish" value={project.finishType} />
          ) : null}
        </Card>

        <Card>
          <Text style={styles.sectionLabel}>Client Contact</Text>
          {project.clientEmail ? <InfoRow label="Email" value={project.clientEmail} /> : null}
          {project.clientPhone ? <InfoRow label="Phone" value={project.clientPhone} /> : null}
        </Card>

        <PhotoTimeline photos={photos} onAddPhoto={handleAddPhoto} />

        {batches.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>Batch Log</Text>
            {batches.map((b) => (
              <Card key={b.id} style={styles.batchCard}>
                <Text style={styles.batchNumber}>Batch: {b.batchNumber}</Text>
                <Text style={styles.batchDetail}>
                  {b.quantityKg != null ? `${b.quantityKg} kg` : ''}{b.coverageAchievedSqm != null ? ` · ${b.coverageAchievedSqm} m²` : ''}
                </Text>
                {b.notes ? <Text style={styles.batchNotes}>{b.notes}</Text> : null}
              </Card>
            ))}
          </View>
        )}

        {project.status === 'active' && (
          <TouchableOpacity onPress={handleMarkComplete} style={styles.completeBtn}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
            <Text style={styles.completeBtnText}>Mark as Complete</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientName: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
  address: { color: Colors.textSecondary, fontSize: Typography.size.base, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionPillText: { color: Colors.textPrimary, fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    color: Colors.textPrimary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.sm,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  infoLabel: { color: Colors.textSecondary, fontSize: Typography.size.base },
  infoValue: { color: Colors.textPrimary, fontSize: Typography.size.base, fontWeight: Typography.weight.medium },
  batchCard: { marginBottom: Spacing.sm },
  batchNumber: { color: Colors.primary, fontSize: Typography.size.base, fontWeight: Typography.weight.semibold },
  batchDetail: { color: Colors.textSecondary, fontSize: Typography.size.sm },
  batchNotes: { color: Colors.textSecondary, fontSize: Typography.size.sm, marginTop: 2 },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  completeBtnText: { color: Colors.success, fontSize: Typography.size.base, fontWeight: Typography.weight.semibold },
  loading: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl },
});
