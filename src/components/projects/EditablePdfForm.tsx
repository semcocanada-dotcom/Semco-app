import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { PdfFormField, SignoffTemplate } from '@/constants/project-signoffs';
import { Button, Card } from '@/components/ui';
import { SignaturePad, SignaturePreview } from '@/components/projects/SignaturePad';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

type EditablePdfFormProps = {
  template: SignoffTemplate;
  values: Record<string, string>;
  signatureData?: string | null;
  onChangeField: (id: string, value: string) => void;
  onChangeSignature: (value: string | null) => void;
};

const PAGE_RATIO = 1584 / 1224;

function getFieldValue(field: PdfFormField, values: Record<string, string>) {
  if (field.type === 'signature') return '';
  if (field.type === 'date' && !values[field.id]) return '';
  return values[field.id] ?? '';
}

export function EditablePdfForm({ template, values, signatureData, onChangeField, onChangeSignature }: EditablePdfFormProps) {
  const [pageWidth, setPageWidth] = useState(0);
  const [editingField, setEditingField] = useState<PdfFormField | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [signatureOpen, setSignatureOpen] = useState(false);

  const openField = (field: PdfFormField) => {
    Haptics.selectionAsync().catch(() => undefined);
    if (field.type === 'signature') {
      setSignatureOpen(true);
      return;
    }
    const nextValue = field.type === 'date' && !values[field.id] ? new Date().toLocaleDateString() : getFieldValue(field, values);
    setDraftValue(nextValue);
    setEditingField(field);
  };

  const saveField = () => {
    if (!editingField) return;
    onChangeField(editingField.id, draftValue);
    setEditingField(null);
    setDraftValue('');
  };

  const pageHeight = pageWidth * PAGE_RATIO;

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarIcon}>
          <Ionicons name="hand-left-outline" size={18} color={Colors.darkTeal} />
        </View>
        <Text style={styles.toolbarText}>Tap any line to enter text. Tap Signature to open the signing surface.</Text>
      </View>

      <Card style={styles.pageCard}>
        <View
          style={[styles.page, pageWidth ? { height: pageHeight } : null]}
          onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
        >
          {pageWidth ? <Image source={template.pdfPage} style={styles.pageImage} resizeMode="contain" /> : null}
          {pageWidth
            ? template.pdfFields.map((field) => {
                const value = getFieldValue(field, values);
                const isSignature = field.type === 'signature';
                const hasValue = isSignature ? Boolean(signatureData) : Boolean(value);
                return (
                  <TouchableOpacity
                    key={`${template.type}-${field.id}`}
                    activeOpacity={0.75}
                    onPress={() => openField(field)}
                    style={[
                      styles.tapZone,
                      {
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: `${field.width}%`,
                        height: `${field.height}%`,
                      },
                      hasValue ? styles.tapZoneFilled : styles.tapZoneEmpty,
                    ]}
                  >
                    {isSignature ? (
                      hasValue ? (
                        <SignaturePreview value={signatureData} />
                      ) : (
                        <Text style={styles.emptyText}>Tap to sign</Text>
                      )
                    ) : value ? (
                      <Text
                        numberOfLines={field.type === 'multiline' ? 4 : 1}
                        adjustsFontSizeToFit={field.type !== 'multiline'}
                        minimumFontScale={0.72}
                        style={[styles.fieldText, field.fontSize ? { fontSize: field.fontSize } : null]}
                      >
                        {value}
                      </Text>
                    ) : (
                      <Text numberOfLines={1} style={styles.emptyText}>{field.label}</Text>
                    )}
                  </TouchableOpacity>
                );
              })
            : null}
        </View>
      </Card>

      <Modal visible={Boolean(editingField)} transparent animationType="fade" onRequestClose={() => setEditingField(null)}>
        <View style={styles.modalShade}>
          <View style={styles.editorCard}>
            <Text style={styles.editorLabel}>{editingField?.label}</Text>
            <TextInput
              value={draftValue}
              onChangeText={setDraftValue}
              autoFocus
              multiline={editingField?.type === 'multiline'}
              textAlignVertical={editingField?.type === 'multiline' ? 'top' : 'center'}
              selectionColor={Colors.primary}
              placeholder={editingField?.label}
              placeholderTextColor={Colors.textDisabled}
              style={[styles.editorInput, editingField?.type === 'multiline' && styles.editorMultiline]}
            />
            <View style={styles.editorActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setEditingField(null)} style={styles.editorButton} />
              <Button label="Save Field" variant="primary" onPress={saveField} style={styles.editorButton} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={signatureOpen} animationType="slide" onRequestClose={() => setSignatureOpen(false)}>
        <View style={styles.signatureScreen}>
          <View style={styles.signatureHeader}>
            <TouchableOpacity onPress={() => setSignatureOpen(false)} style={styles.closeButton} accessibilityRole="button">
              <Ionicons name="close" size={24} color={Colors.navy} />
            </TouchableOpacity>
            <View style={styles.signatureCopy}>
              <Text style={styles.signatureTitle}>Customer signature</Text>
              <Text style={styles.signatureHint}>Turn the phone sideways if they want more room.</Text>
            </View>
          </View>
          <SignaturePad
            value={signatureData}
            onChange={onChangeSignature}
            height={340}
            hint="Use a finger or stylus. Clear and sign again if needed."
          />
          <Button label="Done" variant="primary" onPress={() => setSignatureOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.md,
  },
  toolbarIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  toolbarText: { flex: 1, color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.sm, lineHeight: Typography.size.sm * 1.35 },
  pageCard: { padding: Spacing.xs, backgroundColor: Colors.white },
  page: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
  },
  pageImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  tapZone: {
    position: 'absolute',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  tapZoneEmpty: {
    borderWidth: 1,
    borderColor: Colors.lightTeal,
    backgroundColor: 'rgba(5, 186, 194, 0.11)',
  },
  tapZoneFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
  },
  fieldText: {
    color: Colors.navy,
    fontFamily: Fonts.semibold,
    fontSize: 10,
    lineHeight: 12,
  },
  emptyText: {
    color: Colors.darkTeal,
    fontFamily: Fonts.bold,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  modalShade: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: 'rgba(0, 35, 45, 0.42)',
  },
  editorCard: {
    gap: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    shadowColor: '#00232D',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  editorLabel: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.lg },
  editorInput: {
    minHeight: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.navy,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.base,
  },
  editorMultiline: { minHeight: 140 },
  editorActions: { flexDirection: 'row', gap: Spacing.sm },
  editorButton: { flex: 1 },
  signatureScreen: {
    flex: 1,
    gap: Spacing.lg,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.background,
  },
  signatureHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  closeButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signatureCopy: { flex: 1, gap: 2 },
  signatureTitle: { color: Colors.navy, fontFamily: Fonts.bold, fontSize: Typography.size.xl },
  signatureHint: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm },
});
