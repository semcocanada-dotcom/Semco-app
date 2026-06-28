import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getAdminWorkbenchData,
  setInstallerCertification,
  setOrderStatus,
  setReceiptReviewStatus,
  setRewardCreditStatus,
  setWarrantyProjectStatus,
  type AdminInstallerRecord,
  type AdminOrderItem,
  type AdminReceiptItem,
  type AdminRewardItem,
  type AdminWarrantyItem,
  type AdminWorkbenchData,
} from '@/services/admin-workbench';
import { Badge, Button, Card, EmptyState, SectionHeader, TabControl } from '@/components/ui';
import { formatSqft } from '@/constants/rewards';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';
import type { OrderRequestStatus } from '@/database/schema/workflow';
import { isSemcoAdminUser } from '@/services/admin-access';
import { useAuthStore } from '@/store/auth';

type AdminTab = 'installers' | 'warranty' | 'orders' | 'receipts' | 'rewards';

const ADMIN_TABS: { value: AdminTab; label: string }[] = [
  { value: 'installers', label: 'People' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'orders', label: 'Orders' },
  { value: 'receipts', label: 'Receipts' },
  { value: 'rewards', label: 'Rewards' },
];

export default function AdminPortalScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isSemcoAdminUser(user);
  const [tab, setTab] = useState<AdminTab>('installers');
  const [data, setData] = useState<AdminWorkbenchData | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = async () => {
    const next = await getAdminWorkbenchData();
    setData(next);
  };

  useEffect(() => {
    if (isAdmin) {
      load().catch(console.error);
    }
  }, [isAdmin]);

  const visibleQueueCount = useMemo(() => {
    if (!data) return 0;
    switch (tab) {
      case 'installers':
        return data.installers.length;
      case 'warranty':
        return data.warrantyQueue.length;
      case 'orders':
        return data.orderQueue.length;
      case 'receipts':
        return data.receiptQueue.length;
      case 'rewards':
        return data.rewardQueue.length;
      default:
        return 0;
    }
  }, [data, tab]);

  async function runAction(key: string, action: () => Promise<void>) {
    setBusyKey(key);
    try {
      await action();
      await load();
    } finally {
      setBusyKey(null);
    }
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.restrictedWrap}>
          <Card elevated style={styles.restrictedCard}>
            <View style={styles.restrictedIcon}>
              <Ionicons name="lock-closed-outline" size={26} color={Colors.semcoOrange} />
            </View>
            <Badge label="Semco admin only" variant="accent" />
            <Text style={styles.restrictedTitle}>Installer accounts do not see this portal.</Text>
            <Text style={styles.restrictedBody}>
              This area is for Semco review staff only. Installers can still manage company profile, projects, photos,
              material requests, receipts, and rewards from the normal app screens.
            </Text>
            <Button label="Back to More" variant="secondary" onPress={() => router.replace('/more' as any)} fullWidth />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading admin portal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark-outline" size={26} color={Colors.white} />
            </View>
            <View style={styles.heroCopy}>
              <Badge label="Semco Admin" variant="accent" />
              <Text style={styles.heroTitle}>Installer review portal</Text>
              <Text style={styles.heroBody}>
                Accounts, project warranty, orders, receipts, and reward credits.
              </Text>
            </View>
          </View>
          <View style={styles.heroActions}>
            <Button label="Refresh" variant="secondary" size="sm" onPress={() => load().catch(console.error)} style={styles.heroButton} />
            <Button label="Projects" variant="secondary" size="sm" onPress={() => router.push('/projects' as any)} style={styles.heroButton} />
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <MetricCard icon="people-outline" label="Installers" value={String(data.stats.installers)} tone="teal" />
          <MetricCard icon="briefcase-outline" label="Active Jobs" value={String(data.stats.activeProjects)} tone="teal" />
          <MetricCard icon="shield-outline" label="Warranty" value={String(data.stats.warrantyPending)} tone="orange" />
          <MetricCard icon="cart-outline" label="Orders" value={String(data.stats.orderPending)} tone="orange" />
          <MetricCard icon="receipt-outline" label="Receipts" value={String(data.stats.receiptPending)} tone="orange" />
          <MetricCard icon="trophy-outline" label="Verified" value={formatSqft(Math.round(data.stats.verifiedSqft))} tone="teal" />
        </View>

        <View style={styles.tabBlock}>
          <TabControl value={tab} options={ADMIN_TABS} onChange={setTab} />
          <Text style={styles.queueMeta}>{visibleQueueCount} record{visibleQueueCount === 1 ? '' : 's'}</Text>
        </View>

        {tab === 'installers' ? (
          <AdminSection title="Installer Accounts" subtitle="Company records and certification status.">
            {data.installers.length > 0 ? (
              data.installers.map((installer) => (
                <InstallerCard
                  key={installer.installerId}
                  installer={installer}
                  busyKey={busyKey}
                  onCertify={(status) => runAction(
                    `${installer.installerId}-${status}`,
                    () => setInstallerCertification(installer.installerId, status),
                  )}
                />
              ))
            ) : (
              <EmptyState
                icon="people-outline"
                title="No installer accounts yet"
                body="Installer company profiles will appear here after signup or profile setup."
              />
            )}
          </AdminSection>
        ) : null}

        {tab === 'warranty' ? (
          <AdminSection title="Warranty Review" subtitle="Approve only when stage photos and project records are complete.">
            {data.warrantyQueue.length > 0 ? (
              data.warrantyQueue.map((item) => (
                <WarrantyCard
                  key={item.project.id}
                  item={item}
                  busyKey={busyKey}
                  onOpenProject={() => router.push(`/projects/${item.project.id}` as any)}
                  onSetStatus={(status) => runAction(
                    `${item.project.id}-${status}`,
                    () => setWarrantyProjectStatus(item.project.id, status),
                  )}
                />
              ))
            ) : (
              <EmptyState icon="shield-outline" title="No projects yet" body="Warranty review starts once projects and stage photos are submitted." />
            )}
          </AdminSection>
        ) : null}

        {tab === 'orders' ? (
          <AdminSection title="Material Requests" subtitle="Review quantities before dealer handoff.">
            {data.orderQueue.length > 0 ? (
              data.orderQueue.map((item) => (
                <OrderCard
                  key={item.order.id}
                  item={item}
                  busyKey={busyKey}
                  onOpenProject={() => item.project ? router.push(`/projects/${item.project.id}` as any) : undefined}
                  onSetStatus={(status) => runAction(
                    `${item.order.id}-${status}`,
                    () => setOrderStatus(item.order.id, status),
                  )}
                />
              ))
            ) : (
              <EmptyState icon="cart-outline" title="No material requests" body="Requests created from calculator results will queue here." />
            )}
          </AdminSection>
        ) : null}

        {tab === 'receipts' ? (
          <AdminSection title="Purchase Receipts" subtitle="Verify submitted square footage for rewards.">
            {data.receiptQueue.length > 0 ? (
              data.receiptQueue.map((item) => (
                <ReceiptCard
                  key={item.receipt.id}
                  item={item}
                  busyKey={busyKey}
                  onSetStatus={(status) => runAction(
                    `${item.receipt.id}-${status}`,
                    () => setReceiptReviewStatus(item.receipt.id, status),
                  )}
                />
              ))
            ) : (
              <EmptyState icon="receipt-outline" title="No receipts submitted" body="Installer receipt claims will appear here for verification." />
            )}
          </AdminSection>
        ) : null}

        {tab === 'rewards' ? (
          <AdminSection title="Reward Credits" subtitle="Cumulative verified square footage controls reward tiers.">
            {data.rewardQueue.length > 0 ? (
              data.rewardQueue.map((item) => (
                <RewardCard
                  key={item.credit.id}
                  item={item}
                  busyKey={busyKey}
                  onSetStatus={(status) => runAction(
                    `${item.credit.id}-${status}`,
                    () => setRewardCreditStatus(item.credit.id, status),
                  )}
                />
              ))
            ) : (
              <EmptyState icon="trophy-outline" title="No reward credits yet" body="Dealer orders, warranty reviews, and receipts can create reward credit." />
            )}
          </AdminSection>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function AdminSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} subtitle={subtitle} />
      {children}
    </View>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  tone: 'teal' | 'orange';
}) {
  const orange = tone === 'orange';
  return (
    <Card style={[styles.metricCard, orange && styles.metricCardOrange]}>
      <View style={[styles.metricIcon, orange && styles.metricIconOrange]}>
        <Ionicons name={icon} size={18} color={orange ? Colors.semcoOrange : Colors.primary} />
      </View>
      <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

function InstallerCard({
  installer,
  busyKey,
  onCertify,
}: {
  installer: AdminInstallerRecord;
  busyKey: string | null;
  onCertify: (status: 'pending' | 'certified' | 'suspended') => void;
}) {
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleWrap}>
          <Text style={styles.recordTitle}>{installer.companyName}</Text>
          <Text style={styles.recordSubtitle}>{installer.contactName} - {installer.email}</Text>
        </View>
        <Badge label={installer.certificationStatus} variant={installer.certificationStatus === 'certified' ? 'success' : installer.certificationStatus === 'suspended' ? 'danger' : 'warning'} />
      </View>

      <View style={styles.detailGrid}>
        <Detail label="Dealer" value={installer.dealer.dealerId ? installer.dealer.dealerName : 'Not assigned'} />
        <Detail label="Phone" value={installer.phone || 'Not saved'} />
        <Detail label="Projects" value={String(installer.projectCount)} />
        <Detail label="Pending" value={formatSqft(Math.round(installer.pendingSqft))} />
        <Detail label="Verified" value={formatSqft(Math.round(installer.verifiedSqft))} />
        <Detail label="Receipts" value={String(installer.receiptPendingCount)} />
      </View>

      <View style={styles.buttonRow}>
        <Button
          label="Certify"
          size="sm"
          variant="secondary"
          onPress={() => onCertify('certified')}
          isLoading={busyKey === `${installer.installerId}-certified`}
          style={styles.thirdButton}
        />
        <Button
          label="Pending"
          size="sm"
          variant="ghost"
          onPress={() => onCertify('pending')}
          isLoading={busyKey === `${installer.installerId}-pending`}
          style={styles.thirdButton}
        />
        <Button
          label="Suspend"
          size="sm"
          variant="danger"
          onPress={() => onCertify('suspended')}
          isLoading={busyKey === `${installer.installerId}-suspended`}
          style={styles.thirdButton}
        />
      </View>
    </Card>
  );
}

function WarrantyCard({
  item,
  busyKey,
  onOpenProject,
  onSetStatus,
}: {
  item: AdminWarrantyItem;
  busyKey: string | null;
  onOpenProject: () => void;
  onSetStatus: (status: 'approved' | 'needs_revision' | 'rejected') => void;
}) {
  const reviewStatus = item.review?.status ?? 'not submitted';
  const missing = item.photoStatus.missingStages.map((stage) => stage.label).join(', ');
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleWrap}>
          <Text style={styles.recordTitle}>{projectName(item.project)}</Text>
          <Text style={styles.recordSubtitle}>{item.profile?.companyName ?? 'Company profile needed'}</Text>
        </View>
        <Badge label={reviewStatus} variant={statusVariant(reviewStatus)} />
      </View>

      <View style={styles.detailGrid}>
        <Detail label="Photos" value={`${item.photoStatus.completedCount}/${item.photoStatus.requiredCount}`} />
        <Detail label="Address" value={item.project.siteAddress ?? 'No address'} />
        <Detail label="Area" value={item.project.totalAreaSqm ? formatSqft(Math.round(item.project.totalAreaSqm * 10.7639)) : 'Not set'} />
        <Detail label="Issued" value={item.project.warrantyIssued ? 'Yes' : 'No'} />
      </View>

      {!item.photoStatus.isQualified ? (
        <Text style={styles.warningText}>Missing photos: {missing}</Text>
      ) : (
        <Text style={styles.successText}>Stage photos complete.</Text>
      )}

      <View style={styles.buttonRow}>
        <Button label="Open" size="sm" variant="ghost" onPress={onOpenProject} style={styles.quarterButton} />
        <Button
          label="Approve"
          size="sm"
          variant="primary"
          disabled={!item.photoStatus.isQualified}
          onPress={() => onSetStatus('approved')}
          isLoading={busyKey === `${item.project.id}-approved`}
          style={styles.quarterButton}
        />
        <Button
          label="Revise"
          size="sm"
          variant="secondary"
          onPress={() => onSetStatus('needs_revision')}
          isLoading={busyKey === `${item.project.id}-needs_revision`}
          style={styles.quarterButton}
        />
        <Button
          label="Reject"
          size="sm"
          variant="danger"
          onPress={() => onSetStatus('rejected')}
          isLoading={busyKey === `${item.project.id}-rejected`}
          style={styles.quarterButton}
        />
      </View>
    </Card>
  );
}

function OrderCard({
  item,
  busyKey,
  onOpenProject,
  onSetStatus,
}: {
  item: AdminOrderItem;
  busyKey: string | null;
  onOpenProject: () => void | undefined;
  onSetStatus: (status: OrderRequestStatus) => void;
}) {
  const lineCount = item.result?.layers.length ?? 0;
  const sqft = item.result?.areaSqft ?? (item.result?.areaSqm ? item.result.areaSqm * 10.7639 : null);
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleWrap}>
          <Text style={styles.recordTitle}>{item.project ? projectName(item.project) : 'Project missing'}</Text>
          <Text style={styles.recordSubtitle}>{item.dealer.dealerName}</Text>
        </View>
        <Badge label={item.order.status} variant={statusVariant(item.order.status)} />
      </View>

      <View style={styles.detailGrid}>
        <Detail label="Dealer" value={item.dealer.dealerId ? item.dealer.dealerName : 'Unassigned'} />
        <Detail label="Calculation" value={item.calculation?.id ?? 'None'} />
        <Detail label="Lines" value={String(lineCount)} />
        <Detail label="Area" value={sqft ? formatSqft(Math.round(sqft)) : 'Not set'} />
      </View>

      <Text style={styles.bodyText}>{item.dealer.orderRoutingLabel}</Text>
      <View style={styles.buttonRow}>
        <Button label="Open" size="sm" variant="ghost" disabled={!item.project} onPress={onOpenProject} style={styles.thirdButton} />
        <Button
          label="Approve"
          size="sm"
          variant="primary"
          onPress={() => onSetStatus('approved')}
          isLoading={busyKey === `${item.order.id}-approved`}
          style={styles.thirdButton}
        />
        <Button
          label="Revise"
          size="sm"
          variant="secondary"
          onPress={() => onSetStatus('needs_revision')}
          isLoading={busyKey === `${item.order.id}-needs_revision`}
          style={styles.thirdButton}
        />
      </View>
    </Card>
  );
}

function ReceiptCard({
  item,
  busyKey,
  onSetStatus,
}: {
  item: AdminReceiptItem;
  busyKey: string | null;
  onSetStatus: (status: 'verified' | 'rejected') => void;
}) {
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleWrap}>
          <Text style={styles.recordTitle}>{item.profile?.companyName ?? 'Installer receipt'}</Text>
          <Text style={styles.recordSubtitle}>{item.receipt.receiptNumber ?? 'No receipt number'} - {item.receipt.dealerName ?? 'Dealer not set'}</Text>
        </View>
        <Badge label={item.receipt.status} variant={statusVariant(item.receipt.status)} />
      </View>
      <View style={styles.detailGrid}>
        <Detail label="Claim" value={formatSqft(Math.round(item.receipt.sqftClaimed ?? 0))} />
        <Detail label="Project" value={item.project ? projectName(item.project) : 'Not linked'} />
        <Detail label="Reward" value={item.linkedCredit?.status ?? 'No credit'} />
        <Detail label="Submitted" value={formatDate(item.receipt.createdAt)} />
      </View>
      {item.receipt.notes ? <Text style={styles.bodyText}>{item.receipt.notes}</Text> : null}
      <View style={styles.buttonRow}>
        <Button
          label="Verify"
          size="sm"
          variant="primary"
          onPress={() => onSetStatus('verified')}
          isLoading={busyKey === `${item.receipt.id}-verified`}
          style={styles.halfButton}
        />
        <Button
          label="Reject"
          size="sm"
          variant="danger"
          onPress={() => onSetStatus('rejected')}
          isLoading={busyKey === `${item.receipt.id}-rejected`}
          style={styles.halfButton}
        />
      </View>
    </Card>
  );
}

function RewardCard({
  item,
  busyKey,
  onSetStatus,
}: {
  item: AdminRewardItem;
  busyKey: string | null;
  onSetStatus: (status: 'pending' | 'verified' | 'rejected') => void;
}) {
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleWrap}>
          <Text style={styles.recordTitle}>{formatSqft(Math.round(item.credit.sqft ?? 0))}</Text>
          <Text style={styles.recordSubtitle}>{item.profile?.companyName ?? item.credit.installerId} - {item.credit.sourceType.replace(/_/g, ' ')}</Text>
        </View>
        <Badge label={item.credit.status} variant={statusVariant(item.credit.status)} />
      </View>
      <View style={styles.detailGrid}>
        <Detail label="Project" value={item.project ? projectName(item.project) : 'Not linked'} />
        <Detail label="Created" value={formatDate(item.credit.createdAt)} />
        <Detail label="Verified" value={item.credit.verifiedAt ? formatDate(item.credit.verifiedAt) : 'No'} />
        <Detail label="Source" value={item.credit.sourceId ?? 'Manual'} />
      </View>
      {item.credit.notes ? <Text style={styles.bodyText}>{item.credit.notes}</Text> : null}
      <View style={styles.buttonRow}>
        <Button label="Verify" size="sm" variant="primary" onPress={() => onSetStatus('verified')} isLoading={busyKey === `${item.credit.id}-verified`} style={styles.thirdButton} />
        <Button label="Pending" size="sm" variant="ghost" onPress={() => onSetStatus('pending')} isLoading={busyKey === `${item.credit.id}-pending`} style={styles.thirdButton} />
        <Button label="Reject" size="sm" variant="danger" onPress={() => onSetStatus('rejected')} isLoading={busyKey === `${item.credit.id}-rejected`} style={styles.thirdButton} />
      </View>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function projectName(project: { clientName?: string | null; siteAddress?: string | null; id: string }): string {
  return project.clientName ?? project.siteAddress ?? project.id;
}

function formatDate(value?: string | null): string {
  if (!value) return 'Not set';
  return value.slice(0, 10);
}

function statusVariant(status?: string | null): 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'approved':
    case 'verified':
    case 'certified':
      return 'success';
    case 'in_review':
    case 'pending':
    case 'not submitted':
      return 'warning';
    case 'needs_revision':
    case 'draft':
      return 'accent';
    case 'rejected':
    case 'suspended':
      return 'danger';
    default:
      return 'neutral';
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl + 44,
    gap: Spacing.lg,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  loadingText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: Typography.size.base },
  restrictedWrap: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
  },
  restrictedCard: { gap: Spacing.md, alignItems: 'flex-start' },
  restrictedIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: '#F5CBBB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restrictedTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.xl,
    lineHeight: Typography.size.xl * 1.1,
  },
  restrictedBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  heroCard: {
    gap: Spacing.md,
    backgroundColor: Colors.darkTeal,
    borderColor: Colors.darkTeal,
  },
  heroTop: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.semcoOrange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  heroCopy: { flex: 1, gap: Spacing.xs },
  heroTitle: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.xl,
    lineHeight: Typography.size.xl * 1.08,
  },
  heroBody: {
    color: '#DDF4F5',
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  heroActions: { flexDirection: 'row', gap: Spacing.sm },
  heroButton: { flex: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metricCard: {
    width: '31%',
    minWidth: 104,
    flexGrow: 1,
    gap: Spacing.xs,
    borderColor: Colors.primaryMuted,
    backgroundColor: Colors.surfaceElevated,
  },
  metricCardOrange: {
    borderColor: Colors.accentMuted,
    backgroundColor: Colors.white,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  metricIconOrange: { backgroundColor: Colors.accentMuted },
  metricValue: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.lg,
  },
  metricLabel: {
    color: Colors.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.xs,
  },
  tabBlock: { gap: Spacing.xs },
  queueMeta: {
    color: Colors.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.xs,
    textAlign: 'right',
  },
  section: { gap: Spacing.md },
  recordCard: { gap: Spacing.md },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  recordTitleWrap: { flex: 1, gap: 3 },
  recordTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.base,
  },
  recordSubtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.35,
  },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  detailItem: {
    width: '48%',
    flexGrow: 1,
    minHeight: 56,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.softGrey,
    gap: 2,
  },
  detailLabel: {
    color: Colors.textDisabled,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: Colors.navy,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.3,
  },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  halfButton: { width: '48%', flexGrow: 1 },
  thirdButton: { width: '31%', flexGrow: 1, paddingHorizontal: Spacing.sm },
  quarterButton: { width: '48%', flexGrow: 1, paddingHorizontal: Spacing.sm },
  warningText: {
    color: Colors.offlineAmber,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.4,
  },
  successText: {
    color: Colors.success,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
  },
  bodyText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
});
