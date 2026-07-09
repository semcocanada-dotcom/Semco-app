import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
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

const STATUS_HELP: Record<OrderRequestStatus, string> = {
  draft: 'Saved as a draft. It will stay editable until it is submitted for dealer review.',
  in_review: 'Submitted for dealer review. Reward square footage is logged as pending until it is verified.',
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

  useEffect(() => {
    db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(3).then(setRecentProjects).catch(console.error);
  }, []);

  useEffect(() => {
    getInstallerProfile(installerId).then(setProfile).catch(console.error);
  }, [installerId]);

  useEffect(() => {
    getPendingMaterialRequest().then(setPendingResult).catch(console.error);
  }, [params.source]);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setCalculation(null);
      setOrderRequest(null);
      return;
    }

    Promise.all([
      db.select().from(projects).where(eq(projects.id, projectId)).limit(1),
      db.select().from(calculations).where(eq(calculations.projectId, projectId)).orderBy(desc(calculations.createdAt)).limit(1),
      db.select().from(orderRequests).where(eq(orderRequests.projectId, projectId)).orderBy(desc(orderRequests.createdAt)).limit(1),
    ])
      .then(([projectRows, calcRows, requestRows]) => {
        setProject(projectRows[0] ?? null);
        setCalculation(calcRows[0] ?? null);
        setOrderRequest(requestRows[0] ?? null);
      })
      .catch(console.error);
  }, [projectId]);

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

  async function savePendingCalculation(now: string): Promise<string | null> {
    if (!project) return null;
    if (!pendingResult) return calculation?.id ?? null;

    const created: Calculation = {
      id: `calc-${Date.now()}`,
      projectId: project.id,
      installerId: project.installerId,
      areaSqm: pendingResult.areaSqm,
      substrateType: project.substrateType ?? 'material_request',
      wastePct: pendingResult.wastePct,
      result: pendingResult,
      createdAt: now,
    };

    await db.insert(calculations).values(created);
    setCalculation(created);
    setPendingResult(null);
    await clearPendingMaterialRequest();
    return created.id;
  }

  async function ensureRequest(status: OrderRequestStatus) {
    if (!project) return;
    setSavingStatus(status);

    try {
      const now = new Date().toISOString();
      const latestCalcId = await savePendingCalculation(now);

      let requestId = orderRequest?.id;
      if (orderRequest) {
        await db.update(orderRequests)
          .set({ status, calculationId: latestCalcId, updatedAt: now })
          .where(eq(orderRequests.id, orderRequest.id));
        setOrderRequest({ ...orderRequest, status, calculationId: latestCalcId, updatedAt: now });
      } else {
        const created = {
          id: `order-${Date.now()}`,
          projectId: project.id,
          calculationId: latestCalcId,
          status,
          notes: null,
          createdAt: now,
          updatedAt: now,
        };
        await db.insert(orderRequests).values(created);
        setOrderRequest(created);
        requestId = created.id;
      }

      if (requestId && result && (status === 'in_review' || status === 'approved')) {
        await syncOrderRewardCredit(requestId, result, now);
      }
      setLastSavedStatus(status);
    } finally {
      setSavingStatus(null);
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
      await db
        .update(rewardCredits)
        .set({
          sqft,
          projectId: project.id,
          notes: `${dealerContext.dealerName} material request submitted for review.`,
        })
        .where(eq(rewardCredits.id, existing[0].id));
      return;
    }

    await db.insert(rewardCredits).values({
      id: `reward-${Date.now()}`,
      installerId: project.installerId,
      projectId: project.id,
      sourceType: 'order_request',
      sourceId: requestId,
      sqft,
      status: 'pending',
      notes: `${dealerContext.dealerName} material request submitted for review.`,
      createdAt: now,
      verifiedAt: null,
    });
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
              : 'No manual entry. Dealer routing comes from the contractor company profile postal code.'}
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
                  Calculation linked: {orderRequest?.calculationId ?? calculation?.id ?? (pendingResult ? 'pending calculator result' : 'none yet')}
                </Text>
                <Text style={styles.bodySmall}>
                  {dealerContext.orderRoutingLabel} {dealerUsesProfile ? 'Assigned from company profile.' : 'Project address is a temporary fallback until the company profile is complete.'}
                </Text>
                {!dealerUsesProfile ? (
                  <Button label="Complete Company Profile" variant="secondary" onPress={() => router.push('/profile' as any)} fullWidth />
                ) : null}
              </Card>
            </View>

            {result ? <MaterialBreakdownCard result={result} /> : <NoEstimateCard onOpenCalculator={() => router.push('/calculator' as any)} />}
            {result ? <MaterialRetailEstimateCard result={result} dealerContext={dealerContext} /> : null}

            <View style={styles.section}>
              <SectionHeader title="Request status" subtitle="Choose the stage for this material request." />
              <View style={styles.statusOptionGrid}>
                {STATUS_OPTIONS.map((option) => {
                  const active = (orderRequest?.status ?? 'draft') === option.value;
                  const loading = savingStatus === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.78}
                      disabled={savingStatus !== null || !result}
                      onPress={() => ensureRequest(option.value)}
                      style={[
                        styles.statusOption,
                        active && styles.statusOptionActive,
                        (!result || savingStatus !== null) && styles.statusOptionDisabled,
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
                  {lastSavedStatus ? STATUS_HELP[lastSavedStatus] : result ? STATUS_HELP[(orderRequest?.status ?? 'draft') as OrderRequestStatus] : 'Run the calculator first so this request has quantities to save.'}
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
        <Text style={styles.noEstimateBody}>Run the calculator first, then create the request from the result.</Text>
      </View>
      <Button label="Open Calculator" variant="secondary" onPress={onOpenCalculator} fullWidth />
    </Card>
  );
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
