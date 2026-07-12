import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  clearAssistantDebugLogs,
  getAssistantDebugLogs,
  type AssistantDebugLog,
} from '@/services/ai/assistant-cache';
import { getConfiguredProviderStatus } from '@/services/ai/providers';
import { Badge, EmptyState } from '@/components/ui';
import { isSemcoAdminUser } from '@/services/admin-access';
import { useAuthStore } from '@/store/auth';
import { Colors, Fonts, Layout, Radius, Spacing, TAP_TARGET_MIN, Typography } from '@/constants/theme';

export default function AssistantDebugScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = isSemcoAdminUser(user);
  const [logs, setLogs] = React.useState<AssistantDebugLog[]>([]);
  const providerStatus = getConfiguredProviderStatus();

  React.useEffect(() => {
    if (!isAdmin) {
      router.replace('/assistant' as any);
    }
  }, [isAdmin, router]);

  const loadLogs = React.useCallback(async () => {
    setLogs(await getAssistantDebugLogs());
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLogs();
    }, [loadLogs]),
  );

  const clearLogs = async () => {
    await clearAssistantDebugLogs();
    setLogs([]);
  };

  if (!isAdmin) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.navy} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Assistant Debug</Text>
          <Text style={styles.subtitle}>
            {providerStatus.provider} / {providerStatus.model} / {providerStatus.configured ? 'configured' : 'not configured'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={clearLogs}
          style={styles.clearBtn}
          accessibilityLabel="Clear debug logs"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="analytics-outline"
            title="No assistant logs"
            body="Ask Semco a question, then return here to inspect retrieval and generation."
          />
        }
        renderItem={({ item }) => <DebugCard log={item} />}
      />
    </SafeAreaView>
  );
}

function DebugCard({ log }: { log: AssistantDebugLog }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Badge label={log.status} variant={log.status === 'generated' ? 'success' : log.status === 'fallback' ? 'warning' : 'neutral'} />
        <Text style={styles.time}>{new Date(log.timestamp).toLocaleString()}</Text>
      </View>
      <Text style={styles.question}>{log.question}</Text>
      <Text style={styles.meta}>Provider: {log.provider}</Text>
      <Text style={styles.meta}>Retrieval: {log.retrievalNotes.join(', ') || 'none'}</Text>
      {log.error ? <Text style={styles.error}>Error: {log.error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chunks</Text>
        {log.chunks.length === 0 ? (
          <Text style={styles.muted}>No document chunks.</Text>
        ) : (
          log.chunks.map((chunk) => (
            <View key={chunk.id} style={styles.chunk}>
              <Text style={styles.chunkTitle}>
                {chunk.documentName}{chunk.pageNumber ? ` p. ${chunk.pageNumber}` : ''}
              </Text>
              <Text style={styles.meta}>
                {chunk.retrieval} / score {Number(chunk.score).toFixed(3)}
              </Text>
              <Text style={styles.preview}>{chunk.preview}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Answer Preview</Text>
        <Text style={styles.preview}>{log.answerPreview}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  header: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
  },
  backBtn: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    borderRadius: TAP_TARGET_MIN / 2,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: {
    color: Colors.navy,
    fontSize: Typography.size.xl,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  clearBtn: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  time: { color: Colors.textDisabled, fontSize: Typography.size.xs, fontFamily: Fonts.regular },
  question: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  meta: { color: Colors.textSecondary, fontSize: Typography.size.xs, fontFamily: Fonts.regular },
  error: { color: Colors.danger, fontSize: Typography.size.xs, fontFamily: Fonts.semibold },
  section: { gap: Spacing.xs, marginTop: Spacing.xs },
  sectionTitle: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  chunk: {
    borderRadius: Radius.md,
    backgroundColor: Colors.softGrey,
    padding: Spacing.sm,
    gap: 4,
  },
  chunkTitle: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  preview: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.45,
    fontFamily: Fonts.regular,
  },
  muted: { color: Colors.textDisabled, fontSize: Typography.size.sm, fontFamily: Fonts.regular },
});
