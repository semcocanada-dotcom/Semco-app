import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
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
import { Card, Badge } from '@/components/ui';
import { FormulaDisplay } from '@/components/colors/FormulaDisplay';
import { Colors, Fonts, Typography, Spacing, Radius } from '@/constants/theme';

const STANDARD_COLORS = colorsData as Color[];

export default function ColorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [color, setColor] = useState<Color | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadColor() {
      const fallbackColor = STANDARD_COLORS.find((standardColor) => standardColor.id === id) ?? null;

      try {
        await initDatabase();
        await seedDatabase();
        const rows = await db.select().from(colors).where(eq(colors.id, id));
        if (isMounted) setColor(rows[0] ?? fallbackColor);
      } catch (error) {
        console.error(error);
        if (isMounted) setColor(fallbackColor);
      }
    }

    loadColor();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!color) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Loading...</Text>
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

        <FormulaDisplay pigments={color.pigments} colorName={color.name} />

        {color.notes ? (
          <Card>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{color.notes}</Text>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: { padding: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  back: { marginBottom: Spacing.sm },
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
});
