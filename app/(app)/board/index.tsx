import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, Badge, Card, EmptyState } from '@/components/ui';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';
import { useTenderReviewVersion } from '@/hooks/useTenderReviewAccess';
import { BOARD_STATUS_LABELS, tenderReviewStub } from '@/services/tender-review';
import { useAuthStore } from '@/store/auth';

export default function ProjectBoardScreen() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  useTenderReviewVersion();
  const cards = tenderReviewStub.listVisibleCards(userId);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppHeader
          title="Project board"
          subtitle="Shared only with profiles the owner selects."
          rightIcon="albums-outline"
        />
        <Card elevated>
          <Badge label="Phase 0 stub" variant="neutral" />
          <Text style={styles.notice}>
            Boards stay on this device. Nothing is synced, pushed, or sent to Ops.
          </Text>
        </Card>

        {cards.length === 0 ? (
          <EmptyState
            icon="albums-outline"
            title="No boards are shared with this profile"
            body="A board appears here only after the owner grants this profile access."
          />
        ) : (
          <View style={styles.list}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => router.push({ pathname: '/board/[id]', params: { id: card.id } } as any)}
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel={card.title}
                style={styles.cardButton}
              >
                <Card style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.project}>{card.projectLabel}</Text>
                    <Badge label={BOARD_STATUS_LABELS[card.status]} variant={card.status === 'shared' ? 'success' : 'warning'} />
                  </View>
                  <Text style={styles.title}>{card.title}</Text>
                  <Text style={styles.summary}>{card.summary}</Text>
                  <View style={styles.openRow}>
                    <Text style={styles.open}>Open board</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.darkTeal} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl + 44,
  },
  notice: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
    marginTop: Spacing.sm,
  },
  list: { gap: Spacing.sm },
  cardButton: { borderRadius: Radius.lg },
  card: { gap: Spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  project: {
    flex: 1,
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  summary: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  open: { color: Colors.darkTeal, fontFamily: Fonts.semibold, fontSize: Typography.size.sm },
});
