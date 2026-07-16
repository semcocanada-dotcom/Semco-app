import React from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { PRIVACY_POLICY_URL } from '@/constants/legal';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'What this app collects',
    body: 'The Semco Pro app stores installer company profile details (company name, contact name, email, phone, address), project records (site address, customer name and email, job notes), stage photos taken for warranty qualification, filled sign-off forms including customer signatures, purchase receipt submissions, material request details, and reward progress records.',
  },
  {
    title: 'Why it is collected',
    body: 'This information is used to run the core workflows of the app: project tracking, material requests to the assigned Semco dealer, warranty qualification and review, customer sign-off records, purchase receipt verification, and reward tier progress.',
  },
  {
    title: 'Where it is stored',
    body: "Records are stored on this device and, when submitted or synced, in Semco Canada's secure cloud services (Supabase). Sign-off PDFs and photos are stored in access-controlled cloud storage. Questions sent to Ask Semco are processed by Google Firebase AI services to generate an answer.",
  },
  {
    title: 'Who can see it',
    body: 'Submitted records are visible to Semco Canada administrators and, where a dealer is assigned, to that dealer for order review and pricing. Customer signatures and sign-off forms are only used for the project record they belong to. Information is not sold or shared with unrelated third parties.',
  },
  {
    title: 'Your choices',
    body: 'You can edit your company profile in the app at any time. Account deletion can be initiated from More > Account and Security. Semco completes deletion requests within 30 days, subject only to legal recordkeeping requirements for signed customer contracts.',
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
          <Text style={styles.footerText}>
            Questions about this policy: semcocanada@gmail.com
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
