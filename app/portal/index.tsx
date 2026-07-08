import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getDealerLabel,
  getInstallerName,
  getPortalData,
  getPortalSessionProfile,
  getProjectName,
  signInPortal,
  signOutPortal,
  type PortalData,
  type PortalRecord,
} from '@/services/portal-cloud';
import { getSignoffPdfViewUrl } from '@/services/signoff-pdf';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

type PortalTab = 'overview' | 'orders' | 'forms' | 'projects' | 'rewards';

const TABS: { value: PortalTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'overview', label: 'Overview', icon: 'grid-outline' },
  { value: 'orders', label: 'Orders', icon: 'cart-outline' },
  { value: 'forms', label: 'Forms', icon: 'document-text-outline' },
  { value: 'projects', label: 'Projects', icon: 'briefcase-outline' },
  { value: 'rewards', label: 'Rewards', icon: 'trophy-outline' },
];

export default function SemcoPortalScreen() {
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
    <View style={styles.shell}>
      <View style={styles.sidebar}>
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mobileTopbar}>
          <Image source={require('../../assets/images/semco-surfaces-logo.png')} style={styles.mobileLogo} resizeMode="contain" />
          <Button label="Sign Out" variant="secondary" size="sm" onPress={handleSignOut} />
        </View>

        <Card elevated style={styles.hero}>
          <View style={styles.heroCopy}>
            <Badge label={data.profile.role === 'semco_admin' ? 'Full access' : 'Assigned dealer'} variant="accent" />
            <Text style={styles.heroTitle}>Semco command portal</Text>
            <Text style={styles.heroBody}>
              Review the cloud record for installer accounts, signed forms, dealer material requests, photos, warranty status, and rewards.
            </Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark-outline" size={34} color={Colors.white} />
          </View>
        </Card>

        <View style={styles.mobileTabs}>
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
              <Metric label="Orders" value={String(stats.pendingOrders)} icon="cart-outline" accent />
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
              <OrderRow key={order.id} order={order} project={indexes.projects.get(order.project_id)} installer={indexes.installers.get(indexes.projects.get(order.project_id)?.installer_id)} />
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

function OrderRow({ order, project, installer }: { order: PortalRecord; project?: PortalRecord; installer?: PortalRecord }) {
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
  sidebar: { width: 292, minHeight: '100%', gap: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.navy, display: Platform.OS === 'web' ? 'flex' : 'none' },
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
  mobileTopbar: { display: Platform.OS === 'web' ? 'none' : 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mobileLogo: { width: 190, height: 58, borderRadius: Radius.md, backgroundColor: Colors.white },
  hero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.lg, backgroundColor: Colors.navy, padding: Spacing.xl },
  heroCopy: { flex: 1, gap: Spacing.sm },
  heroTitle: { color: Colors.white, fontFamily: Fonts.bold, fontSize: Typography.size.xxl },
  heroBody: { color: '#C9E8EA', fontFamily: Fonts.regular, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  heroIcon: { width: 72, height: 72, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.semcoOrange },
  mobileTabs: { display: Platform.OS === 'web' ? 'none' : 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
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
