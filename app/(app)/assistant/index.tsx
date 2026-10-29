import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAssistant } from '@/hooks/useAssistant';
import { ChatBubble } from '@/components/assistant/ChatBubble';
import { TypingIndicator } from '@/components/assistant/TypingIndicator';
import { SavedChatsSheet } from '@/components/assistant/SavedChatsSheet';
import { ReplyChips } from '@/components/assistant/ReplyChips';
import { lightImpactHaptic, mediumImpactHaptic, selectionHaptic } from '@/utils/haptics';
import { Colors, Fonts, Layout, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';
import type { ConversationMessage } from '@/database/schema/conversations';

const STARTER_QUESTIONS = [
  'What is the difference between X-Bond and MicroBond?',
  'The coating is peeling. What should I check?',
  'My sealer looks cloudy. Can you help?',
  'How do I prepare the surface before I start?',
];

export default function AssistantScreen() {
  const router = useRouter();
  const {
    messages,
    savedChats,
    conversationId,
    conversationTitle,
    isLoading,
    isBusy,
    error,
    send,
    clearHistory,
    startNewChat,
    selectChat,
    deleteChat,
    notSaved,
  } = useAssistant();
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  // Android app.json uses softwareKeyboardLayoutMode "resize", so the window
  // already shrinks and KeyboardAvoidingView must not add a second offset.
  const keyboardVerticalOffset = headerHeight + insets.top;
  const [inputText, setInputText] = React.useState('');
  const [isChatSheetOpen, setChatSheetOpen] = React.useState(false);
  const [showLatestButton, setShowLatestButton] = React.useState(false);
  const listRef = useRef<FlatList<ConversationMessage>>(null);
  const followLatestRef = useRef(true);
  const lastContentMessageRef = useRef<string | null>(null);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  React.useLayoutEffect(() => {
    followLatestRef.current = true;
    lastContentMessageRef.current = null;
    setShowLatestButton(false);
  }, [conversationId]);

  const submitMessage = useCallback(async (value: string, clearInput: boolean) => {
    const text = value.trim();
    if (!text || isLoading || isBusy) return;

    mediumImpactHaptic();
    followLatestRef.current = true;
    setShowLatestButton(false);
    if (clearInput) setInputText('');
    await send(text);
  }, [isBusy, isLoading, send]);

  const handleSend = () => {
    void submitMessage(inputText, true);
  };

  const handleReplyChip = (reply: string) => {
    void submitMessage(reply, false);
  };

  const lastMessage = messages[messages.length - 1];
  const chipSource = !isLoading && lastMessage?.role === 'assistant' ? lastMessage : null;
  const quickReplies = chipSource?.quickReplies ?? [];
  const followUps = quickReplies.length === 0 ? chipSource?.suggestedFollowUps ?? [] : [];

  const handleContentSizeChange = () => {
    const messageId = lastMessage?.id ?? null;
    if (messageId === lastContentMessageRef.current) return;
    const firstLayout = lastContentMessageRef.current === null;
    lastContentMessageRef.current = messageId;
    // Expanding an old answer/reference must never move the installer's place.
    if (followLatestRef.current) {
      listRef.current?.scrollToEnd({ animated: !firstLayout });
    } else {
      setShowLatestButton(true);
    }
  };

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

  const inputBottomPad = Spacing.md + (keyboardOpen ? 0 : insets.bottom);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View
        style={styles.header}
        testID="assistant-header"
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height;
          setHeaderHeight((current) => (current === nextHeight ? current : nextHeight));
        }}
      >
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
            <Text style={styles.title}>Semco Guide</Text>
          </View>
          <Text style={styles.chatTitle} numberOfLines={1}>
            {conversationTitle} · offline guide
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
          onPress={() => {
              selectionHaptic();
              Keyboard.dismiss();
              setChatSheetOpen(true);
            }}
            style={[styles.iconBtn, isBusy && styles.controlDisabled]}
            disabled={isBusy}
            accessibilityLabel="Open saved chats"
            accessibilityRole="button"
          >
            <Ionicons name="chatbubbles-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleStartNewChat}
            style={[styles.iconBtn, isBusy && styles.controlDisabled]}
            disabled={isBusy}
            accessibilityLabel="Start new chat"
            accessibilityRole="button"
          >
            <Ionicons name="add-circle-outline" size={22} color={Colors.semcoOrange} />
          </TouchableOpacity>
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={handleClearHistory}
              style={[styles.iconBtn, isBusy && styles.controlDisabled]}
              disabled={isBusy}
              accessibilityLabel="Clear conversation history"
            >
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.conversation}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
      {messages.length === 0 ? (
        <ScrollView style={styles.messagePane} contentContainerStyle={styles.emptyState} keyboardShouldPersistTaps="handled">
          <View style={styles.heroCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={34} color={Colors.primary} />
            <Text style={styles.emptyTitle}>Let's work through your job</Text>
            <Text style={styles.emptyBody}>
              Tell me what you're working on and what isn't going as expected. I'll help you check the next step using the Semco guidance saved in this app.
            </Text>
            <Text style={styles.guideNote}>
              Free, offline guidance. Chats stay on this device. I can't inspect your job or confirm a diagnosis; uncertain repairs need Semco technical support.
            </Text>
          </View>
          <View style={styles.starters}>
            <Text style={styles.starterTitle}>Not sure where to start?</Text>
            {STARTER_QUESTIONS.map((question) => (
              <TouchableOpacity
                key={question}
                style={styles.starterButton}
                onPress={() => handleReplyChip(question)}
                disabled={isLoading || isBusy}
                accessibilityRole="button"
                accessibilityLabel={`Ask: ${question}`}
              >
                <Text style={styles.starterText}>{question}</Text>
                <Ionicons name="arrow-forward" size={17} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          key={conversationId ?? 'unsaved-chat'}
          style={styles.messagePane}
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          onContentSizeChange={handleContentSizeChange}
          onScroll={({ nativeEvent }) => {
            const distanceFromEnd = nativeEvent.contentSize.height
              - nativeEvent.layoutMeasurement.height - nativeEvent.contentOffset.y;
            const nearEnd = distanceFromEnd <= 100;
            followLatestRef.current = nearEnd;
            setShowLatestButton(!nearEnd);
          }}
          scrollEventThrottle={100}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.messageList}
          ListFooterComponent={
            isLoading ? (
              <TypingIndicator />
            ) : quickReplies.length > 0 ? (
              <ReplyChips replies={quickReplies} variant="answer" onSelect={handleReplyChip} disabled={isBusy} />
            ) : followUps.length > 0 ? (
              <ReplyChips replies={followUps} variant="suggestion" onSelect={handleReplyChip} disabled={isBusy} />
            ) : null
          }
        />
      )}

      {messages.length > 0 && showLatestButton && (
        <TouchableOpacity
          style={styles.latestButton}
          onPress={() => {
            followLatestRef.current = true;
            setShowLatestButton(false);
            listRef.current?.scrollToEnd({ animated: true });
          }}
          accessibilityRole="button"
          accessibilityLabel="Jump to latest message"
        >
          <Text style={styles.starterText}>Latest message</Text>
          <Ionicons name="arrow-down" size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {notSaved ? (
        <Text style={styles.notSaved} accessibilityLiveRegion="polite">
          Not saved on this device
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={[styles.inputBar, { paddingBottom: inputBottomPad }]}>
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
            placeholder="Tell me what's happening..."
            accessibilityLabel="Message to Semco Guide"
            placeholderTextColor={Colors.textDisabled}
            selectionColor={Colors.primary}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendBtn, (!inputText.trim() || isLoading || isBusy) && styles.sendBtnDisabled]}
            disabled={!inputText.trim() || isLoading || isBusy}
            accessibilityLabel="Send message"
          >
            <Ionicons name="arrow-up" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <SavedChatsSheet
        visible={isChatSheetOpen && !isBusy}
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
  conversation: { flex: 1 },
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
    flexGrow: 1,
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
  guideNote: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.sm * 1.5,
  },
  starters: { gap: Spacing.sm },
  starterTitle: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
  },
  starterButton: {
    minHeight: TAP_TARGET_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  starterText: {
    flexShrink: 1,
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
  },
  latestButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: TAP_TARGET_MIN,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
  },
  notSaved: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    color: Colors.offlineAmber,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.medium,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
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
  controlDisabled: { opacity: 0.4 },
});
