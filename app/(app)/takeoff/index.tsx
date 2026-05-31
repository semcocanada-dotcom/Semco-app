import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { desc, eq } from 'drizzle-orm';
import { calculate } from '@/services/calculator';
import { db } from '@/database/client';
import { calculations } from '@/database/schema/calculations';
import { orderRequests } from '@/database/schema/workflow';
import { projects } from '@/database/schema/projects';
import type { Project } from '@/database/schema/projects';
import type { Calculation, CalculationResult } from '@/database/schema/calculations';
import type { SubstrateId } from '@/constants/substrates';
import { MaterialBreakdownCard } from '@/components/calculator/MaterialBreakdownCard';
import { WasteToggle } from '@/components/calculator/WasteToggle';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button, Card, Badge, SectionHeader } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function TakeoffScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId?: string }>();
  const projectId = typeof params.projectId === 'string' ? params.projectId : undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [latestCalculation, setLatestCalculation] = useState<Calculation | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [wastePct, setWastePct] = useState(10);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadRecentProjects = async () => {
    const rows = await db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(3);
    setRecentProjects(rows);
  };

  useEffect(() => {
    loadRecentProjects().catch(console.error);
  }, []);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLatestCalculation(null);
      setResult(null);
      return;
    }

    let cancelled = false;
    Promise.all([
      db.select().from(projects).where(eq(projects.id, projectId)).limit(1),
      db.select().from(calculations).where(eq(calculations.projectId, projectId)).orderBy(desc(calculations.createdAt)).limit(1),
    ])
      .then(([projectRows, calcRows]) => {
        if (cancelled) return;
        const loadedProject = projectRows[0] ?? null;
        const loadedCalculation = calcRows[0] ?? null;
        setProject(loadedProject);
        setLatestCalculation(loadedCalculation);

        if (loadedCalculation) {
          setWastePct(loadedCalculation.wastePct);
          setResult(loadedCalculation.result as CalculationResult);
          setMessage('Loaded the latest saved draft for this project.');
          return;
        }

        if (loadedProject?.totalAreaSqm && loadedProject.substrateType) {
          const substrate = loadedProject.substrateType as SubstrateId;
          const calculated = calculate({
            areaSqm: loadedProject.totalAreaSqm,
            substrateType: substrate,
            wastePct: 10,
            sealerSku: loadedProject.sealerProductId ?? undefined,
          });
          setWastePct(10);
          setResult(calculated);
          setMessage('Draft calculated from the project spec. Save it to create the takeoff record.');
        } else {
          setResult(null);
          setMessage('This project still needs area and substrate details before a takeoff can be drafted.');
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    if (!project || !project.totalAreaSqm || !project.substrateType) return;
    if (latestCalculation) return;

    const substrate = project.substrateType as SubstrateId;
    setResult(
      calculate({
        areaSqm: project.totalAreaSqm,
        substrateType: substrate,
        wastePct,
        sealerSku: project.sealerProductId ?? undefined,
      }),
    );
  }, [project, wastePct, latestCalculation]);

  const canSave = Boolean(project?.id && result && project.totalAreaSqm && project.substrateType);

  const saveDraft = async () => {
    if (!project || !result || !project.totalAreaSqm || !project.substrateType) return;
    setSaving(true);
    setMessage(null);
    try {
      const id = `calc-${Date.now()}`;
      await db.insert(calculations).values({
        id,
        projectId: project.id,
        installerId: project.installerId,
        areaSqm: project.totalAreaSqm,
        substrateType: project.substrateType,
        wastePct,
        result,
        createdAt: new Date().toISOString(),
      });
      setLatestCalculation({
        id,
        projectId: project.id,
        installerId: project.installerId,
        areaSqm: project.totalAreaSqm,
        substrateType: project.substrateType,
        wastePct,
        result,
        createdAt: new Date().toISOString(),
      });
      setMessage('Takeoff draft saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const createOrderRequest = async () => {
    if (!project || !result || !project.totalAreaSqm || !project.substrateType) return;
    const calculationId = latestCalculation?.id ?? `calc-${Date.now()}`;
    if (!latestCalculation) {
      await db.insert(calculations).values({
        id: calculationId,
        projectId: project.id,
        installerId: project.installerId,
        areaSqm: project.totalAreaSqm,
        substrateType: project.substrateType,
        wastePct,
        result,
        createdAt: new Date().toISOString(),
      });
    }

    const existing = await db.select().from(orderRequests).where(eq(orderRequests.projectId, project.id)).orderBy(desc(orderRequests.createdAt)).limit(1);
    const now = new Date().toISOString();
    if (existing[0]) {
      await db.update(orderRequests)
        .set({ calculationId, status: 'draft', updatedAt: now })
        .where(eq(orderRequests.id, existing[0].id));
    } else {
      await db.insert(orderRequests).values({
        id: `order-${Date.now()}`,
        projectId: project.id,
        calculationId,
        status: 'draft',
        notes: null,
        createdAt: now,
        updatedAt: now,
      });
    }
    setMessage('Order request draft created. Open the order screen to review it.');
    router.push({ pathname: '/orders', params: { projectId: project.id } } as any);
  };

  const projectTitle = useMemo(() => {
    if (!project) return 'Select a project to start';
    return project.clientName ?? project.siteAddress ?? 'Unnamed project';
  }, [project]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <Badge label="Material takeoff" variant="primary" />
          <Text style={styles.title}>{project ? `${projectTitle} · Takeoff draft` : 'Select a project to start a takeoff draft'}</Text>
          <Text style={styles.body}>
            {project
              ? 'The takeoff is project-linked, review-first, and ready to be saved locally before any internal order request is created.'
              : 'Pick a project from the list below to attach a draft to it.'}
          </Text>
          <View style={styles.iconWrap}>
            <Ionicons name="layers-outline" size={26} color={Colors.primary} />
          </View>
        </Card>

        {message ? (
          <Card style={styles.messageCard}>
            <Text style={styles.messageText}>{message}</Text>
          </Card>
        ) : null}

        {project ? (
          <>
            <View style={styles.section}>
              <SectionHeader title="Draft controls" subtitle="Adjust the waste factor and save the takeoff locally." />
              <Card style={styles.controlsCard}>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Area</Text>
                    <Text style={styles.metaValue}>{project.totalAreaSqm ?? '—'} m²</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Substrate</Text>
                    <Text style={styles.metaValue}>{project.substrateType?.replace(/_/g, ' ') ?? '—'}</Text>
                  </View>
                </View>
                <WasteToggle value={wastePct} onChange={setWastePct} />
              </Card>
            </View>

            {result ? <MaterialBreakdownCard result={result} /> : null}

            <View style={styles.buttonRow}>
              <Button label="Save draft" variant="accent" onPress={saveDraft} disabled={!canSave || saving} isLoading={saving} style={styles.button} />
              <Button label="Create order request" variant="secondary" onPress={createOrderRequest} disabled={!canSave} style={styles.button} />
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <SectionHeader title="Recent projects" subtitle="Choose a project to link the takeoff draft." />
            <View style={styles.projectList}>
              {recentProjects.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/takeoff', params: { projectId: item.id } } as any)}
                >
                  <ProjectCard project={item} onPress={() => router.push({ pathname: '/takeoff', params: { projectId: item.id } } as any)} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          <Button label="Projects" variant="secondary" onPress={() => router.push('/projects' as any)} style={styles.button} />
          <Button label="Dashboard" variant="secondary" onPress={() => router.push('/dashboard' as any)} style={styles.button} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl + 16, gap: Spacing.lg },
  heroCard: { gap: Spacing.md, borderColor: Colors.primaryMuted, backgroundColor: Colors.surfaceElevated },
  title: { color: Colors.textPrimary, fontSize: Typography.size.xl, lineHeight: Typography.size.xl * 1.1, fontWeight: Typography.weight.bold },
  body: { color: Colors.textSecondary, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  messageCard: { borderColor: Colors.primaryMuted },
  messageText: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.45 },
  section: { gap: Spacing.md },
  controlsCard: { gap: Spacing.md },
  metaRow: { flexDirection: 'row', gap: Spacing.sm },
  metaItem: { flex: 1, gap: 2, padding: Spacing.md, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  metaLabel: { color: Colors.textDisabled, fontSize: Typography.size.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { color: Colors.textPrimary, fontSize: Typography.size.base, fontWeight: Typography.weight.bold },
  buttonRow: { flexDirection: 'row', gap: Spacing.sm },
  button: { flex: 1 },
  projectList: { gap: Spacing.sm },
});
