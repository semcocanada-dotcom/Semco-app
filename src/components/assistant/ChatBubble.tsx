import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MarkdownDisplay from 'react-native-markdown-display';
import { Colors, Fonts, Typography, Spacing, Radius } from '@/constants/theme';
import type { ConversationMessage } from '@/database/schema/conversations';

const assistantMarkdownStyles = {
  body: {
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
    color: Colors.navy,
    fontFamily: Fonts.regular,
  },
  text: {
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
    color: Colors.navy,
    fontFamily: Fonts.regular,
  },
  strong: { fontWeight: Typography.weight.bold },
  em: { fontStyle: 'italic' as const },
  link: { color: Colors.primary },
  code_inline: {
    backgroundColor: Colors.primaryMuted,
    color: Colors.primary,
    paddingHorizontal: 4,
    borderRadius: 2,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginVertical: Spacing.xs,
  },
  hr: { backgroundColor: Colors.border, height: 1 },
  bullet_list: { marginLeft: Spacing.md },
  ordered_list: { marginLeft: Spacing.md },
  list_item: { marginVertical: Spacing.xs },
  blockquote: {
    borderLeftColor: Colors.primary,
    borderLeftWidth: 3,
    paddingLeft: Spacing.sm,
    opacity: 0.8,
  },
} as const;

interface ChatBubbleProps {
  message: ConversationMessage;
}

const SOURCE_LABELS: Record<string, string> = {
  claude: 'Claude',
  offline_fts: 'SIP manual',
  product_library: 'SIP manual',
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const sourceLabel = SOURCE_LABELS[message.source];
  const showSource = !isUser && sourceLabel;

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <Text style={[styles.text, styles.textUser]}>{message.content}</Text>
        ) : (
          <MarkdownDisplay style={assistantMarkdownStyles}>{message.content}</MarkdownDisplay>
        )}
        {showSource ? (
          <View style={styles.sourceRow}>
            <Text style={styles.sourceTag}>{sourceLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: Spacing.xs, paddingHorizontal: Spacing.base },
  wrapperUser: { alignItems: 'flex-end' },
  wrapperAssistant: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '85%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  bubbleUser: {
    backgroundColor: Colors.semcoOrange,
    borderBottomRightRadius: Radius.sm,
  },
  bubbleAssistant: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: { fontSize: Typography.size.base, fontFamily: Fonts.regular, lineHeight: Typography.size.base * 1.5 },
  textUser: { color: Colors.white },
  textAssistant: { color: Colors.navy },
  sourceRow: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sourceTag: {
    color: Colors.offlineAmber,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.medium,
    fontWeight: Typography.weight.medium,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
