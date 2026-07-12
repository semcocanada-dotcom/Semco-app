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
import { SavedChatsSheet } from '@/components/assistant/SavedChatsSheet';
import { ReplyChips } from '@/components/assistant/ReplyChips';
import { getConfiguredProviderStatus } from '@/services/ai/providers';
import { lightImpactHaptic, mediumImpactHaptic, selectionHaptic } from '@/utils/haptics';
import { isSemcoAdminUser } from '@/services/admin-access';
import { useAuthStore } from '@/store/auth';
import { Colors, Fonts, Layout, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';
import type { ConversationMessage } from '@/database/schema/conversations';

export default function AssistantScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = isSemcoAdminUser(user);
  const {
    messages,
    savedChats,
    conversationId,
    conversationTitle,
    isLoading,
    error,
    send,
    clearHistory,
    startNewChat,
    selectChat,
    deleteChat,
    isOnline,
  } = useAssistant();
  const [inputText, setInputText] = React.useState('');
  const [isChatSheetOpen, setChatSheetOpen] = React.useState(false);
  const listRef = useRef<FlatList<ConversationMessage>>(null);
  const providerStatus = getConfiguredProviderStatus();

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    mediumImpactHaptic();
    setInputText('');
    send(text);
  };

  const handleReplyChip = (reply: string) => {
    if (isLoading) return;
    mediumImpactHaptic();
    send(reply);
  };

  const lastMessage = messages[messages.length - 1];
  const chipSource = !isLoading && lastMessage?.role === 'assistant' ? lastMessage : null;
  const quickReplies = chipSource?.quickReplies ?? [];
  const followUps = quickReplies.length === 0 ? chipSource?.suggestedFollowUps ?? [] : [];

  const handleBack = () => {
    lightImpactHaptic();
    Keyboard.dismiss();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/library' as any);
    }
  };

  const handleStartNewChat = async () => {
    selectionHaptic();
    Keyboard.dismiss();
    await startNewChat();
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
          </View>
          <Text style={styles.chatTitle} numberOfLines={1}>
            {conversationTitle} - {isOnline ? 'Install help' : 'Local'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
          onPress={() => {
              selectionHaptic();
              Keyboard.dismiss();
              setChatSheetOpen(true);
            }}
            style={styles.iconBtn}
            accessibilityLabel="Open saved chats"
            accessibilityRole="button"
          >
            <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleStartNewChat}
            style={styles.iconBtn}
            accessibilityLabel="Start new chat"
            accessibilityRole="button"
          >
            <Ionicons name="add-circle-outline" size={22} color={Colors.semcoOrange} />
          </TouchableOpacity>
          {isAdmin ? (
            <TouchableOpacity
              onPress={() => {
                lightImpactHaptic();
                router.push('/assistant/debug' as any);
              }}
              style={styles.iconBtn}
              accessibilityLabel="Open assistant debug"
              accessibilityRole="button"
            >
              <Ionicons name="analytics-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          ) : null}
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={handleClearHistory}
              style={styles.iconBtn}
              accessibilityLabel="Clear conversation history"
            >
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.heroCard}>
            <Ionicons name="document-text-outline" size={34} color={Colors.primary} />
            <Text style={styles.emptyTitle}>Ask a Semco install question</Text>
            <Text style={styles.emptyBody}>
              Type the exact jobsite question. The assistant uses approved Semco documents first{providerStatus.configured ? ', then AI generation.' : '.'}
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          style={styles.messagePane}
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.messageList}
          ListFooterComponent={
            isLoading ? (
              <TypingIndicator />
            ) : quickReplies.length > 0 ? (
              <ReplyChips replies={quickReplies} variant="answer" onSelect={handleReplyChip} />
            ) : followUps.length > 0 ? (
              <ReplyChips replies={followUps} variant="suggestion" onSelect={handleReplyChip} />
            ) : null
          }
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity
            onPress={() => {
              lightImpactHaptic();
              Keyboard.dismiss();
            }}
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

      <SavedChatsSheet
        visible={isChatSheetOpen}
        chats={savedChats}
        activeChatId={conversationId}
        onClose={() => setChatSheetOpen(false)}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
      />
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  title: {
    color: Colors.navy,
    fontSize: Typography.size.lg,
    lineHeight: 28,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
  chatTitle: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
    lineHeight: 18,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  iconBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagePane: { flex: 1 },
  messageList: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  emptyState: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
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
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    color: Colors.danger,
    fontSize: Typography.size.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  inputBar: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
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
