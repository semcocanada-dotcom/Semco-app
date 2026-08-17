import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { ConversationMessage } from '@/database/schema/conversations';

interface ChatBubbleProps {
  message: ConversationMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isOffline = message.source === 'offline_fts' || message.source === 'product_library';

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {message.content}
        </Text>
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
    maxWidth: '85%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
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
