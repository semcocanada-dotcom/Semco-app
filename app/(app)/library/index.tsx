import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db, initDatabase } from '@/database/client';
import { seedDatabase } from '@/database/seed';
import colorsData from '@/database/seed/colors.json';
import { products } from '@/database/schema/products';
import { colors } from '@/database/schema/colors';
import type { Product } from '@/database/schema/products';
import type { Color } from '@/database/schema/colors';
import { BrandMark } from '@/components/brand/BrandMark';
import { ActionCard, Badge, Card, SectionHeader } from '@/components/ui';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { TECHNICAL_DOCS, TECHNICAL_DOC_PAGES } from '@/knowledge/technical-docs';

const HUB_CARDS = [
  { title: 'Products', description: 'Browse seeded product data and future uploads.', icon: 'cube-outline' as const, route: '/products' },
  { title: 'Colours', description: 'Review the standard palette and custom mixes.', icon: 'color-palette-outline' as const, route: '/colors' },
  { title: 'Calculator', description: 'Run coverage calculations off the same library.', icon: 'calculator-outline' as const, route: '/calculator' },
  { title: 'Assistant', description: 'Look up product guidance and process notes.', icon: 'chatbubble-ellipses-outline' as const, route: '/assistant' },
] as const;

const STANDARD_COLORS = colorsData as Color[];

export default function LibraryScreen() {
  const router = useRouter();
  const push = (href: string) => router.push(href as any);
  const [productCount, setProductCount] = React.useState(0);
  const [colorCount, setColorCount] = React.useState(0);
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [colorsList, setColorsList] = React.useState<Color[]>(STANDARD_COLORS.slice(0, 3));

  React.useEffect(() => {
    let isMounted = true;

    async function loadLibrary() {
      try {
        await initDatabase();
        await seedDatabase();
        const [productRows, colorRows] = await Promise.all([db.select().from(products), db.select().from(colors)]);
        if (!isMounted) return;
        setProductsList(productRows);
        setColorsList(colorRows.length > 0 ? colorRows : STANDARD_COLORS.slice(0, 3));
        setProductCount(productRows.length);
        setColorCount(colorRows.length || STANDARD_COLORS.length);
      } catch (error) {
        console.error(error);
        if (!isMounted) return;
        setColorsList(STANDARD_COLORS.slice(0, 3));
        setColorCount(STANDARD_COLORS.length);
      }
    }

    loadLibrary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card elevated style={styles.heroCard}>
          <View style={styles.heroTop}>
            <BrandMark />
            <Badge label="Library" variant="primary" />
          </View>
          <Text style={styles.heroTitle}>Everything that backs the install lives here.</Text>
          <Text style={styles.heroBody}>
            Product sheets, colour formulas, calculator inputs and Semco technical docs all share the same visual language.
          </Text>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Library hubs" subtitle="Jump into the core working surfaces." />
          <View style={styles.cardsGrid}>
            {HUB_CARDS.map((card, index) => (
              <ActionCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                tone={index % 2 === 0 ? 'primary' : 'accent'}
                onPress={() => push(card.route)}
                style={styles.hubCard}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Current seed data" subtitle="Loaded content available for field lookup." />
          <View style={styles.statsRow}>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{productCount}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{colorCount}</Text>
              <Text style={styles.statLabel}>Colours</Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={styles.statValue}>{TECHNICAL_DOCS.length}</Text>
              <Text style={styles.statLabel}>Docs</Text>
            </Card>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Technical docs"
            subtitle={`${TECHNICAL_DOC_PAGES.length} searchable pages loaded into Ask Semco.`}
          />
          {TECHNICAL_DOCS.map((doc) => (
            <Card key={doc.id} style={styles.lineCard}>
              <View style={styles.lineTop}>
                <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
                <Text style={styles.lineTitle}>{doc.title}</Text>
                <Badge label={doc.category} variant="neutral" />
              </View>
              <Text style={styles.lineBody}>{doc.pageCount} page{doc.pageCount === 1 ? '' : 's'}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Seeded products" subtitle="A quick look at the current local catalogue." />
          {productsList.slice(0, 3).map((product) => (
            <Card key={product.id} style={styles.lineCard}>
              <View style={styles.lineTop}>
                <Text style={styles.lineTitle}>{product.name}</Text>
                <Badge label={product.category.replace(/_/g, ' ')} variant={product.category === 'finish_coat' ? 'accent' : 'neutral'} />
              </View>
              <Text style={styles.lineBody}>{product.sku}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Seeded colours" subtitle="The standard palette is ready for later uploads." />
          {colorsList.slice(0, 3).map((color) => (
            <Card key={color.id} style={styles.lineCard}>
              <View style={styles.lineTop}>
                <View style={styles.colorDot} />
                <Text style={styles.lineTitle}>{color.name}</Text>
                <Badge label={color.isStandard ? 'Standard' : 'Custom'} variant={color.isStandard ? 'primary' : 'accent'} />
              </View>
              <Text style={styles.lineBody}>{color.code ?? 'No code yet'}</Text>
            </Card>
          ))}
        </View>

        <Card style={styles.noteCard}>
          <View style={styles.noteRow}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.accent} />
            <Text style={styles.noteText}>Your later upload can slot in without reworking the layout.</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  scroll: { padding: Spacing.base, paddingBottom: Spacing.xxxl + 16, gap: Spacing.lg },
  heroCard: { gap: Spacing.md, borderColor: Colors.primaryMuted, backgroundColor: Colors.surfaceElevated },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  heroTitle: { color: Colors.textPrimary, fontSize: Typography.size.xxl, lineHeight: Typography.size.xxl * 1.05, fontWeight: Typography.weight.bold },
  heroBody: { color: Colors.textSecondary, fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  section: { gap: Spacing.md },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  hubCard: { width: '48%' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statBox: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { color: Colors.textPrimary, fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold },
  statLabel: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontWeight: Typography.weight.medium },
  lineCard: { gap: 6 },
  lineTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  lineTitle: { color: Colors.textPrimary, fontSize: Typography.size.base, fontWeight: Typography.weight.bold, flex: 1 },
  lineBody: { color: Colors.textSecondary, fontSize: Typography.size.sm },
  colorDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.accent, borderWidth: 1, borderColor: Colors.border },
  noteCard: { borderColor: Colors.accentMuted },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  noteText: { color: Colors.textSecondary, fontSize: Typography.size.sm, flex: 1, lineHeight: Typography.size.sm * 1.45 },
});
