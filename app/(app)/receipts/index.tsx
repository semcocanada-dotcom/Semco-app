import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { AppHeader, Button, Card, Input, SectionHeader } from '@/components/ui';
import { db } from '@/database/client';
import { purchaseReceipts } from '@/database/schema/installers';
import { useAuthStore } from '@/store/auth';
import { LOCAL_INSTALLER_ID } from '@/services/installer-profile';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { createLocalId } from '@/utils/id';
import { pickReceiptPhoto, uploadPrivatePhoto, type CapturedPhoto } from '@/services/camera';
import { syncPurchaseReceiptToCloud } from '@/services/cloud-sync';
import { Radius } from '@/constants/theme';

export default function ReceiptSubmissionScreen() {
  const user = useAuthStore((s) => s.user);
  const installerId = user?.id ?? LOCAL_INSTALLER_ID;
  const [dealerName, setDealerName] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cloudPending, setCloudPending] = useState(false);
  const [receiptPhoto, setReceiptPhoto] = useState<CapturedPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitReceipt() {
    if (!receiptPhoto) {
      setError('Attach a clear receipt photo so Semco can review the purchase record.');
      return;
    }

    setSaving(true);
    setSaved(false);
    setCloudPending(false);
    setError(null);
    try {
      const now = new Date().toISOString();
      const receiptId = createLocalId('receipt');
      const upload = await uploadPrivatePhoto(
        receiptPhoto.localUri,
        'purchase-receipts',
        `${installerId}/${receiptId}/receipt.jpg`,
      );
      if (!upload) {
        setError('The receipt photo could not be uploaded. Check your connection and try again.');
        return;
      }
      const createdReceipt = {
        id: receiptId,
        installerId,
        projectId: null,
        dealerName: dealerName.trim() || null,
        receiptNumber: receiptNumber.trim() || null,
        receiptUrl: upload.storagePath,
        sqftClaimed: 0,
        status: 'pending',
        notes: notes.trim() || null,
        createdAt: now,
        updatedAt: now,
        reviewedAt: null,
      };
      await db.insert(purchaseReceipts).values(createdReceipt);

      const receiptCloud = await syncPurchaseReceiptToCloud(createdReceipt);
      const pendingCloudUpload = !receiptCloud.ok;

      setSaved(true);
      setCloudPending(pendingCloudUpload);
      setDealerName('');
      setReceiptNumber('');
      setNotes('');
      setReceiptPhoto(null);
      setError(
        pendingCloudUpload
          ? 'Saved on this device. The cloud review copy will retry when the app reconnects.'
          : null,
      );
    } catch (submitError) {
      console.error('[receipts] submission failed', submitError);
      setError('The receipt could not be saved. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AppHeader title="Submit Receipt" subtitle="Purchase proof for Semco record review." rightIcon="receipt-outline" />

        <Card elevated style={styles.heroCard}>
          <Text style={styles.heroTitle}>Receipt is pending until reviewed.</Text>
          <Text style={styles.heroBody}>
            This sends the purchase record to Semco for verification and account support.
          </Text>
        </Card>

        <SectionHeader title="Purchase Details" subtitle="Use this when material was bought outside the app order flow." />
        <Input label="Dealer / Store" value={dealerName} onChangeText={setDealerName} placeholder="Modern Arc, Diamond Arc, or dealer name" />
        <Input label="Receipt Number" value={receiptNumber} onChangeText={setReceiptNumber} placeholder="Optional" />
        <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Products, order details, or review notes" multiline />

        <View style={styles.attachmentWrap}>
          {receiptPhoto ? <Image source={{ uri: receiptPhoto.localUri }} style={styles.receiptImage} contentFit="cover" /> : null}
          <Button
            label={receiptPhoto ? 'Replace Receipt Photo' : 'Attach Receipt Photo'}
            variant="secondary"
            onPress={async () => {
              const picked = await pickReceiptPhoto();
              if (picked) { setReceiptPhoto(picked); setError(null); }
            }}
            fullWidth
          />
          <Text style={styles.attachmentHint}>Use a clear image showing the dealer, products, and purchase details.</Text>
        </View>

        {saved ? (
          <Text style={styles.savedText}>
            {cloudPending ? 'Receipt saved. Cloud upload pending.' : 'Receipt submitted for review.'}
          </Text>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button label="Submit for Review" onPress={submitReceipt} isLoading={saving} disabled={!receiptPhoto} fullWidth size="lg" />
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
  attachmentWrap: { gap: Spacing.sm },
  receiptImage: { width: '100%', aspectRatio: 4 / 3, borderRadius: Radius.md, backgroundColor: Colors.softGrey },
  attachmentHint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs, lineHeight: Typography.size.xs * 1.4 },
  errorText: { color: Colors.danger, fontFamily: Fonts.semibold, fontSize: Typography.size.sm, textAlign: 'center' },
});
