import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
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
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button, Card, Badge, SectionHeader } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants/theme';

const STATUS_VARIANT: Record<OrderRequestStatus, 'primary' | 'accent' | 'warning' | 'success'> = {
  draft: 'primary',
  in_review: 'warning',
  needs_revision: 'accent',
  approved: 'success',
};

export default function OrdersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId?: string }>();
  const projectId = typeof params.projectId === 'string' ? params.projectId : undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [orderRequest, setOrderRequest] = useState<OrderRequest | null>(null);
  const [savingStatus, setSavingStatus] = useState<OrderRequestStatus | null>(null);

  useEffect(() => {
    db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(3).then(setRecentProjects).catch(console.error);
  }, []);

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

  const result = useMemo(() => calculation?.result as CalculationResult | undefined, [calculation]);

  const ensureRequest = async (status: OrderRequestStatus) => {
    if (!project) return;
    setSavingStatus(status);
    try {
      const now = new Date().toISOString();
      const latestCalcId = calculation?.id ?? null;
      if (orderRequest) {
        await db.update(orderRequests)
          .set({ status, calculationId: latestCalcId, updatedAt: now })
          .where(eq(orderRequests.id, orderRequest.id));
        setOrderRequest({ ...orderRequest, status, calculationId: latestCalcId, updatedAt: now });
      } else {
        const id = `order-${Date.now()}`;
        const created = {
          id,
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
  };

  const projectTitle = useMemo(() => {
    if (!project) return 'Pick a project to review the request';
    return project.clientName ?? project.siteAddress ?? 'Unnamed project';
  }, [project]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <Badge label="Order materials" variant="accent" />
          <Text style={styles.title}>{project ? `${projectTitle} · Order review` : 'Pick a project to review the request'}</Text>
          <Text style={styles.body}>
            The order flow stays review-first. It can link to a saved calculator estimate and stops short of auto-ordering.
          </Text>
          <View style={styles.iconWrap}>
            <Ionicons name="cart-outline" size={26} color={Colors.accent} />
          </View>
        </Card>

        {project ? (
          <>
            <View style={styles.section}>
              <SectionHeader title="Current request" subtitle="The request can move through review states without placing an order." />
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
                <Text style={styles.bodySmall}>
                  Calculation linked: {orderRequest?.calculationId ?? calculation?.id ?? 'none yet'}
                </Text>
              </Card>
            </View>

            {result ? <MaterialBreakdownCard result={result} /> : null}

            <View style={styles.section}>
              <SectionHeader title="Status controls" subtitle="Update the internal review state only — nothing is sent automatically." />
              <View style={styles.buttonGrid}>
                <Button label="Draft" variant="secondary" onPress={() => ensureRequest('draft')} disabled={savingStatus !== null} style={styles.button} />
                <Button label="In review" variant="accent" onPress={() => ensureRequest('in_review')} disabled={savingStatus !== null} style={styles.button} />
                <Button label="Needs revision" variant="secondary" onPress={() => ensureRequest('needs_revision')} disabled={savingStatus !== null} style={styles.button} />
                <Button label="Approved" variant="primary" onPress={() => ensureRequest('approved')} disabled={savingStatus !== null} style={styles.button} />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <SectionHeader title="Recent projects" subtitle="Choose a project to open the request review." />
            <View style={styles.projectList}>
              {recentProjects.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/orders', params: { projectId: item.id } } as any)}
                >
                  <ProjectCard project={item} onPress={() => router.push({ pathname: '/orders', params: { projectId: item.id } } as any)} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          <Button label="Calculator" variant="secondary" onPress={() => router.push('/calculator' as any)} style={styles.button} />
          <Button label="Dashboard" variant="secondary" onPress={() => router.push('/dashboard' as any)} style={styles.button} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl + 16, gap: Spacing.lg },
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
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  button: { width: '48%' },
  buttonRow: { flexDirection: 'row', gap: Spacing.sm },
  projectList: { gap: Spacing.sm },
});
