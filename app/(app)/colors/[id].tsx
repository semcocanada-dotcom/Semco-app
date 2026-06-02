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
import { db } from '@/database/client';
import { colors } from '@/database/schema/colors';
import type { Color, PigmentRatio } from '@/database/schema/colors';
import { Card, Badge } from '@/components/ui';
import { FormulaDisplay } from '@/components/colors/FormulaDisplay';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function ColorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [color, setColor] = useState<Color | null>(null);

  useEffect(() => {
    if (!id) return;
    db.select().from(colors).where(eq(colors.id, id)).then((rows) => {
      setColor(rows[0] ?? null);
    }).catch(console.error);
  }, [id]);

  if (!color) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const pigments = (color.pigments as PigmentRatio[]) ?? [];

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
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Ionicons name="image-outline" size={40} color={Colors.textDisabled} />
            <Text style={styles.photoPlaceholderText}>No photo yet</Text>
          </View>
        )}

        <FormulaDisplay pigments={pigments} colorName={color.name} />

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
    height: 220,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceElevated,
  },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  photoPlaceholderText: { color: Colors.textDisabled, fontSize: Typography.size.sm },
  notesLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: Spacing.sm,
  },
  notesText: { color: Colors.textPrimary, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  loading: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl },
});
