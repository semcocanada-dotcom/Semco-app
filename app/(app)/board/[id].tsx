import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { Colors, Fonts, Layout, Radius, Spacing, Typography } from '@/constants/theme';
import { useTenderReviewVersion } from '@/hooks/useTenderReviewAccess';
import {
  BOARD_STATUS_LABELS,
  PROFILE_KIND_LABELS,
  tenderReviewStub,
} from '@/services/tender-review';
import { useAuthStore } from '@/store/auth';

export default function ProjectBoardDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const cardId = Array.isArray(params.id) ? params.id[0] : params.id;
  const userId = useAuthStore((state) => state.user?.id ?? null);
  useTenderReviewVersion();
  const isOwner = tenderReviewStub.isOwner(userId);
  const card = cardId && cardId !== 'inbox' ? tenderReviewStub.getVisibleCard(userId, cardId) : null;
  const profiles = isOwner ? tenderReviewStub.listShareProfiles(userId) : [];
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!cardId || !userId || !isOwner) return;
    setSelected(tenderReviewStub.listGrantsForCard(userId, cardId).map((grant) => grant.granteeUserId));
  }, [cardId, isOwner, userId]);

  const toggle = (profileUserId: string) => {
    setSelected((current) =>
      current.includes(profileUserId)
        ? current.filter((id) => id !== profileUserId)
        : [...current, profileUserId],
    );
    setMessage(null);
  };

  const save = () => {
    if (!card || !userId) return;
    try {
      tenderReviewStub.setCardGrants(userId, card.id, selected);
      setMessage('Profile selection saved in this stub. Nothing was sent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Profile selection could not be saved.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        {!card ? (
          <EmptyState
            icon="lock-closed-outline"
            title="This board is not available to this profile"
            body="Only the owner and profiles granted on this board can open it."
          />
        ) : (
          <>
            <View style={styles.titleBlock}>
              <Badge label={BOARD_STATUS_LABELS[card.status]} variant={card.status === 'shared' ? 'success' : 'warning'} />
              <Text style={styles.project}>{card.projectLabel}</Text>
              <Text style={styles.title}>{card.title}</Text>
              <Text style={styles.summary}>{card.summary}</Text>
            </View>

            {isOwner ? (
              <Card style={styles.shareCard}>
                <Text style={styles.sectionTitle}>Select profiles</Text>
                <Text style={styles.sectionBody}>
                  Choose the installer, GC, or other profiles who can see this board. This Phase 0 control writes the local stub only. It does not sync, push, or notify anyone.
                </Text>
                <View style={styles.profileList}>
                  {profiles.map((profile) => {
                    const checked = selected.includes(profile.userId);
                    return (
                      <TouchableOpacity
                        key={profile.userId}
                        onPress={() => toggle(profile.userId)}
                        style={styles.profileRow}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                        accessibilityLabel={`${profile.displayName}, ${PROFILE_KIND_LABELS[profile.profileKind]}`}
                      >
                        <Ionicons
                          name={checked ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={checked ? Colors.darkTeal : Colors.textSecondary}
                        />
                        <View style={styles.profileCopy}>
                          <Text style={styles.profileName}>{profile.displayName}</Text>
                          <Text style={styles.profileKind}>{PROFILE_KIND_LABELS[profile.profileKind]}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Button label="Save profile selection" onPress={save} />
                {message ? <Text style={styles.message}>{message}</Text> : null}
              </Card>
            ) : (
              <Card>
                <Text style={styles.sectionBody}>Shared with your profile. Decision notes stay with the owner.</Text>
              </Card>
            )}
          </>
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
  back: { marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  titleBlock: { gap: Spacing.sm },
  project: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  summary: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.5,
  },
  shareCard: { gap: Spacing.md },
  sectionTitle: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  sectionBody: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  profileList: { gap: Spacing.sm },
  profileRow: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  profileCopy: { flex: 1, gap: 2 },
  profileName: { color: Colors.navy, fontFamily: Fonts.semibold, fontSize: Typography.size.base },
  profileKind: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.xs },
  message: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: Typography.size.sm },
});
