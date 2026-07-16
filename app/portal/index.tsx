import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import {
  getDealerLabel,
  getInstallerName,
  getPortalData,
  getPortalSessionProfile,
  getProjectName,
  completeDeletionRequest,
  issueWarrantyDocument,
  reviewOrderRequest,
  reviewReceipt,
  reviewWarranty,
  signInPortal,
  signOutPortal,
  type PortalData,
  type PortalRecord,
} from '@/services/portal-cloud';
import { getSignoffPdfViewUrl } from '@/services/signoffs-cloud';
import { createPrivateFileUrl } from '@/services/private-storage';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

type PortalTab = 'overview' | 'orders' | 'forms' | 'projects' | 'review' | 'rewards';

const TABS: { value: PortalTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'overview', label: 'Overview', icon: 'grid-outline' },
  { value: 'orders', label: 'Orders', icon: 'cart-outline' },
  { value: 'forms', label: 'Forms', icon: 'document-text-outline' },
  { value: 'projects', label: 'Projects', icon: 'briefcase-outline' },
  { value: 'review', label: 'Review', icon: 'checkmark-done-outline' },
  { value: 'rewards', label: 'Rewards', icon: 'trophy-outline' },
];

export default function SemcoPortalScreen() {
  const { width } = useWindowDimensions();
  const isCompactPortal = width < 760;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<PortalTab>('overview');
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getPortalSessionProfile();
      if (!profile) {
        setData(null);
        return;
      }
      setData(await getPortalData(profile));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Portal could not load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const indexes = useMemo(() => {
    const installers = new Map((data?.installers ?? []).map((row) => [row.installer_id, row]));
    const projects = new Map((data?.projects ?? []).map((row) => [row.id, row]));
    return { installers, projects };
  }, [data]);

  const stats = useMemo(() => {
    if (!data) return null;
    const pendingOrders = data.orders.filter((order) => order.status === 'in_review' || order.status === 'needs_revision').length;
    const signedForms = data.signoffs.filter((form) => form.status === 'signed').length;
    const pendingRewards = data.rewards.filter((reward) => reward.status === 'pending').length;
    const verifiedSqft = data.rewards
      .filter((reward) => reward.status === 'verified')
      .reduce((total, reward) => total + Number(reward.sqft ?? 0), 0);
    return {
      installers: data.installers.length,
      projects: data.projects.length,
      pendingOrders,
      signedForms,
      pendingRewards,
      verifiedSqft,
    };
  }, [data]);

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    const signInError = await signInPortal(email, password);
    if (signInError) {
      setBusy(false);
      setError(signInError);
      return;
    }
    await load();
    setBusy(false);
  };

  const handleSignOut = async () => {
    await signOutPortal();
    setData(null);
    setPassword('');
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={Colors.semcoOrange} />
        <Text style={styles.loadingText}>Opening Semco portal...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <ScrollView contentContainerStyle={styles.loginScreen}>
        <Card elevated style={styles.loginCard}>
          <Image source={require('../../assets/images/semco-surfaces-logo.png')} style={styles.logo} resizeMode="contain" />
          <Badge label="Semco Portal" variant="accent" />
          <Text style={styles.loginTitle}>Admin and dealer access</Text>
          <Text style={styles.loginBody}>
            Sign in to review installer accounts, project files, signed forms, material requests, photos, and reward progress.
          </Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@company.com"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={Colors.textDisabled}
              style={styles.input}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              placeholderTextColor={Colors.textDisabled}
              style={styles.input}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button label={busy ? 'Signing in...' : 'Sign In'} variant="primary" onPress={handleSignIn} disabled={busy || !email || !password} fullWidth />
        </Card>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.shell, isCompactPortal && styles.shellCompact]}>
      <View style={[styles.sidebar, isCompactPortal && styles.sidebarHidden]}>
        <Image source={require('../../assets/images/semco-surfaces-logo.png')} style={styles.sidebarLogo} resizeMode="contain" />
        <View style={styles.portalIdentity}>
          <Badge label={data.profile.role === 'semco_admin' ? 'Semco admin' : 'Dealer portal'} variant="accent" />
          <Text style={styles.identityName}>{data.profile.displayName}</Text>
          <Text style={styles.identityMeta}>{data.profile.dealerId ?? 'All dealers'}</Text>
        </View>
        <View style={styles.navList}>
          {TABS.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setTab(item.value)}
              style={[styles.navItem, tab === item.value && styles.navItemActive]}
            >
              <Ionicons name={item.icon} size={19} color={tab === item.value ? Colors.semcoOrange : Colors.darkTeal} />
              <Text style={[styles.navText, tab === item.value && styles.navTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button label="Refresh" variant="secondary" size="sm" onPress={() => load().catch(console.error)} fullWidth />
        <Button label="Sign Out" variant="secondary" size="sm" onPress={handleSignOut} fullWidth />
      </View>

      <ScrollView contentContainerStyle={[styles.content, isCompactPortal && styles.contentCompact]} showsVerticalScrollIndicator={false}>
        <View style={[styles.mobileTopbar, isCompactPortal && styles.mobileTopbarVisible]}>
          <Image source={require('../../assets/images/semco-surfaces-logo.png')} style={styles.mobileLogo} resizeMode="contain" />
          <Button label="Sign Out" variant="secondary" size="sm" onPress={handleSignOut} />
        </View>

        <Card elevated style={[styles.hero, isCompactPortal && styles.heroCompact]}>
          <View style={styles.heroCopy}>
            <Badge label={data.profile.role === 'semco_admin' ? 'Full access' : 'Assigned dealer'} variant="accent" />
            <Text style={[styles.heroTitle, isCompactPortal && styles.heroTitleCompact]}>Semco command portal</Text>
            <Text style={styles.heroBody}>
              Review the cloud record for installer accounts, signed forms, dealer material requests, photos, warranty status, and rewards.
            </Text>
          </View>
          <View style={[styles.heroIcon, isCompactPortal && styles.heroIconCompact]}>
            <Ionicons name="shield-checkmark-outline" size={34} color={Colors.white} />
          </View>
        </Card>

        <View style={[styles.mobileTabs, isCompactPortal && styles.mobileTabsVisible]}>
          {TABS.map((item) => (
            <TouchableOpacity key={item.value} onPress={() => setTab(item.value)} style={[styles.mobileTab, tab === item.value && styles.mobileTabActive]}>
              <Text style={[styles.mobileTabText, tab === item.value && styles.mobileTabTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {tab === 'overview' && stats ? (
          <>
            <View style={styles.statsGrid}>
              <Metric label="Installers" value={String(stats.installers)} icon="people-outline" />
              <Metric label="Projects" value={String(stats.projects)} icon="briefcase-outline" />
              <Metric label="Needs Review" value={String(stats.pendingOrders)} icon="cart-outline" accent />
              <Metric label="Signed Forms" value={String(stats.signedForms)} icon="document-text-outline" />
              <Metric label="Rewards" value={String(stats.pendingRewards)} icon="trophy-outline" accent />
              <Metric label="Verified Sq Ft" value={Math.round(stats.verifiedSqft).toLocaleString()} icon="analytics-outline" />
            </View>
            <RecordSection title="Recent Signed Forms" emptyTitle="No signed forms yet">
              {data.signoffs.slice(0, 5).map((form) => (
                <FormRow key={form.id} form={form} project={indexes.projects.get(form.project_id)} installer={indexes.installers.get(form.installer_id)} />
              ))}
            </RecordSection>
            <RecordSection title="Dealer Order Queue" emptyTitle="No material requests yet">
              {data.orders.slice(0, 5).map((order) => (
                <OrderRow key={order.id} order={order} project={indexes.projects.get(order.project_id)} installer={indexes.installers.get(indexes.projects.get(order.project_id)?.installer_id)} />
              ))}
            </RecordSection>
          </>
        ) : null}

        {tab === 'orders' ? (
          <RecordSection title="Material Requests" emptyTitle="No material requests">
            {data.orders.map((order) => (
              <OrderRow key={order.id} order={order} project={indexes.projects.get(order.project_id)} installer={indexes.installers.get(indexes.projects.get(order.project_id)?.installer_id)} onChanged={load} />
            ))}
          </RecordSection>
        ) : null}

        {tab === 'forms' ? (
          <RecordSection title="Signed Project Forms" emptyTitle="No forms saved">
            {data.signoffs.map((form) => (
              <FormRow key={form.id} form={form} project={indexes.projects.get(form.project_id)} installer={indexes.installers.get(form.installer_id)} />
            ))}
          </RecordSection>
        ) : null}

        {tab === 'projects' ? (
          <>
            <RecordSection title="Project Files" emptyTitle="No projects synced yet">
              {data.projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  installer={indexes.installers.get(project.installer_id)}
                  photoCount={data.photos.filter((photo) => photo.project_id === project.id).length}
                  formCount={data.signoffs.filter((form) => form.project_id === project.id).length}
                />
              ))}
            </RecordSection>
            <RecordSection title="Warranty Stage Photos" emptyTitle="No project photos synced yet">
              {data.photos.map((photo) => (
                <PrivateFileRow key={photo.id} row={photo} bucket="project-photos" path={photo.photo_url} title={photo.stage ?? 'Project photo'} meta={getProjectName(indexes.projects.get(photo.project_id))} icon="camera-outline" />
              ))}
            </RecordSection>
          </>
        ) : null}

        {tab === 'review' ? (
          <>
            <RecordSection title="Warranty Review Queue" emptyTitle="No warranty reviews pending">
              {data.warranty.map((review) => (
                <WarrantyRow
                  key={review.id}
                  review={review}
                  project={indexes.projects.get(review.project_id)}
                  installer={indexes.installers.get(review.installer_id)}
                  reviewerName={data.profile.displayName}
                  canReview={data.profile.role === 'semco_admin'}
                  onChanged={load}
                />
              ))}
            </RecordSection>
            <RecordSection title="Purchase Receipts" emptyTitle="No receipt submissions">
              {data.receipts.map((receipt) => (
                <ReceiptRow key={receipt.id} receipt={receipt} installer={indexes.installers.get(receipt.installer_id)} onChanged={load} canReview={data.profile.role === 'semco_admin'} />
              ))}
            </RecordSection>
            <RecordSection title="Account Deletion Requests" emptyTitle="No deletion requests">
              {data.deletions.map((request) => (
                <DeletionRow key={request.id} request={request} installer={indexes.installers.get(request.installer_id)} onChanged={load} />
              ))}
            </RecordSection>
          </>
        ) : null}

        {tab === 'rewards' ? (
          <RecordSection title="Reward Credits" emptyTitle="No reward records">
            {data.rewards.map((reward) => (
              <RewardRow key={reward.id} reward={reward} installer={indexes.installers.get(reward.installer_id)} project={indexes.projects.get(reward.project_id)} />
            ))}
          </RecordSection>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Metric({ label, value, icon, accent = false }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; accent?: boolean }) {
  return (
    <Card style={styles.metric}>
      <View style={[styles.metricIcon, accent && styles.metricIconAccent]}>
        <Ionicons name={icon} size={20} color={accent ? Colors.semcoOrange : Colors.darkTeal} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

function RecordSection({ title, emptyTitle, children }: { title: string; emptyTitle: string; children: React.ReactNode[] | React.ReactNode }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length ? <View style={styles.recordList}>{items}</View> : <EmptyState icon="folder-open-outline" title={emptyTitle} body="Cloud records will appear here as installers submit work from the app." />}
    </View>
  );
}

function FormRow({ form, project, installer }: { form: PortalRecord; project?: PortalRecord; installer?: PortalRecord }) {
  const [openingPdf, setOpeningPdf] = useState(false);

  const openPdf = async () => {
    setOpeningPdf(true);
    try {
      const url = await getSignoffPdfViewUrl(form.pdf_url);
      if (url) await Linking.openURL(url);
    } catch (err) {
      console.error('[portal] open signoff pdf failed', err);
    } finally {
      setOpeningPdf(false);
    }
  };

  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View style={styles.recordIcon}>
          <Ionicons name="document-text-outline" size={20} color={Colors.darkTeal} />
        </View>
        <View style={styles.recordCopy}>
          <Text style={styles.recordTitle}>{form.title ?? 'Signed form'}</Text>
          <Text style={styles.recordMeta}>{getProjectName(project)} - {getInstallerName(installer)}</Text>
        </View>
        <Badge label={form.status ?? 'draft'} variant={form.status === 'signed' ? 'success' : 'warning'} />
      </View>
      {form.pdf_url ? <Button label="Open PDF" variant="secondary" size="sm" isLoading={openingPdf} onPress={openPdf} /> : <Text style={styles.subtle}>PDF upload pending</Text>}
    </Card>
  );
}

function OrderRow({ order, project, installer, onChanged }: { order: PortalRecord; project?: PortalRecord; installer?: PortalRecord; onChanged?: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const review = async (status: 'needs_revision' | 'approved') => {
    setBusy(true);
    try {
      await reviewOrderRequest(order.id, status);
      await onChanged?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View style={[styles.recordIcon, styles.recordIconAccent]}>
          <Ionicons name="cart-outline" size={20} color={Colors.semcoOrange} />
        </View>
        <View style={styles.recordCopy}>
          <Text style={styles.recordTitle}>{getProjectName(project)}</Text>
          <Text style={styles.recordMeta}>{getInstallerName(installer)} - {getDealerLabel(installer)}</Text>
        </View>
        <Badge label={order.status ?? 'draft'} variant={order.status === 'approved' ? 'success' : order.status === 'needs_revision' ? 'warning' : 'accent'} />
      </View>
      <Text style={styles.subtle}>{order.notes ?? 'No notes saved'}</Text>
      {onChanged && (order.status === 'in_review' || order.status === 'needs_revision') ? (
        <View style={styles.rowActions}>
          <Button label="Needs Revision" variant="secondary" size="sm" onPress={() => review('needs_revision')} disabled={busy} style={styles.rowAction} />
          <Button label="Approve" size="sm" onPress={() => review('approved')} disabled={busy} style={styles.rowAction} />
        </View>
      ) : null}
    </Card>
  );
}

function ProjectRow({ project, installer, photoCount, formCount }: { project: PortalRecord; installer?: PortalRecord; photoCount: number; formCount: number }) {
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View style={styles.recordIcon}>
          <Ionicons name="briefcase-outline" size={20} color={Colors.darkTeal} />
        </View>
        <View style={styles.recordCopy}>
          <Text style={styles.recordTitle}>{getProjectName(project)}</Text>
          <Text style={styles.recordMeta}>{getInstallerName(installer)} - {project.site_address ?? 'Address pending'}</Text>
        </View>
        <Badge label={project.status ?? 'active'} variant={project.status === 'complete' ? 'success' : 'primary'} />
      </View>
      <View style={styles.inlineStats}>
        <Text style={styles.inlineStat}>{photoCount} photos</Text>
        <Text style={styles.inlineStat}>{formCount} forms</Text>
        <Text style={styles.inlineStat}>{getDealerLabel(installer)}</Text>
      </View>
    </Card>
  );
}

function RewardRow({ reward, installer, project }: { reward: PortalRecord; installer?: PortalRecord; project?: PortalRecord }) {
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View style={[styles.recordIcon, styles.recordIconAccent]}>
          <Ionicons name="trophy-outline" size={20} color={Colors.semcoOrange} />
        </View>
        <View style={styles.recordCopy}>
          <Text style={styles.recordTitle}>{Number(reward.sqft ?? 0).toLocaleString()} sq ft</Text>
          <Text style={styles.recordMeta}>{getInstallerName(installer)} - {getProjectName(project)}</Text>
        </View>
        <Badge label={reward.status ?? 'pending'} variant={reward.status === 'verified' ? 'success' : 'warning'} />
      </View>
    </Card>
  );
}

function PrivateFileRow({ row, bucket, path, title, meta, icon }: { row: PortalRecord; bucket: string; path?: string; title: string; meta: string; icon: keyof typeof Ionicons.glyphMap }) {
  const [opening, setOpening] = useState(false);
  const open = async () => {
    if (!path) return;
    setOpening(true);
    try {
      const url = await createPrivateFileUrl(bucket, path);
      if (url) await Linking.openURL(url);
    } finally {
      setOpening(false);
    }
  };
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View style={styles.recordIcon}><Ionicons name={icon} size={20} color={Colors.darkTeal} /></View>
        <View style={styles.recordCopy}>
          <Text style={styles.recordTitle}>{title}</Text>
          <Text style={styles.recordMeta}>{meta}</Text>
        </View>
        <Badge label={row.status ?? 'Saved'} variant="primary" />
      </View>
      {path ? <Button label="Open File" variant="secondary" size="sm" onPress={open} isLoading={opening} /> : <Text style={styles.subtle}>File upload pending</Text>}
    </Card>
  );
}

function ReceiptRow({ receipt, installer, onChanged, canReview }: { receipt: PortalRecord; installer?: PortalRecord; onChanged: () => Promise<void>; canReview: boolean }) {
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const review = async (status: 'verified' | 'rejected') => {
    setBusy(true);
    try { await reviewReceipt(receipt.id, status); await onChanged(); } finally { setBusy(false); }
  };
  const open = async () => {
    if (!receipt.receipt_url) return;
    setOpening(true);
    try {
      const url = await createPrivateFileUrl('purchase-receipts', receipt.receipt_url);
      if (url) await Linking.openURL(url);
    } finally {
      setOpening(false);
    }
  };
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View style={styles.recordIcon}><Ionicons name="receipt-outline" size={20} color={Colors.darkTeal} /></View>
        <View style={styles.recordCopy}>
          <Text style={styles.recordTitle}>{receipt.receipt_number || 'Purchase receipt'}</Text>
          <Text style={styles.recordMeta}>{getInstallerName(installer)} - {Number(receipt.sqft_claimed ?? 0).toLocaleString()} sq ft</Text>
        </View>
        <Badge label={receipt.status ?? 'pending'} variant={receipt.status === 'verified' ? 'success' : 'warning'} />
      </View>
      {receipt.receipt_url ? <Button label="Open Receipt" variant="secondary" size="sm" onPress={open} isLoading={opening} /> : <Text style={styles.subtle}>Receipt image pending</Text>}
      {canReview && receipt.status === 'pending' ? (
        <View style={styles.rowActions}>
          <Button label="Reject" variant="secondary" size="sm" onPress={() => review('rejected')} disabled={busy} style={styles.rowAction} />
          <Button label="Verify" size="sm" onPress={() => review('verified')} disabled={busy} style={styles.rowAction} />
        </View>
      ) : null}
    </Card>
  );
}

function WarrantyRow({ review, project, installer, reviewerName, canReview, onChanged }: { review: PortalRecord; project?: PortalRecord; installer?: PortalRecord; reviewerName: string; canReview: boolean; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const update = async (status: 'needs_revision' | 'approved' | 'rejected') => {
    setBusy(true);
    try { await reviewWarranty(review.id, review.project_id, status, reviewerName); await onChanged(); } finally { setBusy(false); }
  };
  const openIssuedDocument = async () => {
    if (!review.warranty_document_url) return;
    setOpening(true);
    try {
      const url = await createPrivateFileUrl('warranty-documents', review.warranty_document_url);
      if (!url) throw new Error('The warranty document is not available right now.');
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Warranty document unavailable', error instanceof Error ? error.message : 'Try again in a moment.');
    } finally {
      setOpening(false);
    }
  };
  const uploadIssuedDocument = async () => {
    const selection = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (selection.canceled) return;
    const asset = selection.assets[0];
    const looksLikePdf = asset.mimeType === 'application/pdf' || asset.name.toLowerCase().endsWith('.pdf');
    if (!looksLikePdf) {
      Alert.alert('PDF required', 'Choose the completed, signed Semco warranty PDF.');
      return;
    }
    if (asset.size && asset.size > 15 * 1024 * 1024) {
      Alert.alert('PDF is too large', 'Choose a warranty PDF smaller than 15 MB.');
      return;
    }

    setBusy(true);
    try {
      await issueWarrantyDocument({
        reviewId: review.id,
        projectId: review.project_id,
        installerId: review.installer_id,
        reviewerName,
        fileUri: asset.uri,
      });
      await onChanged();
      Alert.alert('Warranty issued', 'The signed warranty PDF is now available in the contractor project.');
    } catch (error) {
      Alert.alert('Warranty not issued', error instanceof Error ? error.message : 'The PDF could not be uploaded.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View style={styles.recordIcon}><Ionicons name="shield-checkmark-outline" size={20} color={Colors.darkTeal} /></View>
        <View style={styles.recordCopy}>
          <Text style={styles.recordTitle}>{getProjectName(project)}</Text>
          <Text style={styles.recordMeta}>{getInstallerName(installer)} - {review.products_summary ?? 'Products pending'}</Text>
        </View>
        <Badge label={review.status ?? 'in_review'} variant={review.status === 'approved' ? 'success' : 'warning'} />
      </View>
      {review.status === 'approved' && !review.warranty_document_url ? (
        <Text style={styles.subtle}>Approved. Upload the completed, signed warranty PDF to issue it to the contractor.</Text>
      ) : null}
      {review.status === 'in_review' && canReview ? (
        <View style={styles.rowActions}>
          <Button label="Revision" variant="secondary" size="sm" onPress={() => update('needs_revision')} disabled={busy} style={styles.rowAction} />
          <Button label="Reject" variant="danger" size="sm" onPress={() => update('rejected')} disabled={busy} style={styles.rowAction} />
          <Button label="Approve" size="sm" onPress={() => update('approved')} disabled={busy} style={styles.rowAction} />
        </View>
      ) : null}
      {review.warranty_document_url ? (
        <Button label="Open Issued Warranty" variant="secondary" size="sm" onPress={openIssuedDocument} isLoading={opening} />
      ) : null}
      {review.status === 'approved' && canReview ? (
        <Button
          label={review.warranty_document_url ? 'Replace Warranty PDF' : 'Upload Signed Warranty PDF'}
          size="sm"
          onPress={uploadIssuedDocument}
          isLoading={busy}
        />
      ) : null}
    </Card>
  );
}

function DeletionRow({ request, installer, onChanged }: { request: PortalRecord; installer?: PortalRecord; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const start = async () => {
    setBusy(true);
    try { await completeDeletionRequest(request.id); await onChanged(); } finally { setBusy(false); }
  };
  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordTop}>
        <View style={[styles.recordIcon, styles.recordIconAccent]}><Ionicons name="person-remove-outline" size={20} color={Colors.semcoOrange} /></View>
        <View style={styles.recordCopy}>
          <Text style={styles.recordTitle}>{getInstallerName(installer)}</Text>
          <Text style={styles.recordMeta}>{request.reason ?? 'No reason supplied'}</Text>
        </View>
        <Badge label={request.status ?? 'pending'} variant="warning" />
      </View>
      {request.status === 'pending' ? <Button label="Mark Processing" variant="secondary" size="sm" onPress={start} isLoading={busy} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.appBackground },
  loadingText: { color: Colors.textSecondary, fontFamily: Fonts.semibold, fontSize: Typography.size.base },
  loginScreen: { minHeight: '100%', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, backgroundColor: Colors.navy },
  loginCard: { width: '100%', maxWidth: 520, gap: Spacing.md, padding: Spacing.xl },
  logo: { width: 260, height: 72, alignSelf: 'flex-start' },
  loginTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.xxl },
  loginBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  fieldGroup: { gap: Spacing.xs },
  fieldLabel: { color: Colors.textSecondary, fontFamily: Fonts.semibold, fontSize: Typography.size.sm, textTransform: 'uppercase' },
  input: { minHeight: 52, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, color: Colors.navy, fontFamily: Fonts.regular, fontSize: Typography.size.base, backgroundColor: Colors.white },
  errorText: { color: Colors.danger, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  shell: { flex: 1, flexDirection: Platform.OS === 'web' ? 'row' : 'column', backgroundColor: Colors.appBackground },
  shellCompact: { flexDirection: 'column' },
  sidebar: { width: 292, minHeight: '100%', gap: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.navy, display: Platform.OS === 'web' ? 'flex' : 'none' },
  sidebarHidden: { display: 'none' },
  sidebarLogo: { width: 210, height: 64, borderRadius: Radius.md, backgroundColor: Colors.white },
  portalIdentity: { gap: Spacing.xs },
  identityName: { color: Colors.white, fontFamily: Fonts.bold, fontSize: Typography.size.lg },
  identityMeta: { color: '#A7D9DD', fontFamily: Fonts.medium, fontSize: Typography.size.sm },
  navList: { gap: Spacing.sm, flex: 1 },
  navItem: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.lg, paddingHorizontal: Spacing.md },
  navItemActive: { backgroundColor: Colors.white },
  navText: { color: '#DDF4F5', fontFamily: Fonts.semibold, fontSize: Typography.size.base },
  navTextActive: { color: Colors.semcoOrange },
  content: { flexGrow: 1, width: '100%', maxWidth: 1180, alignSelf: 'center', padding: Spacing.xl, gap: Spacing.lg },
  contentCompact: { padding: Spacing.base, gap: Spacing.md },
  mobileTopbar: { display: Platform.OS === 'web' ? 'none' : 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mobileTopbarVisible: { display: 'flex' },
  mobileLogo: { width: 190, height: 58, borderRadius: Radius.md, backgroundColor: Colors.white },
  hero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg, backgroundColor: Colors.navy, padding: Spacing.xl },
  heroCompact: { gap: Spacing.md, padding: Spacing.lg },
  heroCopy: { flex: 1, gap: Spacing.sm },
  heroTitle: { color: Colors.white, fontFamily: Fonts.bold, fontSize: Typography.size.xxl },
  heroTitleCompact: { fontSize: Typography.size.xl },
  heroBody: { color: '#C9E8EA', fontFamily: Fonts.regular, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  heroIcon: { width: 72, height: 72, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.semcoOrange },
  heroIconCompact: { width: 52, height: 52 },
  mobileTabs: { display: Platform.OS === 'web' ? 'none' : 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  mobileTabsVisible: { display: 'flex' },
  mobileTab: { borderRadius: Radius.full, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  mobileTabActive: { backgroundColor: Colors.accentMuted, borderColor: Colors.semcoOrange },
  mobileTabText: { color: Colors.navy, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  mobileTabTextActive: { color: Colors.semcoOrange },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  metric: { flexGrow: 1, flexBasis: Platform.OS === 'web' ? 170 : 145, gap: Spacing.xs },
  metricIcon: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryMuted },
  metricIconAccent: { backgroundColor: Colors.accentMuted },
  metricValue: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.xl },
  metricLabel: { color: Colors.textSecondary, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  section: { gap: Spacing.md },
  sectionTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.xl },
  recordList: { gap: Spacing.md },
  recordCard: { gap: Spacing.md },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  rowAction: { flexGrow: 1, minWidth: 120 },
  recordTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  recordIcon: { width: 46, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryMuted },
  recordIconAccent: { backgroundColor: Colors.accentMuted },
  recordCopy: { flex: 1, gap: 2 },
  recordTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  recordMeta: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm },
  subtle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.45 },
  inlineStats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  inlineStat: { color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.sm, backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
});
