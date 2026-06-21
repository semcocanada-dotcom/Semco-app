import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { calculations } from '@/database/schema/calculations';
import { orderRequests, type OrderRequestStatus } from '@/database/schema/workflow';
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
import { Colors, Fonts, Layout, Radius, Typography, Spacing } from '@/constants/theme';

const STATUS_VARIANT: Record<OrderRequestStatus, 'primary' | 'accent' | 'warning' | 'success'> = {
  draft: 'primary',
  in_review: 'warning',
  needs_revision: 'accent',
  approved: 'success',
};

export default function OrdersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId?: string; source?: string }>();
  const projectId = typeof params.projectId === 'string' ? params.projectId : undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [orderRequest, setOrderRequest] = useState<OrderRequest | null>(null);
  const [pendingResult, setPendingResult] = useState<CalculationResult | null>(null);
  const [savingStatus, setSavingStatus] = useState<OrderRequestStatus | null>(null);

  useEffect(() => {
    db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(3).then(setRecentProjects).catch(console.error);
  }, []);

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
    () => resolveDealerContext({ projectAddress: project?.siteAddress }),
    [project?.siteAddress],
  );

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
      }
    } finally {
      setSavingStatus(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <Badge label="Material request" variant="accent" />
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
                    label={orderRequest?.status ?? 'draft'}
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
                  {dealerContext.orderRoutingLabel} Project address is used as a temporary fallback until company profiles are added.
                </Text>
              </Card>
            </View>

            {result ? <MaterialBreakdownCard result={result} /> : <NoEstimateCard onOpenCalculator={() => router.push('/calculator' as any)} />}
            {result ? <MaterialRetailEstimateCard result={result} dealerContext={dealerContext} /> : null}

            <View style={styles.section}>
              <SectionHeader title="Status controls" subtitle="Save the request or move it forward for dealer review." />
              <View style={styles.buttonGrid}>
                <Button label="Draft" variant="secondary" onPress={() => ensureRequest('draft')} disabled={savingStatus !== null || !result} style={styles.button} />
                <Button label="Submit for Dealer Review" variant="accent" onPress={() => ensureRequest('in_review')} disabled={savingStatus !== null || !result} style={styles.button} />
                <Button label="Needs Revision" variant="secondary" onPress={() => ensureRequest('needs_revision')} disabled={savingStatus !== null || !result} style={styles.button} />
                <Button label="Approved" variant="primary" onPress={() => ensureRequest('approved')} disabled={savingStatus !== null || !result} style={styles.button} />
              </View>
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
  heroCard: { gap: Spacing.md, borderColor: Colors.accentMuted, backgroundColor: Colors.surfaceElevated },
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
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  button: { width: '48%' },
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
