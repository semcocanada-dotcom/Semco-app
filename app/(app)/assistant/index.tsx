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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAssistant } from '@/hooks/useAssistant';
import { ChatBubble } from '@/components/assistant/ChatBubble';
import { TypingIndicator } from '@/components/assistant/TypingIndicator';
import { OfflineBanner } from '@/components/assistant/OfflineBanner';
import { Colors, Typography, Spacing, Radius, TAP_TARGET_MIN } from '@/constants/theme';
import type { ConversationMessage } from '@/database/schema/conversations';

const PLACEHOLDER_SUGGESTIONS = [
  'What primer for heated floors?',
  'Curing time between base coats?',
  'How to fix pinholing in finish coat?',
  'Mix ratio for 5 kg of base coat?',
];

export default function AssistantScreen() {
  const { messages, isLoading, error, send, isOnline } = useAssistant();
  const [inputText, setInputText] = React.useState('');
  const listRef = useRef<FlatList<ConversationMessage>>(null);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    send(text);
  };

  const handleSuggestion = (text: string) => send(text);

  return (
    <SafeAreaView style={styles.safe}>
      {!isOnline && <OfflineBanner />}

      <View style={styles.header}>
        <Text style={styles.title}>Semco Assistant</Text>
        <Text style={styles.subtitle}>{isOnline ? 'AI-powered' : 'Product library search'}</Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.textDisabled} />
          <Text style={styles.emptyTitle}>Ask anything technical</Text>
          <Text style={styles.emptyBody}>
            Primers, coverage, curing times, troubleshooting — get instant answers from the full Semco product library.
          </Text>
          <View style={styles.suggestions}>
            {PLACEHOLDER_SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => handleSuggestion(s)}
                style={styles.suggestionChip}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
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
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask a technical question…"
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
            <Ionicons name="arrow-up" size={20} color={Colors.background} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.size.sm },
  messageList: { paddingVertical: Spacing.sm },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    textAlign: 'center',
  },
  emptyBody: {
    color: Colors.textSecondary,
    fontSize: Typography.size.base,
    textAlign: 'center',
    lineHeight: Typography.size.base * 1.5,
  },
  suggestions: { gap: Spacing.sm, width: '100%' },
  suggestionChip: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: { color: Colors.textSecondary, fontSize: Typography.size.sm },
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
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    borderRadius: TAP_TARGET_MIN / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
