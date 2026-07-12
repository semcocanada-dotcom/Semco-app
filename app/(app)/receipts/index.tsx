import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader, Button, Card, Input, SectionHeader } from '@/components/ui';
import { db } from '@/database/client';
import { purchaseReceipts, rewardCredits } from '@/database/schema/installers';
import { useAuthStore } from '@/store/auth';
import { LOCAL_INSTALLER_ID } from '@/services/installer-profile';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { createLocalId } from '@/utils/id';

export default function ReceiptSubmissionScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const installerId = user?.id ?? LOCAL_INSTALLER_ID;
  const [dealerName, setDealerName] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [sqftClaimed, setSqftClaimed] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submitReceipt() {
    const sqft = Number.parseFloat(sqftClaimed);
    if (!Number.isFinite(sqft) || sqft <= 0) return;

    setSaving(true);
    setSaved(false);
    try {
      const now = new Date().toISOString();
      const receiptId = createLocalId('receipt');
      await db.insert(purchaseReceipts).values({
        id: receiptId,
        installerId,
        projectId: null,
        dealerName: dealerName.trim() || null,
        receiptNumber: receiptNumber.trim() || null,
        receiptUrl: null,
        sqftClaimed: sqft,
        status: 'pending',
        notes: notes.trim() || null,
        createdAt: now,
        updatedAt: now,
        reviewedAt: null,
      });

      await db.insert(rewardCredits).values({
        id: createLocalId('reward'),
        installerId,
        projectId: null,
        sourceType: 'receipt',
        sourceId: receiptId,
        sqft,
        status: 'pending',
        notes: `Receipt submitted${dealerName.trim() ? ` from ${dealerName.trim()}` : ''}.`,
        createdAt: now,
        verifiedAt: null,
      });

      setSaved(true);
      setDealerName('');
      setReceiptNumber('');
      setSqftClaimed('');
      setNotes('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AppHeader title="Submit Receipt" subtitle="Manual purchase proof for reward review." rightIcon="receipt-outline" />

        <Card elevated style={styles.heroCard}>
          <Text style={styles.heroTitle}>Receipt credit is pending until reviewed.</Text>
          <Text style={styles.heroBody}>
            This records the square footage claim for Semco review. Verified receipts count toward reward tiers.
          </Text>
        </Card>

        <SectionHeader title="Purchase Details" subtitle="Use this when material was bought outside the app order flow." />
        <Input label="Dealer / Store" value={dealerName} onChangeText={setDealerName} placeholder="Modern Arc, Diamond Arc, or dealer name" />
        <Input label="Receipt Number" value={receiptNumber} onChangeText={setReceiptNumber} placeholder="Optional" />
        <Input label="Square Feet Purchased" value={sqftClaimed} onChangeText={setSqftClaimed} keyboardType="decimal-pad" placeholder="e.g. 750" suffix="sq ft" />
        <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Products, order details, or review notes" multiline />

        {saved ? <Text style={styles.savedText}>Receipt submitted for review.</Text> : null}
        <Button label="Submit for Review" onPress={submitReceipt} isLoading={saving} disabled={!sqftClaimed.trim()} fullWidth size="lg" />
        <Button label="View Reward Progress" variant="secondary" onPress={() => router.push('/rewards' as any)} fullWidth />
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
    paddingBottom: Spacing.xxxl + 44,
    gap: Spacing.md,
  },
  heroCard: { gap: Spacing.sm, borderColor: Colors.primaryMuted, backgroundColor: Colors.surfaceElevated },
  heroTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  heroBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  savedText: {
    color: Colors.success,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
});
