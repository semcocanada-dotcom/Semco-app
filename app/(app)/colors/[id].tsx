import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';
import { Ionicons } from '@expo/vector-icons';
import { db, initDatabase } from '@/database/client';
import { seedDatabase } from '@/database/seed';
import colorsData from '@/database/seed/colors.json';
import { colors } from '@/database/schema/colors';
import type { Color } from '@/database/schema/colors';
import { Button, Card, Badge, EmptyState } from '@/components/ui';
import { FormulaDisplay } from '@/components/colors/FormulaDisplay';
import { lightImpactHaptic } from '@/utils/haptics';
import { Colors, Fonts, Layout, Typography, Spacing, Radius } from '@/constants/theme';

const STANDARD_COLORS = colorsData as Color[];

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function findBundledColor(value?: string) {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return (
    STANDARD_COLORS.find((standardColor) => standardColor.id === value) ??
    STANDARD_COLORS.find((standardColor) => standardColor.code?.toLowerCase() === normalized) ??
    null
  );
}

export default function ColorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const colorId = getParamValue(id);
  const router = useRouter();
  const [color, setColor] = useState<Color | null>(() => findBundledColor(colorId));
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!colorId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const resolvedColorId = colorId;
    const fallbackColor = findBundledColor(resolvedColorId);
    setColor(fallbackColor);
    setIsLoading(true);

    async function loadColor() {
      try {
        await initDatabase();
        await seedDatabase();
        const rows = await db.select().from(colors).where(eq(colors.id, resolvedColorId));
        if (isMounted) setColor(rows[0] ?? fallbackColor);
      } catch (error) {
        console.error(error);
        if (isMounted) setColor(fallbackColor);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadColor();

    return () => {
      isMounted = false;
    };
  }, [colorId]);

  if (!color) {
    return (
      <SafeAreaView style={styles.safe}>
        {isLoading ? (
          <Text style={styles.loading}>Loading...</Text>
        ) : (
          <View style={styles.emptyWrap}>
            <EmptyState icon="color-palette-outline" title="Color not found" body="Go back to the color grid and choose another swatch." />
            <Button label="Back to colors" variant="primary" onPress={() => router.replace('/colors' as any)} fullWidth />
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.name}>{color.name}</Text>
            {color.code ? <Text style={styles.code}>{color.code}</Text> : null}
          </View>
          <Badge
            label={color.isStandard ? 'Standard' : 'Custom'}
            variant={color.isStandard ? 'neutral' : 'primary'}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() => {
            lightImpactHaptic();
            setPreviewOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Enlarge ${color.name} colour reference`}
          style={styles.previewButton}
        >
          {color.photoUrl ? (
            <Image
              source={{ uri: color.photoUrl }}
              style={styles.photo}
              contentFit="cover"
              transition={200}
            />
          ) : color.swatchHex ? (
            <View style={[styles.photo, styles.swatchPanel, { backgroundColor: color.swatchHex }]}>
              <View style={styles.swatchCodePill}>
                <Text style={styles.swatchCodeText}>{color.swatchHex}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="image-outline" size={40} color={Colors.textDisabled} />
              <Text style={styles.photoPlaceholderText}>No swatch yet</Text>
            </View>
          )}
          <View style={styles.enlargePill}>
            <Ionicons name="expand-outline" size={15} color={Colors.primary} />
            <Text style={styles.enlargeText}>Tap to enlarge</Text>
          </View>
        </TouchableOpacity>

        <Card style={styles.referenceCard}>
          <Ionicons name="information-circle-outline" size={19} color={Colors.semcoOrange} />
          <Text style={styles.referenceText}>
            Colour shown is a screen reference only. Verify final selection with an approved physical sample before install.
          </Text>
        </Card>

        <FormulaDisplay pigments={color.pigments} colorName={color.name} />

        {color.notes ? (
          <Card>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{color.notes}</Text>
          </Card>
        ) : null}
      </ScrollView>

      <Modal visible={isPreviewOpen} transparent animationType="fade" onRequestClose={() => setPreviewOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              onPress={() => {
                lightImpactHaptic();
                setPreviewOpen(false);
              }}
              style={styles.modalClose}
              accessibilityRole="button"
              accessibilityLabel="Close colour preview"
            >
              <Ionicons name="close" size={22} color={Colors.navy} />
            </TouchableOpacity>
            {color.photoUrl ? (
              <Image source={{ uri: color.photoUrl }} style={styles.modalSwatch} contentFit="cover" transition={200} />
            ) : (
              <View style={[styles.modalSwatch, { backgroundColor: color.swatchHex ?? Colors.softGrey }]} />
            )}
            <Text style={styles.modalTitle}>{color.name}</Text>
            {color.code ? <Text style={styles.modalCode}>{color.code}</Text> : null}
            <Text style={styles.modalReference}>
              Screen colour is reference only. Confirm with a physical sample.
            </Text>
          </View>
        </View>
      </Modal>
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
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl + 64,
  },
  back: { marginBottom: Spacing.sm },
  emptyWrap: {
    flex: 1,
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    justifyContent: 'center',
    gap: Spacing.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  titleLeft: { flex: 1 },
  name: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
  code: { color: Colors.textSecondary, fontSize: Typography.size.sm, marginTop: 2 },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceElevated,
  },
  previewButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.navy,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  enlargePill: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    minHeight: 34,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  enlargeText: {
    color: Colors.primary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  referenceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderColor: Colors.accentMuted,
    backgroundColor: Colors.surfaceElevated,
  },
  referenceText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.sm * 1.45,
  },
  swatchPanel: {
    justifyContent: 'flex-end',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swatchCodePill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  swatchCodeText: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  photoPlaceholderText: { color: Colors.textDisabled, fontSize: Typography.size.sm },
  notesLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: Spacing.sm,
  },
  notesText: { color: Colors.textPrimary, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  loading: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,35,45,0.72)',
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  modalClose: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 2,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalSwatch: {
    width: '100%',
    height: 360,
    borderRadius: Radius.lg,
    backgroundColor: Colors.softGrey,
  },
  modalTitle: {
    color: Colors.navy,
    fontSize: Typography.size.xl,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  modalCode: {
    color: Colors.textSecondary,
    fontSize: Typography.size.base,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  modalReference: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.sm * 1.45,
  },
});
