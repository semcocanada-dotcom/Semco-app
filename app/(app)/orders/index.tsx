import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { calculations } from '@/database/schema/calculations';
import { orderRequests, type OrderRequestStatus } from '@/database/schema/workflow';
import { rewardCredits } from '@/database/schema/installers';
import { projects } from '@/database/schema/projects';
import type { Project } from '@/database/schema/projects';
import type { Calculation, CalculationResult } from '@/database/schema/calculations';
import type { OrderRequest } from '@/database/schema/workflow';
import { MaterialBreakdownCard } from '@/components/calculator/MaterialBreakdownCard';
import { MaterialRetailEstimateCard } from '@/components/calculator/MaterialRetailEstimateCard';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button, Card, Badge, SectionHeader } from '@/components/ui';
import { clearPendingMaterialRequest, getPendingMaterialRequest } from '@/services/pending-material-request';
import { resolveDealerContext, UNASSIGNED_DEALER_CONTEXT } from '@/constants/dealers';
import { getInstallerProfile, profileToDealerInput } from '@/services/installer-profile';
import type { InstallerProfile } from '@/database/schema/installers';
import { useAuthStore } from '@/store/auth';
import { sqmToSqft } from '@/utils/area';
import { Colors, Fonts, Layout, Radius, Typography, Spacing } from '@/constants/theme';
import { createLocalId } from '@/utils/id';
import {
  fetchInstallerProjectsFromCloud,
  fetchProjectWorkspaceFromCloud,
  hydrateProjectFromCloud,
  syncCalculationToCloud,
  syncOrderRequestToCloud,
  syncRewardCreditToCloud,
} from '@/services/cloud-sync';

const STATUS_VARIANT: Record<OrderRequestStatus, 'primary' | 'accent' | 'warning' | 'success'> = {
  draft: 'primary',
  in_review: 'warning',
  needs_revision: 'accent',
  approved: 'success',
};

const STATUS_OPTIONS: {
  value: OrderRequestStatus;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    value: 'draft',
    label: 'Draft',
    description: 'Save it without sending.',
    icon: 'document-text-outline',
  },
  {
    value: 'in_review',
    label: 'Send for Dealer Review',
    description: 'Ready for Semco/dealer review.',
    icon: 'send-outline',
  },
  {
    value: 'needs_revision',
    label: 'Needs Revision',
    description: 'Hold it for quantity changes.',
    icon: 'create-outline',
  },
  {
    value: 'approved',
    label: 'Approved',
    description: 'Mark reviewed and approved.',
    icon: 'checkmark-circle-outline',
  },
];

const INSTALLER_STATUS_ACTIONS = STATUS_OPTIONS.filter((option) =>
  option.value === 'draft' || option.value === 'in_review'
);

const STATUS_HELP: Record<OrderRequestStatus, string> = {
  draft: 'Saved as a draft. It will stay editable until it is submitted for dealer review.',
  in_review: 'Submitted for dealer review. The routed email must also be sent from your mail app.',
  needs_revision: 'Marked for revision. Update the calculator quantities, then submit it again.',
  approved: 'Approved. This is ready for dealer handoff and Semco review records.',
};

function statusLabel(status: OrderRequestStatus) {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export default function OrdersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId?: string; source?: string }>();
  const projectId = typeof params.projectId === 'string' ? params.projectId : undefined;
  const user = useAuthStore((s) => s.user);
  const installerId = user?.id ?? 'local';

  const [project, setProject] = useState<Project | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [orderRequest, setOrderRequest] = useState<OrderRequest | null>(null);
  const [pendingResult, setPendingResult] = useState<CalculationResult | null>(null);
  const [profile, setProfile] = useState<InstallerProfile | null>(null);
  const [savingStatus, setSavingStatus] = useState<OrderRequestStatus | null>(null);
  const [lastSavedStatus, setLastSavedStatus] = useState<OrderRequestStatus | null>(null);
  const [customItemNotes, setCustomItemNotes] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadRecentProjects() {
      const localRows = await db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(3);
      if (!user?.id) {
        if (!cancelled) setRecentProjects(localRows);
        return;
      }

      try {
        const cloudRows = await fetchInstallerProjectsFromCloud(user.id);
        const merged = new Map(localRows.map((item) => [item.id, item]));
        for (const cloudProject of cloudRows) {
          const localProject = merged.get(cloudProject.id);
          if (!localProject || Date.parse(cloudProject.updatedAt) >= Date.parse(localProject.updatedAt)) {
            merged.set(cloudProject.id, cloudProject);
          }
        }
        const latest = [...merged.values()]
          .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
          .slice(0, 3);
        if (!cancelled) setRecentProjects(latest);
      } catch (error) {
        console.error('[orders] cloud project refresh failed; showing offline records', error);
        if (!cancelled) setRecentProjects(localRows);
      }
    }

    loadRecentProjects().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    getInstallerProfile(installerId).then(setProfile).catch(console.error);
  }, [installerId]);

  useEffect(() => {
    getPendingMaterialRequest().then(setPendingResult).catch(console.error);
  }, [params.source]);

  useEffect(() => {
    let cancelled = false;

    if (!projectId) {
      setProject(null);
      setCalculation(null);
      setOrderRequest(null);
      return () => {
        cancelled = true;
      };
    }

    async function loadRequestWorkspace() {
      const [projectRows, calcRows, requestRows] = await Promise.all([
        db.select().from(projects).where(eq(projects.id, projectId!)).limit(1),
        db.select().from(calculations).where(eq(calculations.projectId, projectId!)).orderBy(desc(calculations.createdAt)).limit(1),
        db.select().from(orderRequests).where(eq(orderRequests.projectId, projectId!)).orderBy(desc(orderRequests.createdAt)).limit(1),
      ]);

      let selectedProject = projectRows[0] ?? null;
      let selectedCalculation = calcRows[0] ?? null;
      let selectedRequest = requestRows[0] ?? null;

      if (user?.id) {
        selectedProject = (await hydrateProjectFromCloud(projectId!, user.id)) ?? selectedProject;
        try {
          const cloudWorkspace = await fetchProjectWorkspaceFromCloud(projectId!, user.id);
          selectedCalculation = cloudWorkspace.calculation ?? selectedCalculation;
          selectedRequest = cloudWorkspace.orderRequest ?? selectedRequest;
        } catch (error) {
          console.error('[orders] cloud workspace refresh failed; showing offline records', error);
        }
      }

      if (cancelled) return;
      setProject(selectedProject);
      setCalculation(selectedCalculation);
      setOrderRequest(selectedRequest);
      setCustomItemNotes(extractCustomItemNotes(selectedRequest?.notes));
    }

    loadRequestWorkspace().catch((error) => {
      console.error('[orders] request workspace failed to load', error);
      if (!cancelled) {
        Alert.alert('Request unavailable', 'This project request could not be loaded. Check your connection and try again.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, user?.id]);

  const result = useMemo(
    () => pendingResult ?? calculation?.result as CalculationResult | undefined,
    [calculation, pendingResult],
  );

  const projectTitle = useMemo(() => {
    if (!project) return 'Pick a project for this material request';
    return project.clientName ?? project.siteAddress ?? 'Unnamed project';
  }, [project]);
  const dealerContext = useMemo(
    () => {
      const profileDealer = resolveDealerContext(profileToDealerInput(profile));
      if (profileDealer.dealerId) return profileDealer;
      return project ? resolveDealerContext({ projectAddress: project.siteAddress }) : UNASSIGNED_DEALER_CONTEXT;
    },
    [profile, project],
  );
  const dealerUsesProfile = Boolean(profile?.postalCode);
  const trimmedCustomItemNotes = customItemNotes.trim();
  const canSaveRequest = Boolean(result || trimmedCustomItemNotes);

  async function savePendingCalculation(now: string): Promise<string | null> {
    if (!project) return null;
    if (!pendingResult) {
      if (calculation) {
        const cloudResult = await syncCalculationToCloud(calculation);
        if (!cloudResult.ok) throw new Error(cloudResult.error ?? 'The calculation could not be saved to the cloud.');
      }
      return calculation?.id ?? null;
    }

    const created: Calculation = {
      id: createLocalId('calc'),
      projectId: project.id,
      installerId: project.installerId,
      areaSqm: pendingResult.areaSqm,
      substrateType: project.substrateType ?? 'material_request',
      wastePct: pendingResult.wastePct,
      result: pendingResult,
      createdAt: now,
    };

    const cloudResult = await syncCalculationToCloud(created);
    if (!cloudResult.ok) throw new Error(cloudResult.error ?? 'The calculation could not be saved to the cloud.');
    await db.insert(calculations).values(created);
    setCalculation(created);
    setPendingResult(null);
    await clearPendingMaterialRequest();
    return created.id;
  }

  async function ensureRequest(status: OrderRequestStatus) {
    if (!project || !canSaveRequest) return;
    if (status === 'in_review' && !dealerContext.orderEmail) {
      Alert.alert('Dealer email missing', 'Add the company postal code before submitting this request.');
      return;
    }
    setSavingStatus(status);

    try {
      const now = new Date().toISOString();
      const latestCalcId = await savePendingCalculation(now);
      const requestNotes = buildOrderNotes({
        dealerName: dealerContext.dealerName,
        dealerEmail: dealerContext.orderEmail,
        customItemNotes: trimmedCustomItemNotes,
        hasCalculator: Boolean(result),
      });

      let requestId = orderRequest?.id;
      let savedRequest: OrderRequest;
      if (orderRequest) {
        const updatedRequest = { ...orderRequest, status, calculationId: latestCalcId, notes: requestNotes, updatedAt: now } as OrderRequest;
        const cloudResult = await syncOrderRequestToCloud(updatedRequest, installerId, dealerContext.dealerId);
        if (!cloudResult.ok) throw new Error(cloudResult.error ?? 'The material request could not be saved to the cloud.');
        await db.update(orderRequests)
          .set({ status, calculationId: latestCalcId, notes: requestNotes, updatedAt: now })
          .where(eq(orderRequests.id, orderRequest.id));
        setOrderRequest(updatedRequest);
        savedRequest = updatedRequest;
      } else {
        const created: OrderRequest = {
          id: createLocalId('order'),
          projectId: project.id,
          calculationId: latestCalcId,
          status,
          notes: requestNotes,
          createdAt: now,
          updatedAt: now,
        };
        const cloudResult = await syncOrderRequestToCloud(created, installerId, dealerContext.dealerId);
        if (!cloudResult.ok) throw new Error(cloudResult.error ?? 'The material request could not be saved to the cloud.');
        await db.insert(orderRequests).values(created);
        setOrderRequest(created);
        requestId = created.id;
        savedRequest = created;
      }

      if (requestId && status === 'in_review') {
        const emailOpened = await openDealerOrderEmail(requestId, requestNotes);
        if (!emailOpened) {
          const revertedAt = new Date().toISOString();
          const revertedRequest = { ...savedRequest, status: 'draft', updatedAt: revertedAt } as OrderRequest;
          const revertResult = await syncOrderRequestToCloud(revertedRequest, installerId, dealerContext.dealerId);
          if (!revertResult.ok) throw new Error(revertResult.error ?? 'The request could not be returned to draft.');
          await db.update(orderRequests)
            .set({ status: 'draft', updatedAt: revertedAt })
            .where(eq(orderRequests.id, requestId));
          setOrderRequest(revertedRequest);
          setLastSavedStatus('draft');
          Alert.alert(
            'Email not opened',
            `The request remains a draft. Send it to ${dealerContext.dealerName} at ${dealerContext.orderEmail}.`,
          );
          return;
        }
      }
      if (requestId && result && (status === 'in_review' || status === 'approved')) {
        await syncOrderRewardCredit(requestId, result, now);
      }
      setLastSavedStatus(status);
    } catch (error) {
      console.error('[orders] material request save failed', error);
      Alert.alert(
        'Request not saved',
        error instanceof Error ? error.message : 'Check your connection and try again.',
      );
    } finally {
      setSavingStatus(null);
    }
  }

  async function openDealerOrderEmail(requestId: string, requestNotes: string | null): Promise<boolean> {
    if (!project || !dealerContext.orderEmail) return false;

    const subject = `Semco material request - ${projectTitle}`;
    const body = buildDealerEmailBody({
      requestId,
      project,
      projectTitle,
      profile,
      result,
      requestNotes,
    });
    const url = `mailto:${dealerContext.orderEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      await Linking.openURL(url);
      return true;
    } catch (error) {
      console.error('Could not open dealer email link', error);
      return false;
    }
  }

  async function syncOrderRewardCredit(requestId: string, calcResult: CalculationResult, now: string) {
    if (!project) return;
    const sqft = calcResult.areaSqft ?? sqmToSqft(calcResult.areaSqm);
    if (!Number.isFinite(sqft) || sqft <= 0) return;

    const existing = await db
      .select()
      .from(rewardCredits)
      .where(eq(rewardCredits.sourceId, requestId))
      .limit(1);

    if (existing[0]) {
      const updatedCredit = {
        ...existing[0],
        sqft,
        projectId: project.id,
        notes: `${dealerContext.dealerName} material request submitted for review.`,
      };
      await db
        .update(rewardCredits)
        .set({
          sqft: updatedCredit.sqft,
          projectId: updatedCredit.projectId,
          notes: updatedCredit.notes,
        })
        .where(eq(rewardCredits.id, existing[0].id));
      const cloudResult = await syncRewardCreditToCloud(updatedCredit);
      if (!cloudResult.ok) throw new Error(cloudResult.error ?? 'Reward progress could not be saved to the cloud.');
      return;
    }

    const createdCredit = {
      id: createLocalId('reward'),
      installerId: project.installerId,
      projectId: project.id,
      sourceType: 'order_request',
      sourceId: requestId,
      sqft,
      status: 'pending',
      notes: `${dealerContext.dealerName} material request submitted for review.`,
      createdAt: now,
      verifiedAt: null,
    };
    await db.insert(rewardCredits).values(createdCredit);
    const cloudResult = await syncRewardCreditToCloud(createdCredit);
    if (!cloudResult.ok) throw new Error(cloudResult.error ?? 'Reward progress could not be saved to the cloud.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <Badge label="Material request" variant="primary" />
          <Text style={styles.title}>
            {project ? `${projectTitle} - Material request` : pendingResult ? 'Pick a project' : 'Create material request'}
          </Text>
          <Text style={styles.body}>
            {pendingResult
              ? 'Calculator quantities are loaded. Choose a project so dealer pricing and routing can be assigned.'
              : 'Build a system order from calculator quantities, or request odd items without a full system estimate.'}
          </Text>
          <View style={styles.iconWrap}>
            <Ionicons name="cart-outline" size={26} color={Colors.accent} />
          </View>
        </Card>

        {project ? (
          <>
            <View style={styles.section}>
              <SectionHeader title="Current request" subtitle="Review the quantities, dealer assignment, and request status before sending." />
              <Card style={styles.statusCard}>
                <View style={styles.statusRow}>
                  <View style={styles.statusCopy}>
                    <Text style={styles.statusLabel}>Status</Text>
                    <Text style={styles.statusValue}>{orderRequest?.status ?? 'draft'}</Text>
                  </View>
                  <Badge
                    label={statusLabel((orderRequest?.status ?? 'draft') as OrderRequestStatus)}
                    variant={STATUS_VARIANT[(orderRequest?.status ?? 'draft') as OrderRequestStatus]}
                  />
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusRow}>
                  <View style={styles.statusCopy}>
                    <Text style={styles.statusLabel}>Assigned dealer</Text>
                    <Text style={styles.statusValue}>{dealerContext.dealerId ? dealerContext.dealerName : 'Not assigned yet'}</Text>
                  </View>
                  <Badge
                    label={dealerContext.region === 'west' ? 'West' : dealerContext.region === 'east' ? 'East' : 'Set location'}
                    variant={dealerContext.dealerId ? 'primary' : 'warning'}
                  />
                </View>
                <Text style={styles.bodySmall}>
                  Calculation linked: {orderRequest?.calculationId ?? calculation?.id ?? (pendingResult ? 'pending calculator result' : trimmedCustomItemNotes ? 'custom item request' : 'none yet')}
                </Text>
                <Text style={styles.bodySmall}>
                  {dealerContext.orderRoutingLabel} {dealerUsesProfile ? 'Company profile is on file.' : 'Complete the company profile for dealer records, warranty records, and reward tracking.'}
                </Text>
                {!dealerUsesProfile ? (
                  <Button label="Complete Company Profile" variant="secondary" onPress={() => router.push('/profile' as any)} fullWidth />
                ) : null}
              </Card>
            </View>

            <CustomItemRequestCard
              value={customItemNotes}
              onChangeText={setCustomItemNotes}
              hasEstimate={Boolean(result)}
              dealerName={dealerContext.dealerName}
              dealerEmail={dealerContext.orderEmail}
            />
            {result ? <MaterialBreakdownCard result={result} /> : <NoEstimateCard onOpenCalculator={() => router.push('/calculator' as any)} />}
            {result ? <MaterialRetailEstimateCard result={result} dealerContext={dealerContext} /> : null}

            <View style={styles.section}>
              <SectionHeader title="Request actions" subtitle="Save the request or send it to the assigned dealer for review." />
              <View style={styles.statusOptionGrid}>
                {INSTALLER_STATUS_ACTIONS.map((option) => {
                  const active = (orderRequest?.status ?? 'draft') === option.value;
                  const loading = savingStatus === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.78}
                      disabled={savingStatus !== null || !canSaveRequest}
                      onPress={() => ensureRequest(option.value)}
                      style={[
                        styles.statusOption,
                        active && styles.statusOptionActive,
                        (!canSaveRequest || savingStatus !== null) && styles.statusOptionDisabled,
                      ]}
                    >
                      <View style={[styles.statusOptionIcon, active && styles.statusOptionIconActive]}>
                        <Ionicons
                          name={loading ? 'hourglass-outline' : active ? 'checkmark-outline' : option.icon}
                          size={20}
                          color={active ? Colors.white : Colors.darkTeal}
                        />
                      </View>
                      <View style={styles.statusOptionCopy}>
                        <Text style={[styles.statusOptionTitle, active && styles.statusOptionTitleActive]}>
                          {option.label}
                        </Text>
                        <Text style={[styles.statusOptionBody, active && styles.statusOptionBodyActive]}>
                          {option.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Card style={styles.statusHelpCard}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.darkTeal} />
                <Text style={styles.statusHelpText}>
                  {lastSavedStatus ? STATUS_HELP[lastSavedStatus] : canSaveRequest ? STATUS_HELP[(orderRequest?.status ?? 'draft') as OrderRequestStatus] : 'Run the calculator for a full system order or enter odd items above before saving.'}
                </Text>
              </Card>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            {pendingResult ? <MaterialRetailEstimateCard result={pendingResult} dealerContext={UNASSIGNED_DEALER_CONTEXT} /> : <NoEstimateCard onOpenCalculator={() => router.push('/calculator' as any)} />}
            <SectionHeader title="Recent projects" subtitle="Choose a project to attach this request." />
            <View style={styles.projectList}>
              {recentProjects.map((item) => (
                <ProjectCard
                  key={item.id}
                  project={item}
                  onPress={() => router.push({ pathname: '/orders', params: { projectId: item.id, source: pendingResult ? 'calculator' : undefined } } as any)}
                />
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function NoEstimateCard({ onOpenCalculator }: { onOpenCalculator: () => void }) {
  return (
    <Card style={styles.noEstimateCard}>
      <View style={styles.noEstimateIcon}>
        <Ionicons name="calculator-outline" size={20} color={Colors.primary} />
      </View>
      <View style={styles.noEstimateCopy}>
        <Text style={styles.noEstimateTitle}>No calculator estimate attached</Text>
        <Text style={styles.noEstimateBody}>Run the calculator for a full system count, or use the odd-item request box on this page.</Text>
      </View>
      <Button label="Open Calculator" variant="secondary" onPress={onOpenCalculator} fullWidth />
    </Card>
  );
}

function CustomItemRequestCard({
  value,
  onChangeText,
  hasEstimate,
  dealerName,
  dealerEmail,
}: {
  value: string;
  onChangeText: (value: string) => void;
  hasEstimate: boolean;
  dealerName: string;
  dealerEmail: string | null;
}) {
  return (
    <Card style={styles.customCard}>
      <View style={styles.customHeader}>
        <View style={styles.customIcon}>
          <Ionicons name="list-outline" size={20} color={Colors.primary} />
        </View>
        <View style={styles.customCopy}>
          <Text style={styles.customTitle}>Odd item request</Text>
          <Text style={styles.customBody}>
            Add products, tools, cleaners, sealers, or small extras that are not part of a full system calculation.
          </Text>
        </View>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={hasEstimate ? 'Optional add-ons, notes, or substitutions...' : 'Example: 2 x Stone Soap, 1 x Titan Gloss, 1 replacement trowel...'}
        placeholderTextColor={Colors.textDisabled}
        multiline
        textAlignVertical="top"
        style={styles.customInput}
      />
      <Text style={styles.customHint}>
        This saves with the request and is included in the email to {dealerName}{dealerEmail ? ` (${dealerEmail})` : ''}.
      </Text>
    </Card>
  );
}

function extractCustomItemNotes(notes?: string | null): string {
  if (!notes) return '';
  const marker = 'Odd item request:';
  const index = notes.indexOf(marker);
  if (index < 0) return '';
  return notes.slice(index + marker.length).replace(/^Dealer email:.*$/gm, '').trim();
}

function buildOrderNotes({
  dealerName,
  dealerEmail,
  customItemNotes,
  hasCalculator,
}: {
  dealerName: string;
  dealerEmail: string | null;
  customItemNotes: string;
  hasCalculator: boolean;
}): string | null {
  const lines = [
    `${dealerName} material request.`,
    dealerEmail ? `Dealer email: ${dealerEmail}` : null,
    hasCalculator ? 'Includes calculator quantities.' : 'Odd item request only. No full system calculator estimate attached.',
    customItemNotes ? `Odd item request:\n${customItemNotes}` : null,
  ].filter(Boolean);

  return lines.length ? lines.join('\n\n') : null;
}

function buildDealerEmailBody({
  requestId,
  project,
  projectTitle,
  profile,
  result,
  requestNotes,
}: {
  requestId: string;
  project: Project;
  projectTitle: string;
  profile: InstallerProfile | null;
  result?: CalculationResult;
  requestNotes: string | null;
}) {
  const materialLines = result?.layers
    .filter((layer) => (layer.roundedQuantity ?? layer.quantityPacks ?? 0) > 0)
    .map((layer) => `- ${layer.productName}: ${layer.purchaseLabel ?? layer.quantityLabel ?? `${layer.roundedQuantity ?? layer.quantityPacks} ${layer.packLabel ?? ''}`.trim()}`);

  return [
    'Semco material request',
    '',
    `Request ID: ${requestId}`,
    `Project: ${projectTitle}`,
    `Site: ${project.siteAddress ?? 'Not provided'}`,
    `Installer company: ${profile?.companyName ?? 'Profile pending'}`,
    `Contact: ${profile?.contactName ?? 'Not provided'}`,
    `Installer email: ${profile?.email ?? 'Not provided'}`,
    `Phone: ${profile?.phone ?? 'Not provided'}`,
    `Company location: ${[profile?.city, profile?.province, profile?.postalCode].filter(Boolean).join(', ') || 'Not provided'}`,
    '',
    materialLines?.length ? 'Calculator quantities:' : null,
    ...(materialLines ?? []),
    '',
    requestNotes ? 'Request notes:' : null,
    requestNotes,
    '',
    'Please review availability and confirm pricing before the order is finalized.',
  ].filter((line) => line != null).join('\n');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 16,
    gap: Spacing.lg,
  },
  heroCard: { gap: Spacing.md, borderColor: Colors.primaryMuted, backgroundColor: Colors.surfaceElevated },
  title: { color: Colors.textPrimary, fontSize: Typography.size.xl, lineHeight: Typography.size.xl * 1.1, fontWeight: Typography.weight.bold },
  body: { color: Colors.textSecondary, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  bodySmall: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.45 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  section: { gap: Spacing.md },
  statusCard: { gap: Spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  statusCopy: { flex: 1, gap: 2 },
  statusLabel: { color: Colors.textDisabled, fontSize: Typography.size.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusValue: { color: Colors.textPrimary, fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  statusDivider: { height: 1, backgroundColor: Colors.border },
  statusOptionGrid: { gap: Spacing.sm },
  statusOption: {
    minHeight: 72,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.navy,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  statusOptionActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.darkTeal,
  },
  statusOptionDisabled: {
    opacity: 0.55,
  },
  statusOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionIconActive: {
    backgroundColor: Colors.semcoOrange,
  },
  statusOptionCopy: { flex: 1, gap: 3 },
  statusOptionTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  statusOptionTitleActive: { color: Colors.white },
  statusOptionBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
  },
  statusOptionBodyActive: { color: '#DDF4F5' },
  statusHelpCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    borderColor: Colors.primaryMuted,
    backgroundColor: Colors.surfaceElevated,
  },
  statusHelpText: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  projectList: { gap: Spacing.sm },
  customCard: {
    gap: Spacing.md,
    borderColor: Colors.primaryMuted,
    backgroundColor: Colors.white,
  },
  customHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  customIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customCopy: { flex: 1, gap: 2 },
  customTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  customBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.4,
  },
  customInput: {
    minHeight: 108,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.softGrey,
    color: Colors.navy,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.35,
    padding: Spacing.md,
  },
  customHint: {
    color: Colors.textDisabled,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.3,
  },
  noEstimateCard: {
    alignItems: 'stretch',
    gap: Spacing.sm,
    borderColor: Colors.primaryMuted,
  },
  noEstimateIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noEstimateCopy: { flex: 1, gap: 2 },
  noEstimateTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  noEstimateBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
  },
});
