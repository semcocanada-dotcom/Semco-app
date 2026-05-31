import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MarkdownDisplay from 'react-native-markdown-display';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { ConversationMessage } from '@/database/schema/conversations';

const assistantMarkdownStyles = {
  body: {
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
    color: Colors.textPrimary,
  },
  text: {
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
    color: Colors.textPrimary,
  },
  strong: { fontWeight: Typography.weight.bold },
  em: { fontStyle: 'italic' as const },
  link: { color: Colors.primary },
  code_inline: {
    backgroundColor: Colors.surface,
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

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isManual = message.source === 'sip_manual';
  const isOffline = message.source === 'offline_fts' || message.source === 'product_library';

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <Text style={[styles.text, styles.textUser]}>
            {message.content}
          </Text>
        ) : (
          <MarkdownDisplay style={assistantMarkdownStyles}>
            {message.content}
          </MarkdownDisplay>
        )}
        {!isUser && isManual && (
          <Text style={styles.sourceTag}>From SIP manual</Text>
        )}
        {!isUser && isOffline && (
          <Text style={styles.sourceTag}>From product library</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: Spacing.xs, paddingHorizontal: Spacing.base },
  wrapperUser: { alignItems: 'flex-end' },
  wrapperAssistant: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: Radius.lg,
    padding: Spacing.sm,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Radius.sm,
  },
  bubbleAssistant: {
    backgroundColor: Colors.surfaceElevated,
    borderBottomLeftRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: { fontSize: Typography.size.base, lineHeight: Typography.size.base * 1.5 },
  textUser: { color: Colors.background },
  textAssistant: { color: Colors.textPrimary },
  sourceTag: {
    marginTop: Spacing.xs,
    color: Colors.offlineAmber,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
});
