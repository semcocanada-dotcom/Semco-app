import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { BarCodeScanner, type BarCodeScannerResult } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/database/client';
import { batchLogs } from '@/database/schema/batches';
import { Input, Button, Card } from '@/components/ui';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface Props {
  projectId: string;
  onSave: () => void;
  onCancel: () => void;
}

export function BatchLogForm({ projectId, onSave, onCancel }: Props) {
  const [productId, setProductId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [coverageSqm, setCoverageSqm] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const openScanner = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera Permission', 'Camera access is required to scan barcodes.');
      return;
    }
    setHasPermission(true);
    setScannerVisible(true);
  };

  const handleScan = ({ data }: BarCodeScannerResult) => {
    setBatchNumber(data);
    setScannerVisible(false);
  };

  const handleSave = async () => {
    if (!batchNumber.trim()) {
      Alert.alert('Validation', 'Batch number is required.');
      return;
    }
    if (!productId.trim()) {
      Alert.alert('Validation', 'Product SKU is required.');
      return;
    }
    setSaving(true);
    try {
      await db.insert(batchLogs).values({
        id: `batch-${Date.now()}`,
        projectId,
        productId: productId.trim(),
        batchNumber: batchNumber.trim(),
        quantityKg: quantityKg ? parseFloat(quantityKg) : null,
        coverageAchievedSqm: coverageSqm ? parseFloat(coverageSqm) : null,
        appliedAt: new Date().toISOString(),
        notes: notes.trim() || null,
      });
      onSave();
    } catch (err) {
      Alert.alert('Save Error', err instanceof Error ? err.message : 'Could not save batch log');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card style={styles.form}>
        <Text style={styles.title}>Add Batch Log</Text>

        <Input
          label="Product SKU"
          value={productId}
          onChangeText={setProductId}
          placeholder="e.g. BASE-COAT-1K"
          autoCapitalize="characters"
        />

        <View style={styles.batchRow}>
          <View style={styles.batchInput}>
            <Input
              label="Batch Number"
              value={batchNumber}
              onChangeText={setBatchNumber}
              placeholder="Scan or type"
            />
          </View>
          <TouchableOpacity onPress={openScanner} style={styles.scanBtn}>
            <Ionicons name="barcode-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input
              label="Quantity (kg)"
              value={quantityKg}
              onChangeText={setQuantityKg}
              keyboardType="decimal-pad"
              placeholder="e.g. 4.5"
            />
          </View>
          <View style={styles.halfInput}>
            <Input
              label="Coverage (m²)"
              value={coverageSqm}
              onChangeText={setCoverageSqm}
              keyboardType="decimal-pad"
              placeholder="e.g. 12"
            />
          </View>
        </View>

        <Input
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any application notes"
        />

        <View style={styles.actions}>
          <Button label="Cancel" onPress={onCancel} variant="ghost" style={styles.actionBtn} />
          <Button
            label={saving ? 'Saving…' : 'Save Batch'}
            onPress={handleSave}
            style={styles.actionBtn}
          />
        </View>
      </Card>

      <Modal visible={scannerVisible} animationType="slide" onRequestClose={() => setScannerVisible(false)}>
        <View style={styles.scannerContainer}>
          {hasPermission && (
            <BarCodeScanner
              onBarCodeScanned={handleScan}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerHint}>Point at the barcode on Semco packaging</Text>
          </View>
          <TouchableOpacity
            style={styles.scannerClose}
            onPress={() => setScannerVisible(false)}
          >
            <Ionicons name="close-circle" size={40} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const FRAME_SIZE = 240;

const styles = StyleSheet.create({
  form: { gap: Spacing.md },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  batchRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  batchInput: { flex: 1 },
  scanBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfInput: { flex: 1 },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  actionBtn: { flex: 1 },
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  scannerFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    backgroundColor: 'transparent',
  },
  scannerHint: {
    color: Colors.textPrimary,
    fontSize: Typography.size.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  scannerClose: {
    position: 'absolute',
    top: 56,
    right: Spacing.base,
  },
});
