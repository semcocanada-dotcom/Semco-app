import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MarkdownDisplay from 'react-native-markdown-display';
import { Colors, Fonts, Typography, Spacing, Radius } from '@/constants/theme';
import { lightImpactHaptic } from '@/utils/haptics';
import type { ConversationMessage } from '@/database/schema/conversations';

const COLLAPSE_THRESHOLD = 900;
const COLLAPSED_MAX_HEIGHT = 360;

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
  paragraph: {
    marginTop: 0,
    marginBottom: Spacing.sm,
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
  bullet_list: { marginLeft: 0, marginVertical: 0 },
  ordered_list: { marginLeft: 0, marginVertical: 0 },
  bullet_list_icon: { marginLeft: 0, marginRight: Spacing.xs, width: 10 },
  ordered_list_icon: { marginLeft: 0, marginRight: Spacing.xs, width: 18 },
  bullet_list_content: { flex: 1 },
  ordered_list_content: { flex: 1 },
  list_item: { marginVertical: 2 },
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
  const router = useRouter();
  const isUser = message.role === 'user';
  const citations = !isUser ? message.citations?.slice(0, 4) ?? [] : [];
  const isLongAssistantAnswer = !isUser && message.content.length > COLLAPSE_THRESHOLD;
  const [isExpanded, setExpanded] = React.useState(!isLongAssistantAnswer);

  const openCitation = (docId?: string) => {
    if (docId) {
      router.push(`/products/${docId}` as any);
      return;
    }
    router.push('/products' as any);
  };

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <Text style={[styles.text, styles.textUser]}>{message.content}</Text>
        ) : (
          <>
            <View style={styles.answerHeader}>
              <View style={styles.answerIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.answerTitle}>Semco answer</Text>
            </View>
            <View style={!isExpanded && styles.collapsedAnswer}>
              <MarkdownDisplay style={assistantMarkdownStyles}>{message.content}</MarkdownDisplay>
            </View>
            {isLongAssistantAnswer && (
              <TouchableOpacity
                onPress={() => {
                  lightImpactHaptic();
                  setExpanded((value) => !value);
                }}
                style={styles.expandBtn}
                accessibilityRole="button"
                accessibilityLabel={isExpanded ? 'Collapse answer' : 'Show full answer'}
              >
                <Text style={styles.expandText}>
                  {isExpanded ? 'Show less' : 'Show full answer'}
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            )}
            {citations.length > 0 && (
              <View style={styles.sources}>
                {citations.map((citation) => (
                  <TouchableOpacity
                    key={citation.id}
                    onPress={() => openCitation(citation.docId)}
                    activeOpacity={0.78}
                    style={styles.sourceChip}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${citation.documentName}`}
                  >
                    <Ionicons name="document-text-outline" size={14} color={Colors.primary} />
                    <Text style={styles.sourceText} numberOfLines={1}>
                      {citation.title ?? citation.documentName}
                      {citation.pageNumber ? ` p. ${citation.pageNumber}` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
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
    maxWidth: '88%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  bubbleUser: {
    backgroundColor: Colors.semcoOrange,
    borderBottomRightRadius: Radius.sm,
  },
  bubbleAssistant: {
    maxWidth: '92%',
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.navy,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  text: { fontSize: Typography.size.base, fontFamily: Fonts.regular, lineHeight: Typography.size.base * 1.5 },
  textUser: { color: Colors.white },
  textAssistant: { color: Colors.navy },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  answerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerTitle: {
    color: Colors.primary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  collapsedAnswer: {
    maxHeight: COLLAPSED_MAX_HEIGHT,
    overflow: 'hidden',
  },
  expandBtn: {
    alignSelf: 'flex-start',
    minHeight: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#C6EEF0',
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  expandText: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
  sources: {
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sourceChip: {
    minHeight: 34,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#C6EEF0',
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sourceText: {
    flex: 1,
    color: Colors.primary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.semibold,
    fontWeight: Typography.weight.semibold,
  },
});
