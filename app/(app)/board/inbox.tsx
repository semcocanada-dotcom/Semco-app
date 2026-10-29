import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader, Badge, Button, Card, EmptyState, Input } from '@/components/ui';
import { Colors, Fonts, Layout, Spacing, Typography } from '@/constants/theme';
import { useTenderReviewVersion } from '@/hooks/useTenderReviewAccess';
import {
  decisionInboxHref,
  tenderReviewStub,
  type DecisionAction,
  type InboxItem,
} from '@/services/tender-review';
import { useAuthStore } from '@/store/auth';

const ACTION_VARIANTS: Record<DecisionAction, 'primary' | 'danger' | 'secondary'> = {
  approve: 'primary',
  deny: 'danger',
  suggest: 'secondary',
};

export default function DecisionInboxScreen() {
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  useTenderReviewVersion();
  const isOwner = Boolean(userId && tenderReviewStub.isOwner(userId));
  const inboxHref = decisionInboxHref(isOwner);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inboxHref) router.replace('/board' as any);
  }, [inboxHref, router]);

  const items = isOwner ? tenderReviewStub.listInbox(userId) : [];
  const decisions = isOwner ? tenderReviewStub.listDecisions(userId) : [];

  const decide = (item: InboxItem, action: DecisionAction) => {
    if (!userId) return;
    try {
      tenderReviewStub.recordDecision(userId, {
        subjectType: item.subjectType,
        subjectId: item.subjectId,
        action,
        note: notes[item.subjectId] ?? null,
      });
      setNotes((current) => ({ ...current, [item.subjectId]: '' }));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Decision could not be recorded.');
    }
  };

  if (!isOwner) {
    return <SafeAreaView style={styles.safe} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppHeader
          title="Decision inbox"
          subtitle="Owner only. Approve, deny, or suggest. Nothing is sent to Ops."
          rightIcon="lock-closed-outline"
        />
        <Card elevated>
          <Badge label="Private stub" variant="warning" />
          <Text style={styles.notice}>
            Decisions write local stub state for this Phase 0 review. Push, OTA, and the Ops webhook are not connected.
          </Text>
        </Card>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {items.length === 0 ? (
          <EmptyState icon="checkmark-done-outline" title="Inbox is clear" body="Open alternate packs and scout items will show up here." />
        ) : (
          items.map((item) => (
            <Card key={item.subjectId} style={styles.item}>
              <Badge label={item.subjectType === 'alternate_pack' ? 'Alternate pack' : 'Scout queue'} variant="primary" />
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBody}>{item.summary}</Text>
              <Input
                label="Note"
                accessibilityLabel={`Note for ${item.title}`}
                value={notes[item.subjectId] ?? ''}
                onChangeText={(value) => setNotes((current) => ({ ...current, [item.subjectId]: value }))}
                placeholder="Optional note"
                multiline
              />
              <View style={styles.actions}>
                {(['approve', 'deny', 'suggest'] as const).map((action) => (
                  <Button
                    key={action}
                    label={action === 'approve' ? 'Approve' : action === 'deny' ? 'Deny' : 'Suggest'}
                    variant={ACTION_VARIANTS[action]}
                    size="sm"
                    onPress={() => decide(item, action)}
                    style={styles.action}
                  />
                ))}
              </View>
            </Card>
          ))
        )}

        {decisions.length > 0 ? (
          <View style={styles.recorded}>
            <Text style={styles.recordedTitle}>Recorded in this stub</Text>
            {decisions.map((decision) => (
              <Card key={decision.id}>
                <Text style={styles.decisionAction}>{decision.action}</Text>
                <Text style={styles.itemBody}>
                  {decision.note ?? 'No note'} · {decision.actorId}
                </Text>
                <Text style={styles.timestamp}>{decision.createdAt}</Text>
              </Card>
            ))}
          </View>
        ) : null}
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
  error: { color: Colors.danger, fontFamily: Fonts.medium, fontSize: Typography.size.sm },
  item: { gap: Spacing.sm },
  itemTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  itemBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  action: { flexGrow: 1, flexBasis: 96 },
  recorded: { gap: Spacing.sm },
  recordedTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  decisionAction: {
    color: Colors.navy,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    textTransform: 'capitalize',
  },
  timestamp: { color: Colors.textDisabled, fontFamily: Fonts.regular, fontSize: Typography.size.xs, marginTop: Spacing.xs },
});
