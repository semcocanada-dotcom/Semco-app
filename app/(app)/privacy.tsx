import React from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { PRIVACY_POLICY_URL, SEMCO_PRIVACY_EMAIL, SEMCO_SUPPORT_URL } from '@/constants/legal';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'What this app collects',
    body: 'The Semco Pro app stores installer company profile details (company name, contact name, email, phone, address), project records (site address, customer name, email, phone number, and job notes), stage photos taken for warranty qualification, filled sign-off forms including customer signatures, purchase receipt submissions, and material request details.',
  },
  {
    title: 'Why it is collected',
    body: 'This information is used to run the core workflows of the app: project tracking, material requests to the assigned Semco dealer, warranty qualification and review, customer sign-off records, and purchase receipt review.',
  },
  {
    title: 'Where it is stored',
    body: "Records are stored on this device and, when submitted or synced, in Semco Canada's secure cloud services (Supabase). Sign-off PDFs and photos are stored in access-controlled cloud storage. Semco Guide questions and saved guide conversations are stored only on this device.",
  },
  {
    title: 'Customer project data authorization',
    body: 'Before customer fields are shown for a new project, the installer must confirm that the customer gave permission, or that the installer has other legal authority, to store the customer name, email, phone number, site address, notes, and related project records. Cancel returns without saving. The notice version, full text, and acceptance time are stored with the project.',
  },
  {
    title: 'Customer sign-off acknowledgement',
    body: 'Before customer sign-off fields or the signature pad appear, the customer is shown a cloud-storage, access, purpose, retention, deletion, and contact notice and must choose I Agree & Continue. Cancel does not capture or upload new sign-off details. The notice version, full text, and acceptance time are stored with the sign-off and added to a privacy-audit page in a signed PDF. A customer email is stored with the project and is not emailed automatically.',
  },
  {
    title: 'Semco Guide',
    body: 'Semco Guide is a local reference tool. It uses deterministic calculators, coded field rules, and technical text installed with the app. Questions, recent guide context, searches, and answers are processed on the device and are not sent to an external model or semantic-search service.',
  },
  {
    title: 'Who can see it',
    body: 'Submitted project, photo, sign-off, and material-request records are visible to authorized Semco Canada staff and, where a dealer is assigned, to that dealer for project documentation, review, pricing, material-request support, and warranty support. Customer signatures and sign-off forms are only used for the project record they belong to. Information is not sold. Supabase processes only the information needed to provide account, project, storage, and submission services.',
  },
  {
    title: 'Your choices',
    body: 'You can edit your company profile in the app at any time. From More > Account and Security, you can permanently delete your account, associated cloud records and private files, and data stored by this app on this device. Deletion is completed immediately after you confirm it and cannot be undone.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroBody}>
            How the Semco Pro app handles installer, project, and customer information.
          </Text>
        </Card>

        {SECTIONS.map((section) => (
          <Card key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </Card>
        ))}

        <View style={styles.footer}>
          <Button label="Open Public Privacy Policy" variant="secondary" onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} fullWidth />
          <Button label="Contact Semco Canada" variant="ghost" onPress={() => Linking.openURL(SEMCO_SUPPORT_URL)} fullWidth />
          <Text style={styles.footerText}>
            Questions about this policy: {SEMCO_PRIVACY_EMAIL}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    gap: Spacing.md,
  },
  heroCard: { gap: Spacing.sm, borderColor: Colors.primaryMuted, backgroundColor: Colors.surfaceElevated },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xl,
    lineHeight: Typography.size.xl * 1.12,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  heroBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
    fontFamily: Fonts.regular,
  },
  sectionCard: { gap: Spacing.xs },
  sectionTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  sectionBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.55,
  },
  footer: { paddingVertical: Spacing.md },
  footerText: {
    color: Colors.textDisabled,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.xs,
    textAlign: 'center',
  },
});
