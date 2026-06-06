import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { batchLogs } from '@/database/schema/batches';
import { projects, projects_photos } from '@/database/schema/projects';
import type { BatchLog } from '@/database/schema/batches';
import type { PhotoStage, Project, ProjectPhoto } from '@/database/schema/projects';
import { PhotoTimeline } from '@/components/projects/PhotoTimeline';
import { captureProgressPhoto, uploadPhoto } from '@/services/camera';
import { useAuthStore } from '@/store/auth';
import { Badge, BatchCard, Button, Card, EmptyState, TabControl } from '@/components/ui';
import { formatSqftFromSqm } from '@/utils/area';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

type DetailTab = 'overview' | 'photos' | 'batches' | 'warranty';

const DETAIL_TABS: { value: DetailTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'photos', label: 'Photos' },
  { value: 'batches', label: 'Batches' },
  { value: 'warranty', label: 'Warranty' },
];

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'In Progress', variant: 'success' },
  on_hold: { label: 'Planning', variant: 'warning' },
  complete: { label: 'Completed', variant: 'neutral' },
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [batches, setBatches] = useState<BatchLog[]>([]);
  const [tab, setTab] = useState<DetailTab>('overview');

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
    const photoUrl = photo.localUri;

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

  const status = project ? STATUS_BADGE[project.status] ?? STATUS_BADGE.active : STATUS_BADGE.active;
  const heroPhoto = photos[0]?.photoUrl;
  const title = project?.clientName ?? 'Unnamed Project';
  const batchSummary = useMemo(() => {
    const kg = batches.reduce((sum, batch) => sum + (batch.quantityKg ?? 0), 0);
    return { count: batches.length, kg };
  }, [batches]);

  if (!project) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.roundButton} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={Colors.semcoOrange} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Project Detail</Text>
          <TouchableOpacity style={styles.roundButton} accessibilityLabel="More project options">
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.navy} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          {heroPhoto ? (
            <Image source={{ uri: heroPhoto }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="business-outline" size={42} color={Colors.white} />
            </View>
          )}
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle} numberOfLines={1}>{title}</Text>
            <Badge label={status.label} variant={status.variant} />
          </View>
        </View>

        <TabControl value={tab} options={DETAIL_TABS} onChange={setTab} />

        {tab === 'overview' ? (
          <>
            <Card style={styles.infoCard}>
              <InfoRow icon="person-outline" label="Client" value={project.clientName ?? 'Not set'} />
              <InfoRow icon="location-outline" label="Address" value={project.siteAddress ?? 'No address yet'} />
              <InfoRow icon="briefcase-outline" label="Job Number" value={project.id} />
              <InfoRow icon="layers-outline" label="System" value={project.substrateType?.replace(/_/g, ' ') ?? 'Not set'} />
              <InfoRow icon="color-filter-outline" label="Finish" value={project.finishType ?? 'Not set'} />
              <InfoRow icon="shield-checkmark-outline" label="Sealer" value={project.sealerProductId ?? 'Not set'} />
              <InfoRow icon="calendar-outline" label="Start Date" value={new Date(project.createdAt).toLocaleDateString()} />
              <InfoRow icon="pulse-outline" label="Status" value={status.label} />
            </Card>

            <View style={styles.quickActions}>
              <QuickAction icon="triangle-outline" label="Takeoff" onPress={() => router.push({ pathname: '/takeoff', params: { projectId: project.id } } as any)} />
              <QuickAction icon="receipt-outline" label="Batch Log" onPress={() => setTab('batches')} />
              <QuickAction icon="shield-checkmark-outline" label="Warranty" onPress={() => setTab('warranty')} />
            </View>

            {project.status === 'active' ? (
              <Button label="Mark as Complete" variant="secondary" onPress={handleMarkComplete} fullWidth />
            ) : null}
          </>
        ) : null}

        {tab === 'photos' ? <PhotoTimeline photos={photos} onAddPhoto={handleAddPhoto} /> : null}

        {tab === 'batches' ? (
          <View style={styles.section}>
            <View style={styles.metricRow}>
              <Metric label="Batches" value={String(batchSummary.count)} />
              <Metric label="kg Used" value={batchSummary.kg.toFixed(1)} />
            </View>
            {batches.length > 0 ? (
              batches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batchNumber={batch.batchNumber}
                  detail={`${batch.quantityKg ?? 0} kg${batch.coverageAchievedSqm != null ? ` - ${formatSqftFromSqm(batch.coverageAchievedSqm)}` : ''}`}
                  notes={batch.notes}
                />
              ))
            ) : (
              <EmptyState icon="receipt-outline" title="No batches logged" body="Batch records will appear here when they are added to this project." />
            )}
            <Button label="Add Batch" variant="primary" onPress={() => router.push({ pathname: '/orders', params: { projectId: project.id } } as any)} fullWidth />
          </View>
        ) : null}

        {tab === 'warranty' ? (
          <Card style={styles.infoCard}>
            <InfoRow icon="shield-outline" label="Warranty Issued" value={project.warrantyIssued ? 'Yes' : 'No'} />
            <InfoRow icon="calendar-outline" label="Completion Date" value={project.completionDate ?? 'Not complete yet'} />
            <InfoRow icon="document-text-outline" label="Notes" value={project.notes ?? 'No notes yet'} />
            <Button label="Open Order Review" variant="secondary" onPress={() => router.push({ pathname: '/orders', params: { projectId: project.id } } as any)} fullWidth />
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelWrap}>
        <Ionicons name={icon} size={17} color={Colors.navy} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={styles.quickAction}>
      <Ionicons name={icon} size={24} color={Colors.semcoOrange} />
      <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.xxxl + 44 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  screenTitle: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  hero: {
    minHeight: 178,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.darkTeal,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.darkTeal,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.md,
    backgroundColor: 'rgba(0,35,45,0.22)',
    gap: Spacing.sm,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: Typography.size.lg,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  infoCard: { gap: Spacing.sm },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  infoLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
  },
  infoValue: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    textAlign: 'right',
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    minHeight: 82,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionText: {
    color: Colors.navy,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.semibold,
  },
  section: { gap: Spacing.md },
  metricRow: { flexDirection: 'row', gap: Spacing.sm },
  metric: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    color: Colors.navy,
    fontSize: Typography.size.xl,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.medium,
  },
  loading: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl },
});
