import React, { useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { db } from '@/database/client';
import { projectSignoffs, type ProjectSignoff, type ProjectSignoffType } from '@/database/schema/signoffs';
import type { Project } from '@/database/schema/projects';
import { PROJECT_SIGNOFF_TEMPLATES, getSignoffTemplate } from '@/constants/project-signoffs';
import { Badge, Button, Card, Input } from '@/components/ui';
import { EditablePdfForm } from '@/components/projects/EditablePdfForm';
import { getSignoffPdfViewUrl, syncProjectSignoffToCloud } from '@/services/signoffs-cloud';
import {
  addCustomerSignoffConsentAudit,
  CUSTOMER_SIGNOFF_PRIVACY_NOTICE,
  CUSTOMER_SIGNOFF_PRIVACY_POLICY_URL,
  CUSTOMER_SIGNOFF_SUPPORT_URL,
  readCustomerSignoffConsentAudit,
} from '@/services/customer-signoff-consent';
import { formatSqftFromSqm } from '@/utils/area';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { createLocalId } from '@/utils/id';

type ProjectSignoffPanelProps = {
  project: Project;
  signoffs: ProjectSignoff[];
  onSaved: () => void;
};

type FormValues = Record<string, string>;

function parseFormData(value?: string | null): FormValues {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as FormValues;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getLatestSignoff(signoffs: ProjectSignoff[], type: ProjectSignoffType): ProjectSignoff | undefined {
  return signoffs
    .filter((signoff) => signoff.type === type)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

function getProjectPrefill(project: Project, prefill?: 'projectName' | 'projectLocation' | 'surfaceArea'): string {
  switch (prefill) {
    case 'projectName':
      return project.clientName ?? 'Project';
    case 'projectLocation':
      return project.siteAddress ?? '';
    case 'surfaceArea':
      return formatSqftFromSqm(project.totalAreaSqm);
    default:
      return '';
  }
}

function getTemplateDefaults(project: Project, template: ReturnType<typeof getSignoffTemplate>): FormValues {
  return template.fields.reduce<FormValues>((values, field) => {
    const value = getProjectPrefill(project, field.prefill);
    if (value) values[field.id] = value;
    return values;
  }, {});
}

export function ProjectSignoffPanel({ project, signoffs, onSaved }: ProjectSignoffPanelProps) {
  const [selectedType, setSelectedType] = useState<ProjectSignoffType>('mockup_color_acceptance');
  const selectedTemplate = getSignoffTemplate(selectedType);
  const existing = useMemo(() => getLatestSignoff(signoffs, selectedType), [selectedType, signoffs]);
  const [customerName, setCustomerName] = useState(project.clientName ?? '');
  const [customerEmail, setCustomerEmail] = useState(project.clientEmail ?? '');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [formData, setFormData] = useState<FormValues>({});
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [customerPrivacyAcceptedAt, setCustomerPrivacyAcceptedAt] = useState<string | null>(null);
  const [customerPrivacyAcceptedType, setCustomerPrivacyAcceptedType] = useState<ProjectSignoffType | null>(null);
  const [openingPdf, setOpeningPdf] = useState(false);

  React.useEffect(() => {
    setCustomerName(existing?.customerName ?? project.clientName ?? '');
    setCustomerEmail(existing?.customerEmail ?? project.clientEmail ?? '');
    setSummary(existing?.summary ?? '');
    setNotes(existing?.notes ?? '');
    const nextFormData = existing ? parseFormData(existing.formData) : getTemplateDefaults(project, selectedTemplate);
    setFormData(nextFormData);
    setSignatureData(existing?.signatureData ?? null);
    const privacyAudit = readCustomerSignoffConsentAudit(nextFormData);
    setCustomerPrivacyAcceptedAt(privacyAudit?.acceptedAt ?? null);
    setCustomerPrivacyAcceptedType(privacyAudit ? selectedType : null);
  }, [existing, project, selectedTemplate, selectedType]);

  const updateField = (id: string, value: string) => {
    if (id === 'customerName') {
      setCustomerName(value);
      return;
    }
    setFormData((current) => ({ ...current, [id]: value }));
  };
  const hasSignature = Boolean(signatureData);
  const hasCurrentCustomerPrivacyConsent = Boolean(
    customerPrivacyAcceptedAt && customerPrivacyAcceptedType === selectedType,
  );
  const formValues = useMemo(
    () => ({
      ...formData,
      customerName,
    }),
    [customerName, formData],
  );

  const save = async (status: 'draft' | 'signed') => {
    if (!hasCurrentCustomerPrivacyConsent || !customerPrivacyAcceptedAt) {
      Alert.alert(
        'Customer privacy acknowledgement required',
        'The customer must choose I Agree & Continue before any sign-off details can be saved or uploaded.',
      );
      return;
    }
    if (status === 'signed' && !hasSignature) {
      Alert.alert('Signature needed', 'Have the customer sign before saving this as signed.');
      return;
    }

    const now = new Date().toISOString();
    const signoffId = existing?.id ?? createLocalId('signoff');
    const savedFormData = addCustomerSignoffConsentAudit({
      ...formData,
      customerName,
      signedDate: formData.signedDate || (status === 'signed' ? new Date().toLocaleDateString() : ''),
    }, customerPrivacyAcceptedAt);
    let savedPdfUri = existing ? parseFormData(existing.formData).savedPdfUri : undefined;
    let cloudPdfUrl = existing ? parseFormData(existing.formData).cloudPdfUrl : undefined;
    if (status === 'signed') {
      try {
        const { createFilledSignoffPdf, uploadSignoffPdf } = await import('../../services/signoff-pdf');
        const filledPdf = await createFilledSignoffPdf({
          projectId: project.id,
          template: selectedTemplate,
          values: savedFormData,
          signatureData,
        });
        savedPdfUri = filledPdf.localUri ?? undefined;
        if (savedPdfUri) savedFormData.savedPdfUri = savedPdfUri;
        cloudPdfUrl = await uploadSignoffPdf(filledPdf, project.installerId, project.id, signoffId, selectedTemplate) ?? cloudPdfUrl;
        if (cloudPdfUrl) savedFormData.cloudPdfUrl = cloudPdfUrl;
      } catch (error) {
        console.error('[ProjectSignoffPanel] filled PDF failed:', error);
        Alert.alert('PDF file not created', 'The sign-off was saved, but the filled PDF file could not be generated on this device.');
      }
    }
    const values = {
      projectId: project.id,
      installerId: project.installerId,
      type: selectedType,
      status,
      title: selectedTemplate.title,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      summary: summary || selectedTemplate.acknowledgement,
      notes: notes || null,
      formData: JSON.stringify(savedFormData),
      signatureData,
      signedAt: status === 'signed' ? now : existing?.signedAt ?? null,
      updatedAt: now,
    };

    if (existing) {
      await db.update(projectSignoffs).set(values).where(eq(projectSignoffs.id, existing.id));
    } else {
      await db.insert(projectSignoffs).values({
        id: signoffId,
        ...values,
        createdAt: now,
      });
    }

    const syncedToCloud = await syncProjectSignoffToCloud({
      id: signoffId,
      projectId: project.id,
      installerId: project.installerId,
      template: selectedTemplate,
      status,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      summary: values.summary,
      notes: notes || null,
      formData: savedFormData,
      signatureData,
      signedAt: values.signedAt,
      cloudPdfUrl,
      updatedAt: now,
    });

    onSaved();
    Alert.alert(
      status === 'signed' ? 'Signed form saved' : 'Draft saved',
      status === 'signed' && cloudPdfUrl
        ? `${selectedTemplate.title} is attached to this project and saved to the cloud for Semco review.`
        : status === 'signed' && savedPdfUri
          ? `${selectedTemplate.title} is attached to this project and saved as a filled PDF. Cloud upload will need to be retried when storage is available.`
        : syncedToCloud
          ? `${selectedTemplate.title} is attached to this project and synced for Semco review.`
          : `${selectedTemplate.title} is attached to this project. Cloud sync will retry after storage is configured.`,
    );
  };

  const openSavedPdf = async () => {
    const storagePath = existing ? parseFormData(existing.formData).cloudPdfUrl : undefined;
    if (!storagePath || openingPdf) return;

    setOpeningPdf(true);
    try {
      const url = await getSignoffPdfViewUrl(storagePath);
      if (!url) {
        Alert.alert('PDF unavailable', 'The saved PDF could not be opened. Check your connection and try again.');
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      console.error('[ProjectSignoffPanel] open PDF failed:', error);
      Alert.alert('PDF unavailable', 'The saved PDF could not be opened. Check your connection and try again.');
    } finally {
      setOpeningPdf(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Card style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="document-text-outline" size={22} color={Colors.darkTeal} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Project forms and customer sign-offs</Text>
          <Text style={styles.heroBody}>
            Keep approvals, sample sign-offs, change orders, and warranty handover records inside this project file.
          </Text>
        </View>
      </Card>

      <View style={styles.templateGrid}>
        {PROJECT_SIGNOFF_TEMPLATES.map((template) => {
          const active = template.type === selectedType;
          const saved = getLatestSignoff(signoffs, template.type);
          return (
            <TouchableOpacity
              key={template.type}
              onPress={() => setSelectedType(template.type)}
              activeOpacity={0.78}
              style={[styles.templateCard, active && styles.templateCardActive]}
            >
              <View style={styles.templateTop}>
                <Text style={[styles.templateTitle, active && styles.templateTitleActive]}>{template.shortTitle}</Text>
                {saved ? <Badge label={saved.status === 'signed' ? 'Signed' : 'Draft'} variant={saved.status === 'signed' ? 'success' : 'warning'} /> : null}
              </View>
              <Text style={styles.templateBody}>{template.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Card style={styles.formCard}>
        <View style={styles.formHeader}>
          <View style={styles.formHeaderCopy}>
            <Text style={styles.formTitle}>{selectedTemplate.title}</Text>
            <Text style={styles.formSubtitle}>{selectedTemplate.description}</Text>
            <Text style={styles.sourceText}>Source: {selectedTemplate.sourceDocument}</Text>
          </View>
          <Badge label={existing?.status === 'signed' ? 'Signed' : existing ? 'Draft' : 'New'} variant={existing?.status === 'signed' ? 'success' : existing ? 'warning' : 'neutral'} />
        </View>

        {!hasCurrentCustomerPrivacyConsent ? (
          <View style={styles.privacyGate}>
            <View style={styles.privacyGateHeader}>
              <Ionicons name="shield-checkmark-outline" size={24} color={Colors.darkTeal} />
              <View style={styles.privacyGateHeaderCopy}>
                <Text style={styles.privacyGateTitle}>Customer privacy acknowledgement</Text>
                <Text style={styles.privacyGateSubtitle}>Please hand the device to the customer before continuing.</Text>
              </View>
            </View>
            <Text style={styles.privacyGateBody}>{CUSTOMER_SIGNOFF_PRIVACY_NOTICE}</Text>
            <View style={styles.privacyLinks}>
              <TouchableOpacity onPress={() => { void Linking.openURL(CUSTOMER_SIGNOFF_PRIVACY_POLICY_URL); }}>
                <Text style={styles.privacyLink}>Read the Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { void Linking.openURL(CUSTOMER_SIGNOFF_SUPPORT_URL); }}>
                <Text style={styles.privacyLink}>Privacy support</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actions}>
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => {
                  setCustomerPrivacyAcceptedAt(null);
                  setCustomerPrivacyAcceptedType(null);
                  Alert.alert('Not continued', 'No new sign-off details were captured or uploaded.');
                }}
                style={styles.actionButton}
              />
              <Button
                label="I Agree & Continue"
                variant="primary"
                onPress={() => {
                  setCustomerPrivacyAcceptedAt(new Date().toISOString());
                  setCustomerPrivacyAcceptedType(selectedType);
                }}
                style={styles.actionButton}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.privacyAccepted}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <View style={styles.privacyAcceptedCopy}>
                <Text style={styles.privacyAcceptedTitle}>Customer privacy notice accepted</Text>
                <Text style={styles.privacyAcceptedTime}>
                  {customerPrivacyAcceptedAt ? new Date(customerPrivacyAcceptedAt).toLocaleString() : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => { void Linking.openURL(CUSTOMER_SIGNOFF_PRIVACY_POLICY_URL); }}>
                <Text style={styles.privacyLink}>Policy</Text>
              </TouchableOpacity>
            </View>

            <EditablePdfForm
              template={selectedTemplate}
              values={formValues}
              signatureData={signatureData}
              onChangeField={updateField}
              onChangeSignature={setSignatureData}
            />

            <View style={styles.notice}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.darkTeal} />
              <Text style={styles.noticeText}>{selectedTemplate.acknowledgement}</Text>
            </View>

            <Input label="Customer email (stored with project; no automatic email)" value={customerEmail} onChangeText={setCustomerEmail} placeholder="Customer email" keyboardType="email-address" autoCapitalize="none" />

            <View style={styles.fieldWrap}>
              <Text style={styles.inputLabel}>Record summary</Text>
              <TextInput
                value={summary}
                onChangeText={setSummary}
                placeholder="Optional internal summary. The PDF form wording stays unchanged."
                placeholderTextColor={Colors.textDisabled}
                selectionColor={Colors.primary}
                multiline
                textAlignVertical="top"
                style={styles.textArea}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.inputLabel}>Internal notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional internal notes for Semco review"
                placeholderTextColor={Colors.textDisabled}
                selectionColor={Colors.primary}
                multiline
                textAlignVertical="top"
                style={styles.textArea}
              />
            </View>

            <View style={styles.actions}>
              <Button label="Save Draft" variant="secondary" onPress={() => save('draft')} style={styles.actionButton} />
              <Button label="Save Signed" variant="primary" onPress={() => save('signed')} style={styles.actionButton} />
            </View>
            {existing && parseFormData(existing.formData).cloudPdfUrl ? (
              <Button label="Open Saved PDF" variant="secondary" onPress={openSavedPdf} isLoading={openingPdf} />
            ) : null}
          </>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  hero: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    borderColor: Colors.primaryMuted,
    backgroundColor: Colors.surfaceElevated,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  heroCopy: { flex: 1, gap: Spacing.xs },
  heroTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.lg },
  heroBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.45 },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  templateCard: {
    width: '48%',
    flexGrow: 1,
    minHeight: 116,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  templateCardActive: { borderColor: Colors.semcoOrange, backgroundColor: Colors.accentMuted },
  templateTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.xs },
  templateTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.base },
  templateTitleActive: { color: Colors.semcoOrange },
  templateBody: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.4 },
  formCard: { gap: Spacing.md },
  formHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  formHeaderCopy: { flex: 1, gap: 3 },
  formTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.lg },
  formSubtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.4 },
  sourceText: {
    color: Colors.darkTeal,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
  },
  fieldWrap: { gap: Spacing.xs },
  inputLabel: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    textTransform: 'uppercase',
  },
  textArea: {
    minHeight: 92,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.35,
  },
  singleLine: { minHeight: 48 },
  notice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#C6EEF0',
    padding: Spacing.md,
  },
  noticeText: { flex: 1, color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.4 },
  privacyGate: {
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#C6EEF0',
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.lg,
  },
  privacyGateHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  privacyGateHeaderCopy: { flex: 1, gap: 2 },
  privacyGateTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.lg },
  privacyGateSubtitle: { color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  privacyGateBody: { color: Colors.textPrimary, fontFamily: Fonts.regular, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.55 },
  privacyLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  privacyLink: { color: Colors.darkTeal, fontFamily: Fonts.bold, fontSize: Typography.size.sm, textDecorationLine: 'underline' },
  privacyAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#B9E5D0',
    backgroundColor: '#F0FBF5',
    padding: Spacing.md,
  },
  privacyAcceptedCopy: { flex: 1, gap: 2 },
  privacyAcceptedTitle: { color: Colors.navy, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
  privacyAcceptedTime: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionButton: { flex: 1 },
});
