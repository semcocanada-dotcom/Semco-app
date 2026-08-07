import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { batchLogs } from '@/database/schema/batches';
import { calculations } from '@/database/schema/calculations';
import colorsData from '@/database/seed/colors.json';
import { projects, projects_photos } from '@/database/schema/projects';
import { orderRequests } from '@/database/schema/workflow';
import { projectSignoffs } from '@/database/schema/signoffs';
import { warrantyReviews } from '@/database/schema/installers';
import type { BatchLog } from '@/database/schema/batches';
import type { Calculation, CalculationResult } from '@/database/schema/calculations';
import type { Color } from '@/database/schema/colors';
import type { PhotoStage, Project, ProjectPhoto } from '@/database/schema/projects';
import type { OrderRequest } from '@/database/schema/workflow';
import type { ProjectSignoff } from '@/database/schema/signoffs';
import type { InstallerProfile, WarrantyReview } from '@/database/schema/installers';
import { FormulaDisplay } from '@/components/colors/FormulaDisplay';
import { ColorSwatch } from '@/components/colors/ColorSwatch';
import { MaterialBreakdownCard } from '@/components/calculator/MaterialBreakdownCard';
import { MaterialRetailEstimateCard } from '@/components/calculator/MaterialRetailEstimateCard';
import { PhotoTimeline } from '@/components/projects/PhotoTimeline';
import { ProjectSignoffPanel } from '@/components/projects/ProjectSignoffPanel';
import { WarrantyPhotoChecklist } from '@/components/projects/WarrantyPhotoChecklist';
import { captureProgressPhoto, pickProgressPhoto, persistProjectPhoto, type CapturedPhoto } from '@/services/camera';
import { getWarrantyPhotoStatus, getWarrantySummaryText } from '@/services/warranty';
import { useAuthStore } from '@/store/auth';
import { Badge, BatchCard, Button, Card, EmptyState, Input, StatCard, TabControl } from '@/components/ui';
import { resolveDealerContext } from '@/constants/dealers';
import { STOCKED_SEALERS } from '@/constants/stocked-sealers';
import { getInstallerProfile, profileToDealerInput } from '@/services/installer-profile';
import { formatSqftFromSqm, sqftToSqm } from '@/utils/area';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';
import { createLocalId } from '@/utils/id';
import { fetchProjectWorkspaceFromCloud, hydrateProjectFromCloud, syncBatchLogToCloud, syncProjectPhotoToCloud, syncProjectToCloud, syncWarrantyReviewToCloud } from '@/services/cloud-sync';
import { createPrivateFileUrl } from '@/services/private-storage';

type DetailTab = 'job' | 'spec' | 'materials' | 'photos' | 'forms';

const DETAIL_TABS: { value: DetailTab; label: string }[] = [
  { value: 'job', label: 'Job' },
  { value: 'spec', label: 'Spec' },
  { value: 'materials', label: 'Materials' },
  { value: 'photos', label: 'Photos' },
  { value: 'forms', label: 'Forms' },
];

type DashboardAction = 'calculator' | 'materials' | 'photos' | 'complete' | 'none';

type DashboardNextStep = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
  buttonLabel: string;
  action: DashboardAction;
  variant: 'primary' | 'secondary';
};

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'In Progress', variant: 'success' },
  on_hold: { label: 'Planning', variant: 'warning' },
  complete: { label: 'Completed', variant: 'neutral' },
};

const STANDARD_COLORS = colorsData as Color[];

function mergeById<T extends { id: string }>(localRows: T[], cloudRows: T[]) {
  const merged = new Map(localRows.map((row) => [row.id, row]));
  for (const row of cloudRows) merged.set(row.id, row);
  return [...merged.values()];
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const projectId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
  const [batches, setBatches] = useState<BatchLog[]>([]);
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [orderRequest, setOrderRequest] = useState<OrderRequest | null>(null);
  const [warrantyReview, setWarrantyReview] = useState<WarrantyReview | null>(null);
  const [signoffs, setSignoffs] = useState<ProjectSignoff[]>([]);
  const [profile, setProfile] = useState<InstallerProfile | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [tab, setTab] = useState<DetailTab>('job');
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchProduct, setBatchProduct] = useState('X-Bond Stone');
  const [batchNumber, setBatchNumber] = useState('');
  const [batchQuantityKg, setBatchQuantityKg] = useState('');
  const [batchCoverageSqft, setBatchCoverageSqft] = useState('');
  const [batchNotes, setBatchNotes] = useState('');
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isSavingBatch, setSavingBatch] = useState(false);
  const [isSubmittingWarranty, setSubmittingWarranty] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setIsLoadingProject(false);
      return;
    }
    setIsLoadingProject(true);
    try {
      let projectRow: Project | null = (await db.select().from(projects).where(eq(projects.id, projectId)).limit(1))[0] ?? null;
      if (!projectRow && user?.id) {
        projectRow = await hydrateProjectFromCloud(projectId, user.id);
      }
      const [photoRows, batchRows, calcRows, requestRows, warrantyRows, signoffRows] = await Promise.all([
        db.select().from(projects_photos).where(eq(projects_photos.projectId, projectId)),
        db.select().from(batchLogs).where(eq(batchLogs.projectId, projectId)),
        db.select().from(calculations).where(eq(calculations.projectId, projectId)).orderBy(desc(calculations.createdAt)).limit(1),
        db.select().from(orderRequests).where(eq(orderRequests.projectId, projectId)).orderBy(desc(orderRequests.createdAt)).limit(1),
        db.select().from(warrantyReviews).where(eq(warrantyReviews.projectId, projectId)).orderBy(desc(warrantyReviews.createdAt)).limit(1),
        db.select().from(projectSignoffs).where(eq(projectSignoffs.projectId, projectId)).orderBy(desc(projectSignoffs.updatedAt)),
      ]);
      const cloudWorkspace = user?.id
        ? await fetchProjectWorkspaceFromCloud(projectId, user.id).catch((error) => {
          console.error('[project] cloud workspace refresh failed; showing offline records', error);
          return null;
        })
        : null;
      setProject(projectRow);
      setPhotos(mergeById(photoRows, cloudWorkspace?.photos ?? []));
      setBatches(mergeById(batchRows, cloudWorkspace?.batches ?? []));
      setCalculation(cloudWorkspace?.calculation ?? calcRows[0] ?? null);
      setOrderRequest(cloudWorkspace?.orderRequest ?? requestRows[0] ?? null);
      setWarrantyReview(cloudWorkspace?.warrantyReview ?? warrantyRows[0] ?? null);
      setSignoffs(mergeById(signoffRows, cloudWorkspace?.signoffs ?? []));
    } catch (error) {
      console.error(error);
      setProject(null);
    } finally {
      setIsLoadingProject(false);
    }
  }, [projectId, user?.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getInstallerProfile(user?.id ?? 'local').then(setProfile).catch(console.error);
  }, [user?.id]);

  const saveStagePhoto = async (stage: PhotoStage, photo: CapturedPhoto | null) => {
    if (!photo || !projectId) return;
    try {
      const photoId = createLocalId('photo');
      const photoUrl = await persistProjectPhoto(photo.localUri, photoId);
      const createdPhoto = {
        id: photoId,
        projectId,
        installerId: user?.id ?? project?.installerId ?? '',
        stage,
        photoUrl,
        storagePath: null,
        caption: null,
        takenAt: new Date().toISOString(),
      };
      await db.insert(projects_photos).values(createdPhoto);
      const syncResult = await syncProjectPhotoToCloud(createdPhoto);
      await load();
      if (!syncResult.ok) {
        Alert.alert(
          'Photo saved on this device',
          'The cloud upload is still pending. Keep the app online and retry the warranty submission before leaving the job.',
        );
      }
    } catch (error) {
      console.error('[project] photo save failed', error);
      Alert.alert('Photo not saved', 'The stage photo could not be added. Please try again.');
    }
  };

  const handleAddPhoto = (stage: PhotoStage) => {
    if (Platform.OS === 'web') {
      void pickProgressPhoto().then((photo) => saveStagePhoto(stage, photo));
      return;
    }

    Alert.alert('Add stage photo', 'Take a new photo or choose one already saved on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Choose Existing', onPress: () => { void pickProgressPhoto().then((photo) => saveStagePhoto(stage, photo)); } },
      { text: 'Take Photo', onPress: () => { void captureProgressPhoto().then((photo) => saveStagePhoto(stage, photo)); } },
    ]);
  };

  const handleSaveBatch = async () => {
    if (!project) return;
    if (!batchProduct.trim() || !batchNumber.trim()) {
      setBatchError('Product and batch or lot number are required.');
      return;
    }

    setBatchError(null);
    setSavingBatch(true);
    try {
      const quantityKg = Number.parseFloat(batchQuantityKg);
      const coverageSqft = Number.parseFloat(batchCoverageSqft);
      const createdBatch: BatchLog = {
        id: createLocalId('batch'),
        projectId: project.id,
        productId: batchProduct.trim(),
        batchNumber: batchNumber.trim(),
        quantityKg: Number.isFinite(quantityKg) ? quantityKg : null,
        coverageAchievedSqm: Number.isFinite(coverageSqft) ? sqftToSqm(coverageSqft) : null,
        appliedAt: new Date().toISOString(),
        notes: batchNotes.trim() || null,
      };
      await db.insert(batchLogs).values(createdBatch);
      const cloudResult = await syncBatchLogToCloud(createdBatch);
      if (!cloudResult.ok) {
        Alert.alert(
          'Batch saved on this device',
          'The cloud copy is still pending. Reconnect before submitting the project for warranty review.',
        );
      }
      setBatchNumber('');
      setBatchQuantityKg('');
      setBatchCoverageSqft('');
      setBatchNotes('');
      setShowBatchForm(false);
      load();
    } catch (error) {
      console.error('[project] batch save failed', error);
      setBatchError('This batch could not be saved. Try again.');
    } finally {
      setSavingBatch(false);
    }
  };

  const status = project ? STATUS_BADGE[project.status] ?? STATUS_BADGE.active : STATUS_BADGE.active;
  const heroPhoto = photos[0]?.photoUrl;
  const title = project?.clientName ?? 'Unnamed Project';
  const batchSummary = useMemo(() => {
    const kg = batches.reduce((sum, batch) => sum + (batch.quantityKg ?? 0), 0);
    return { count: batches.length, kg };
  }, [batches]);
  const warrantyPhotoStatus = useMemo(() => getWarrantyPhotoStatus(photos), [photos]);
  const warrantySummary = useMemo(() => getWarrantySummaryText(warrantyPhotoStatus), [warrantyPhotoStatus]);
  const selectedColor = useMemo(
    () => STANDARD_COLORS.find((color) => color.id === project?.selectedColorId || color.code === project?.selectedColorId) ?? null,
    [project?.selectedColorId],
  );
  const selectedSealer = useMemo(
    () => STOCKED_SEALERS.find((sealer) => sealer.sku === project?.sealerProductId) ?? null,
    [project?.sealerProductId],
  );
  const calculationResult = useMemo(() => {
    const value = calculation?.result;
    return value && typeof value === 'object' ? value as CalculationResult : null;
  }, [calculation]);
  const dealerContext = useMemo(
    () => {
      const profileDealer = resolveDealerContext(profileToDealerInput(profile));
      if (profileDealer.dealerId) return profileDealer;
      return resolveDealerContext({ projectAddress: project?.siteAddress });
    },
    [profile, project?.siteAddress],
  );

  const submitWarrantyReview = async () => {
    if (!project || isSubmittingWarranty) return;
    if (!warrantyPhotoStatus.isQualified) {
      Alert.alert('Stage photos incomplete', 'Add one clear photo for every required warranty stage before submitting this project.');
      return;
    }

    setSubmittingWarranty(true);
    try {
      const pendingUploads = photos.filter((photo) => !photo.storagePath);
      if (pendingUploads.length > 0) {
        const uploadResults = await Promise.all(pendingUploads.map(syncProjectPhotoToCloud));
        if (uploadResults.some((result) => !result.ok)) {
          await load();
          Alert.alert(
            'Photos still uploading',
            'At least one warranty photo is not in the cloud yet. Check your connection and submit again so Semco receives the complete project record.',
          );
          return;
        }
      }

    const now = new Date().toISOString();
    const products = [
      selectedColor ? `Colour: ${selectedColor.name}${selectedColor.code ? ` (${selectedColor.code})` : ''}` : null,
      selectedSealer ? `Sealer: ${selectedSealer.productName}` : null,
      calculationResult ? `${calculationResult.layers.length} calculated material line${calculationResult.layers.length === 1 ? '' : 's'}` : null,
    ].filter(Boolean).join(' | ');

    if (warrantyReview) {
      const updatedReview = {
        ...warrantyReview,
        status: 'in_review',
        productsSummary: products || warrantyReview.productsSummary,
        updatedAt: now,
      } as WarrantyReview;
      const syncResult = await syncWarrantyReviewToCloud(updatedReview);
      if (!syncResult.ok) throw new Error(syncResult.error || 'Warranty review upload failed');
      await db.update(warrantyReviews)
        .set(updatedReview)
        .where(eq(warrantyReviews.id, warrantyReview.id));
    } else {
      const createdReview = {
        id: createLocalId('warranty'),
        projectId: project.id,
        installerId: project.installerId,
        status: 'in_review',
        productsSummary: products || null,
        effectiveDate: null,
        reviewerName: null,
        reviewerSignatureUrl: null,
        warrantyDocumentUrl: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
        reviewedAt: null,
      } as WarrantyReview;
      const syncResult = await syncWarrantyReviewToCloud(createdReview);
      if (!syncResult.ok) throw new Error(syncResult.error || 'Warranty review upload failed');
      await db.insert(warrantyReviews).values(createdReview);
    }

      await load();
      Alert.alert('Submitted for Semco review', 'The complete photo record is now available to Semco for warranty review.');
    } catch (error) {
      console.error('[project] warranty submission failed', error);
      Alert.alert('Warranty review not submitted', 'The project remains on this device. Check your connection and try again.');
    } finally {
      setSubmittingWarranty(false);
    }
  };

  const handleMarkComplete = () => {
    if (!projectId) return;
    const missingLabels = warrantyPhotoStatus.missingStages.map((stage) => stage.label).join(', ');
    const message = warrantyPhotoStatus.isQualified
      ? 'Mark this project as complete? Warranty photo record is complete.'
      : `Mark this project as complete? Warranty review is not qualified yet. Missing: ${missingLabels}.`;

    Alert.alert('Mark Complete', message, [
      { text: 'Cancel', style: 'cancel' },
      ...(warrantyPhotoStatus.isQualified
        ? []
        : [{
            text: 'Add Photos',
            onPress: () => setTab('photos'),
          }]),
      {
        text: warrantyPhotoStatus.isQualified ? 'Complete' : 'Complete Anyway',
        onPress: async () => {
          const updatedProject = { ...project, status: 'complete', updatedAt: new Date().toISOString() } as Project;
          await db.update(projects)
            .set({ status: updatedProject.status, updatedAt: updatedProject.updatedAt })
            .where(eq(projects.id, projectId));
          const cloudResult = await syncProjectToCloud(updatedProject);
          if (!cloudResult.ok) {
            Alert.alert('Cloud update pending', 'The project is complete on this device, but Semco has not received the cloud update yet.');
          }
          load();
        },
      },
    ]);
  };

  if (isLoadingProject) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFoundWrap}>
          <EmptyState
            icon="folder-open-outline"
            title="Project not found"
            body="The project record is not available on this device yet. Go back to the project list or create it again."
          />
          <Button label="Back to Projects" variant="primary" onPress={() => router.replace('/projects' as any)} fullWidth />
          <Button label="Create Project" variant="secondary" onPress={() => router.replace('/projects/create' as any)} fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  const orderStatus = getOrderStatusMeta(orderRequest?.status);
  const dashboardNextStep = getDashboardNextStep({
    project,
    calculationResult,
    orderRequest,
    warrantyPhotoStatus,
    warrantyReview,
  });
  const handleDashboardNextStep = () => {
    switch (dashboardNextStep.action) {
      case 'calculator':
        router.push('/calculator' as any);
        return;
      case 'materials':
        setTab('materials');
        return;
      case 'photos':
        setTab('photos');
        return;
      case 'complete':
        handleMarkComplete();
        return;
      default:
        setTab('job');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.roundButton} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={Colors.darkTeal} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Project File</Text>
          <View style={styles.headerSpacer} />
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
            <View style={styles.heroMeta}>
              <Badge label={status.label} variant={status.variant} />
              <Badge label={warrantyPhotoStatus.isQualified ? 'Warranty Ready' : 'Photos Needed'} variant={warrantyPhotoStatus.isQualified ? 'success' : 'warning'} />
            </View>
          </View>
        </View>

        <TabControl value={tab} options={DETAIL_TABS} onChange={setTab} />

        {tab === 'job' ? (
          <>
            <View style={styles.dashboardGrid}>
              <StatCard
                label="Area"
                value={formatSqftFromSqm(project.totalAreaSqm)}
                detail={formatId(project.substrateType)}
                icon="resize-outline"
                tone="primary"
                style={styles.dashboardStat}
              />
              <StatCard
                label="Photos"
                value={`${warrantyPhotoStatus.completedCount}/${warrantyPhotoStatus.requiredCount}`}
                detail={warrantyPhotoStatus.isQualified ? 'Warranty ready' : 'Stages needed'}
                icon="camera-outline"
                tone={warrantyPhotoStatus.isQualified ? 'success' : 'accent'}
                style={styles.dashboardStat}
              />
              <StatCard
                label="Materials"
                value={orderStatus.label}
                detail={dealerContext.dealerId ? dealerContext.dealerName : 'Dealer pending'}
                icon="cart-outline"
                tone={orderRequest?.status === 'approved' ? 'success' : 'primary'}
                style={styles.dashboardStat}
              />
              <StatCard
                label="Batches"
                value={String(batchSummary.count)}
                detail={`${batchSummary.kg.toFixed(1)} kg logged`}
                icon="receipt-outline"
                tone="neutral"
                style={styles.dashboardStat}
              />
            </View>

            <Card style={styles.nextStepCard}>
              <View style={styles.nextStepIcon}>
                <Ionicons name={dashboardNextStep.icon} size={22} color={Colors.semcoOrange} />
              </View>
              <View style={styles.nextStepCopy}>
                <Text style={styles.nextStepEyebrow}>Next best action</Text>
                <Text style={styles.nextStepTitle}>{dashboardNextStep.title}</Text>
                <Text style={styles.nextStepBody}>{dashboardNextStep.body}</Text>
              </View>
              <Button
                label={dashboardNextStep.buttonLabel}
                variant={dashboardNextStep.variant}
                onPress={handleDashboardNextStep}
                fullWidth
              />
            </Card>

            <View style={styles.quickActions}>
              <QuickAction icon="calculator-outline" label="Calculator" onPress={() => router.push('/calculator' as any)} />
              <QuickAction icon="cart-outline" label="Materials" onPress={() => setTab('materials')} />
              <QuickAction icon="camera-outline" label="Photos" onPress={() => setTab('photos')} />
              <QuickAction icon="create-outline" label="Forms" onPress={() => setTab('forms')} />
            </View>

            <Card style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Job information</Text>
              <InfoRow icon="person-outline" label="Client" value={project.clientName ?? 'Not set'} />
              <InfoRow icon="mail-outline" label="Email" value={project.clientEmail ?? 'Not set'} />
              <InfoRow icon="call-outline" label="Phone" value={project.clientPhone ?? 'Not set'} />
              <InfoRow icon="location-outline" label="Address" value={project.siteAddress ?? 'No address yet'} />
              <InfoRow icon="briefcase-outline" label="Job Number" value={project.id} />
              <InfoRow icon="layers-outline" label="Substrate" value={formatId(project.substrateType)} />
              <InfoRow icon="resize-outline" label="Area" value={formatSqftFromSqm(project.totalAreaSqm)} />
              <InfoRow icon="business-outline" label="Dealer" value={dealerContext.dealerId ? dealerContext.dealerName : 'Set company profile'} />
              <InfoRow icon="pulse-outline" label="Status" value={status.label} />
            </Card>

            {project.status === 'active' ? (
              <Button label="Mark as Complete" variant="secondary" onPress={handleMarkComplete} fullWidth />
            ) : null}
          </>
        ) : null}

        {tab === 'spec' ? (
          <View style={styles.section}>
            <Card style={styles.infoCard}>
              <InfoRow icon="layers-outline" label="Substrate" value={formatId(project.substrateType)} />
              <InfoRow icon="color-filter-outline" label="Finish" value={formatId(project.finishType)} />
              <InfoRow icon="shield-checkmark-outline" label="Sealer" value={selectedSealer?.productName ?? project.sealerProductId ?? 'Not set'} />
              <InfoRow icon="document-text-outline" label="Notes" value={project.notes ?? 'No notes yet'} />
            </Card>

            {selectedColor ? (
              <>
                <Card style={styles.infoCard}>
                  <Text style={styles.sectionTitle}>Selected colour</Text>
                  <ColorSwatch color={selectedColor} showCode />
                  <Button label="Open Colour Detail" variant="secondary" onPress={() => router.push(`/colors/${selectedColor.id}` as any)} fullWidth />
                </Card>
                <FormulaDisplay pigments={selectedColor.pigments} colorName={selectedColor.name} />
              </>
            ) : (
              <EmptyState
                icon="color-palette-outline"
                title="No colour selected"
                body="Select a project colour from the colour library when the client confirms it."
              />
            )}

            {selectedSealer ? (
              <Card style={styles.infoCard}>
                <Text style={styles.sectionTitle}>{selectedSealer.productName}</Text>
                <Text style={styles.bodyText}>{selectedSealer.bestFor}</Text>
              </Card>
            ) : null}
            <Button label="Open Colour Library" variant="secondary" onPress={() => router.push('/colors' as any)} fullWidth />
          </View>
        ) : null}

        {tab === 'materials' ? (
          <View style={styles.section}>
            <Card style={styles.infoCard}>
              <View style={styles.statusRow}>
                <View style={styles.statusCopy}>
                  <Text style={styles.statusLabel}>Material request</Text>
                  <Text style={styles.statusValue}>{orderStatus.label}</Text>
                </View>
                <Badge label={orderStatus.label} variant={orderStatus.variant} />
              </View>
              <View style={styles.statusDivider} />
              <InfoRow icon="calculator-outline" label="Calculation" value={calculation?.id ?? 'No estimate attached'} />
              <InfoRow icon="business-outline" label="Dealer" value={dealerContext.dealerId ? dealerContext.dealerName : 'Set company profile'} />
              <Text style={styles.bodyText}>{dealerContext.orderRoutingLabel}</Text>
            </Card>

            {calculationResult ? (
              <>
                <MaterialBreakdownCard result={calculationResult} />
                <MaterialRetailEstimateCard result={calculationResult} dealerContext={dealerContext} />
              </>
            ) : (
              <EmptyState
                icon="calculator-outline"
                title="No material count yet"
                body="Run the calculator first, then attach the result to this project request."
              />
            )}

            <View style={styles.actionRow}>
              <Button label="Open Calculator" variant="secondary" onPress={() => router.push('/calculator' as any)} style={styles.halfButton} />
              <Button label="Material Request" variant="primary" onPress={() => router.push({ pathname: '/orders', params: { projectId: project.id } } as any)} style={styles.halfButton} />
            </View>

            <View style={styles.metricRow}>
              <Metric label="Batches" value={String(batchSummary.count)} />
              <Metric label="kg Used" value={batchSummary.kg.toFixed(1)} />
            </View>
            <Button
              label={showBatchForm ? 'Close Batch Form' : 'Add Batch'}
              variant={showBatchForm ? 'secondary' : 'primary'}
              onPress={() => {
                setBatchError(null);
                setShowBatchForm((current) => !current);
              }}
              fullWidth
            />
            {showBatchForm ? (
              <Card style={styles.batchFormCard}>
                <Text style={styles.sectionTitle}>Log a product batch</Text>
                <Text style={styles.bodyText}>Keep the product and lot number with the job record for warranty review.</Text>
                <Input label="Product" value={batchProduct} onChangeText={setBatchProduct} placeholder="X-Bond Stone" />
                <Input label="Batch or Lot Number" value={batchNumber} onChangeText={setBatchNumber} placeholder="Enter the number from the package" error={batchError ?? undefined} />
                <Input label="Quantity Used" value={batchQuantityKg} onChangeText={setBatchQuantityKg} keyboardType="decimal-pad" suffix="kg" />
                <Input label="Area Covered" value={batchCoverageSqft} onChangeText={setBatchCoverageSqft} keyboardType="decimal-pad" suffix="sq ft" />
                <Input label="Notes" value={batchNotes} onChangeText={setBatchNotes} placeholder="Optional field notes" multiline />
                <Button label="Save Batch" onPress={handleSaveBatch} isLoading={isSavingBatch} fullWidth />
              </Card>
            ) : null}
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
          </View>
        ) : null}

        {tab === 'photos' ? (
          <View style={styles.section}>
            <WarrantyPhotoChecklist photos={photos} onAddPhoto={handleAddPhoto} />
            <PhotoTimeline photos={photos} onAddPhoto={handleAddPhoto} />
            <Card style={styles.infoCard}>
              <InfoRow icon="shield-outline" label="Warranty Issued" value={project.warrantyIssued ? 'Yes' : 'No'} />
              <InfoRow icon="clipboard-outline" label="Review Status" value={formatId(warrantyReview?.status ?? 'not submitted')} />
              <InfoRow
                icon="shield-checkmark-outline"
                label="Photo Qualification"
                value={warrantyPhotoStatus.isQualified ? 'Ready for review' : 'Not qualified'}
              />
              <InfoRow
                icon="camera-outline"
                label="Required Photos"
                value={`${warrantyPhotoStatus.completedCount}/${warrantyPhotoStatus.requiredCount} complete`}
              />
              <Text style={styles.warrantyNote}>{warrantySummary}</Text>
              <InfoRow icon="calendar-outline" label="Completion Date" value={project.completionDate ?? 'Not complete yet'} />
              <InfoRow icon="business-outline" label="Contractor" value={profile?.companyName ?? 'Company profile needed'} />
              <InfoRow icon="document-attach-outline" label="Warranty Doc" value={warrantyReview?.warrantyDocumentUrl ? 'Available' : 'Available after Semco approval'} />
              <InfoRow icon="document-text-outline" label="Notes" value={project.notes ?? 'No notes yet'} />
              <Text style={styles.warrantyCondition}>
                Warranty review requires complete stage photos and Semco approval. The filled warranty document should only become downloadable after review, signature, and approval.
              </Text>
              {!warrantyPhotoStatus.isQualified ? (
                <Button label="Add Missing Photos" variant="primary" onPress={() => setTab('photos')} fullWidth />
              ) : warrantyReview?.status === 'approved' && warrantyReview.warrantyDocumentUrl ? (
                <Button label="Download Warranty Document" variant="primary" onPress={async () => {
                  const url = await createPrivateFileUrl('warranty-documents', warrantyReview.warrantyDocumentUrl!);
                  if (url) await Linking.openURL(url);
                }} fullWidth />
              ) : (
                <Button
                  label={warrantyReview ? 'Resubmit for Semco Review' : 'Submit for Semco Review'}
                  variant="primary"
                  onPress={submitWarrantyReview}
                  isLoading={isSubmittingWarranty}
                  fullWidth
                />
              )}
              <Button label="Open Material Request" variant="secondary" onPress={() => router.push({ pathname: '/orders', params: { projectId: project.id } } as any)} fullWidth />
            </Card>
          </View>
        ) : null}

        {tab === 'forms' ? (
          <ProjectSignoffPanel project={project} signoffs={signoffs} onSaved={load} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function getOrderStatusMeta(status?: string | null): { label: string; variant: 'primary' | 'accent' | 'success' | 'warning' | 'neutral' } {
  switch (status) {
    case 'in_review':
      return { label: 'In Review', variant: 'warning' };
    case 'needs_revision':
      return { label: 'Needs Revision', variant: 'accent' };
    case 'approved':
      return { label: 'Approved', variant: 'success' };
    case 'draft':
      return { label: 'Draft', variant: 'primary' };
    default:
      return { label: 'Not Started', variant: 'neutral' };
  }
}

function getDashboardNextStep({
  project,
  calculationResult,
  orderRequest,
  warrantyPhotoStatus,
  warrantyReview,
}: {
  project: Project;
  calculationResult: CalculationResult | null;
  orderRequest: OrderRequest | null;
  warrantyPhotoStatus: ReturnType<typeof getWarrantyPhotoStatus>;
  warrantyReview: WarrantyReview | null;
}): DashboardNextStep {
  if (!project.totalAreaSqm || !calculationResult) {
    return {
      icon: 'calculator-outline',
      title: 'Build the material count',
      body: 'Run the calculator so this job has quantities, retail estimate, and a material request path.',
      buttonLabel: 'Open Calculator',
      action: 'calculator',
      variant: 'primary',
    };
  }

  if (!orderRequest || orderRequest.status === 'draft' || orderRequest.status === 'needs_revision') {
    return {
      icon: 'cart-outline',
      title: 'Review materials for this job',
      body: 'Open the material tab, confirm quantities, then submit the request for dealer review.',
      buttonLabel: 'Review Materials',
      action: 'materials',
      variant: 'primary',
    };
  }

  if (!warrantyPhotoStatus.isQualified) {
    const nextMissing = warrantyPhotoStatus.missingStages[0]?.label ?? 'next stage';
    return {
      icon: 'camera-outline',
      title: `Capture ${nextMissing}`,
      body: 'Warranty needs a clear photo record for every stage before Semco can approve the job.',
      buttonLabel: 'Add Photos',
      action: 'photos',
      variant: 'primary',
    };
  }

  if (!warrantyReview || warrantyReview.status === 'needs_revision' || warrantyReview.status === 'rejected') {
    return {
      icon: 'shield-checkmark-outline',
      title: 'Submit warranty review',
      body: 'Photos are complete. Send the project file to Semco review so the warranty document can be approved.',
      buttonLabel: 'Review Photos',
      action: 'photos',
      variant: 'primary',
    };
  }

  if (project.status === 'active') {
    return {
      icon: 'checkmark-circle-outline',
      title: 'Close out the project',
      body: 'The file is organized. Mark complete when the job has been handed over.',
      buttonLabel: 'Mark Complete',
      action: 'complete',
      variant: 'secondary',
    };
  }

  return {
    icon: 'briefcase-outline',
    title: 'Project file is organized',
    body: 'Use the tabs below to review specs, materials, photos, warranty status, and batches.',
    buttonLabel: 'Stay Here',
    action: 'none',
    variant: 'secondary',
  };
}

function formatId(value?: string | null): string {
  if (!value) return 'Not set';
  return value
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
      <Ionicons name={icon} size={24} color={Colors.darkTeal} />
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
  notFoundWrap: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
  },
  scroll: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl + 44,
  },
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
  headerSpacer: {
    width: 42,
    height: 42,
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
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  infoCard: { gap: Spacing.sm },
  batchFormCard: { gap: Spacing.md },
  section: { gap: Spacing.md },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dashboardStat: {
    width: '48%',
    flexGrow: 1,
  },
  nextStepCard: {
    gap: Spacing.md,
    borderColor: Colors.accentMuted,
    backgroundColor: Colors.surfaceElevated,
  },
  nextStepIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: '#F5CBBB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepCopy: { gap: 4 },
  nextStepEyebrow: {
    color: Colors.semcoOrange,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextStepTitle: {
    color: Colors.navy,
    fontSize: Typography.size.lg,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  nextStepBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.sm * 1.45,
  },
  sectionTitle: {
    color: Colors.navy,
    fontSize: Typography.size.lg,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  bodyText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.sm * 1.45,
  },
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
  warrantyNote: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.sm * 1.45,
  },
  warrantyCondition: {
    borderRadius: Radius.md,
    backgroundColor: Colors.accentMuted,
    color: Colors.semcoOrange,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
    lineHeight: Typography.size.sm * 1.45,
    padding: Spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickAction: {
    width: '48%',
    flexGrow: 1,
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
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  statusCopy: { flex: 1, gap: 2 },
  statusLabel: { color: Colors.textDisabled, fontSize: Typography.size.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusValue: { color: Colors.textPrimary, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  statusDivider: { height: 1, backgroundColor: Colors.border },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfButton: { flex: 1 },
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
