import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAssistant } from '@/hooks/useAssistant';
import { ChatBubble } from '@/components/assistant/ChatBubble';
import { TypingIndicator } from '@/components/assistant/TypingIndicator';
import { OfflineBanner } from '@/components/assistant/OfflineBanner';
import { Colors, Fonts, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';
import type { ConversationMessage } from '@/database/schema/conversations';

export default function AssistantScreen() {
  const router = useRouter();
  const { messages, isLoading, error, send, clearHistory, isOnline } = useAssistant();
  const [inputText, setInputText] = React.useState('');
  const listRef = useRef<FlatList<ConversationMessage>>(null);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    send(text);
  };

  const handleBack = () => {
    Keyboard.dismiss();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/library' as any);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear conversation?',
      'This will delete all messages from this chat session. This cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: async () => {
            await clearHistory();
          },
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {!isOnline && <OfflineBanner />}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.navy} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Ask Semco</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{isOnline ? 'SOURCE-BASED' : 'LOCAL'}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Direct answers from Semco docs, with source labels when available.
          </Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.clearBtn}
            accessibilityLabel="Clear conversation history"
          >
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.heroCard}>
            <Ionicons name="document-text-outline" size={34} color={Colors.primary} />
            <Text style={styles.emptyTitle}>Ask a Semco install question</Text>
            <Text style={styles.emptyBody}>
              Type the exact jobsite question. The assistant will answer directly and cite the closest source when it has one.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.messageList}
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity
            onPress={Keyboard.dismiss}
            style={styles.dismissBtn}
            accessibilityLabel="Dismiss keyboard"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-down" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask a technical question..."
            placeholderTextColor={Colors.textDisabled}
            selectionColor={Colors.primary}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
            disabled={!inputText.trim() || isLoading}
            accessibilityLabel="Send message"
          >
            <Ionicons name="arrow-up" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
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
  headerContent: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  title: { color: Colors.navy, fontSize: Typography.size.xl, fontFamily: Fonts.bold, fontWeight: Typography.weight.bold },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontFamily: Fonts.regular, lineHeight: Typography.size.sm * 1.4 },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.8,
  },
  clearBtn: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  messageList: { paddingVertical: Spacing.sm, paddingBottom: Spacing.md },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.navy,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
  },
  emptyBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.size.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  dismissBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.lightTeal,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.regular,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    borderRadius: TAP_TARGET_MIN / 2,
    backgroundColor: Colors.semcoOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
