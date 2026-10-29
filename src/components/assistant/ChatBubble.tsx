import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MarkdownDisplay, { MarkdownIt } from 'react-native-markdown-display';
import { Colors, Fonts, Typography, Spacing, Radius } from '@/constants/theme';
import { lightImpactHaptic } from '@/utils/haptics';
import { TECHNICAL_DOCS, TECHNICAL_DOC_PAGES } from '@/knowledge/technical-docs';
import { getPrimaryDocGroup } from '@/knowledge/doc-catalog';
import type { AssistantCitation, ConversationMessage } from '@/database/schema/conversations';
import { GUIDE_VIDEOS, GUIDE_VIDEO_NOTICE } from '@/knowledge/guide-videos';

const COLLAPSE_THRESHOLD = 900;
const COLLAPSED_MAX_HEIGHT = 360;
const MAX_RENDERED_ANSWER_LENGTH = 16_000;
const safeMarkdownParser = MarkdownIt({
  html: false,
  linkify: false,
  typographer: false,
});

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
    marginBottom: Spacing.md,
  },
  strong: {
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
  },
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

function dedupeCitations(citations: AssistantCitation[] | undefined): AssistantCitation[] {
  if (!citations?.length) return [];
  const seen = new Set<string>();
  const unique: AssistantCitation[] = [];
  for (const citation of citations) {
    const key = `${citation.documentName}::${citation.pageNumber ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(citation);
  }
  return unique;
}

function citationLabel(citation: AssistantCitation): string {
  const name = citation.title || citation.documentName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
  return citation.pageNumber ? `${name} · p. ${citation.pageNumber}` : name;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const router = useRouter();
  const isUser = message.role === 'user';
  const displayContent = React.useMemo(
    () => (isUser ? message.content : normalizeDisplayedAnswer(message.content, Boolean(message.citations?.length))).slice(0, MAX_RENDERED_ANSWER_LENGTH),
    [isUser, message.content, message.citations],
  );
  const isLongAssistantAnswer = !isUser && displayContent.length > COLLAPSE_THRESHOLD;
  const isDealerDraft = !isUser && message.provider === 'local-instructor'
    && displayContent.startsWith('Here is a draft you can copy');
  const [isExpanded, setExpanded] = React.useState(!isLongAssistantAnswer);
  const [showReferences, setShowReferences] = React.useState(false);
  const [expandedReference, setExpandedReference] = React.useState<string | null>(null);
  const sourceChips = React.useMemo(
    () => (isUser ? [] : dedupeCitations(message.citations)),
    [isUser, message.citations],
  );
  const videoLinks = React.useMemo(() => {
    if (isUser) return [];
    const seen = new Set<string>();
    return (message.videos ?? []).flatMap((saved) => {
      // Saved chat metadata cannot inject arbitrary deep links or websites.
      const verified = GUIDE_VIDEOS.find((item) => item.id === saved.id && item.url === saved.url);
      if (!verified || seen.has(verified.id)) return [];
      seen.add(verified.id);
      return [verified];
    }).slice(0, 3);
  }, [isUser, message.videos]);

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isUser ? (
          <Text style={[styles.text, styles.textUser]}>{displayContent}</Text>
        ) : (
          <>
            <View style={styles.answerHeader}>
              <View style={styles.answerIcon}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.answerTitle}>Semco Guide</Text>
            </View>
            <View style={!isExpanded && styles.collapsedAnswer}>
              {isDealerDraft ? (
                <Text selectable style={[styles.text, styles.textAssistant]}>{displayContent}</Text>
              ) : (
                <MarkdownDisplay style={assistantMarkdownStyles} markdownit={safeMarkdownParser}>{displayContent}</MarkdownDisplay>
              )}
            </View>
            {isDealerDraft && <Text style={styles.referenceNote}>Long-press the draft to select and copy it.</Text>}
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
            {videoLinks.length > 0 && (
              <View style={styles.references}>
                <Text style={styles.referenceNote}>{GUIDE_VIDEO_NOTICE}</Text>
                {videoLinks.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.referenceCard}
                    accessibilityRole="link"
                    accessibilityLabel={`Watch ${video.title} on YouTube`}
                    onPress={async () => {
                      try { await Linking.openURL(video.url); }
                      catch { Alert.alert('Could not open video', 'Check your internet connection and try again. Your chat is saved on this device.'); }
                    }}
                  >
                    <View style={styles.referenceToggle}>
                      <Ionicons name="play-circle-outline" size={23} color={Colors.primary} />
                      <Text style={styles.referenceLink}>{video.title}</Text>
                    </View>
                    <Text style={styles.referenceNote}>{video.publisher}{video.legacy ? ' · Older demonstration' : ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {sourceChips.length > 0 && (
              <View style={styles.references}>
                <TouchableOpacity
                  onPress={() => setShowReferences((value) => !value)}
                  style={styles.referenceToggle}
                  accessibilityRole="button"
                  accessibilityLabel={showReferences ? 'Hide references' : 'Show references'}
                  accessibilityState={{ expanded: showReferences }}
                >
                  <Ionicons name="document-text-outline" size={15} color={Colors.textSecondary} />
                  <Text style={styles.sourceChipText}>References ({sourceChips.length})</Text>
                  <Ionicons name={showReferences ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textSecondary} />
                </TouchableOpacity>
                {showReferences && sourceChips.map((citation) => {
                  // Only open a page we actually have, not a guessed product route.
                  const page = TECHNICAL_DOC_PAGES.find((item) => (
                    item.sourceDocument === citation.documentName
                    && item.pageNumber === citation.pageNumber
                  ));
                  const doc = TECHNICAL_DOCS.find((item) => item.sourceDocument === citation.documentName);
                  const referenceKey = `${citation.documentName}::${citation.pageNumber ?? ''}`;
                  const expanded = expandedReference === referenceKey;
                  return (
                    <View key={referenceKey} style={styles.referenceCard}>
                      {page ? (
                        <TouchableOpacity
                          onPress={() => setExpandedReference(expanded ? null : referenceKey)}
                          style={styles.referenceToggle}
                          accessibilityRole="button"
                          accessibilityLabel={`Read saved reference ${citationLabel(citation)}`}
                          accessibilityState={{ expanded }}
                        >
                          <Text style={styles.referenceLink}>{citationLabel(citation)}</Text>
                          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.primary} />
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.sourceChipText}>{citationLabel(citation)}</Text>
                      )}
                      {expanded && page ? (
                        <>
                          <Text style={styles.referenceNote}>Saved reference text · wording from the source</Text>
                          <Text selectable style={styles.referenceText}>{page.text}</Text>
                        </>
                      ) : null}
                      {!page && <Text style={styles.referenceNote}>Reference label only; the page text is not saved here.</Text>}
                      {doc && (
                        <TouchableOpacity
                          onPress={() => {
                            lightImpactHaptic();
                            router.push({ pathname: '/products', params: { group: getPrimaryDocGroup(doc) } } as any);
                          }}
                          style={styles.referenceToggle}
                          accessibilityRole="button"
                          accessibilityLabel={`Browse Product Docs for ${citationLabel(citation)}`}
                        >
                          <Text style={styles.referenceLink}>Browse Product Docs</Text>
                          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

function normalizeDisplayedAnswer(content: string, hasStructuredCitations: boolean): string {
  const original = content.trim();
  let next = original.replace(/\r\n/g, '\n').trim();

  // Older saved chats can have a source footer without citation metadata.
  // Keep that attribution unless the References controls can replace it.
  if (hasStructuredCitations) {
    next = next
      .replace(/\n\s*Sources:\s*[\s\S]*$/i, '')
      .replace(/\n\s*Closest confirmed source:\s*[\s\S]*$/i, '')
      .replace(/\n\s*Source:\s*[^\n]+$/i, '');
  }

  next = next
    .replace(/^\s*Direct answer\s*\n+/i, '')
    .replace(/^\s*Answer:\s*/i, '')
    .replace(/\n\s*Direct answer\s*\n/gi, '\n')
    .replace(/\bJobsite path:\s*/i, "Here's the field sequence:\n")
    .split('\n')
    .map(formatStepLine)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return next || original;
}

function formatStepLine(line: string): string {
  const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
  if (numberedMatch) {
    return formatStepBody(numberedMatch[1], numberedMatch[2], numberedMatch[3]);
  }

  const markdownMatch = line.match(/^(\s*)\*\*Step\s+(\d+):?\*\*\s+(.+)$/i);
  if (markdownMatch) {
    return formatStepBody(markdownMatch[1], markdownMatch[2], markdownMatch[3]);
  }

  const plainMatch = line.match(/^(\s*)Step\s+(\d+):\s+(.+)$/i);
  if (plainMatch) {
    return formatStepBody(plainMatch[1], plainMatch[2], plainMatch[3]);
  }

  return line;
}

function formatStepBody(indent: string, stepNumber: string, text: string): string {
  const clean = text.trim();
  const titled = clean.match(/^([^:.!?]{3,64}):\s+(.+)$/);
  if (titled) {
    return `${indent}**Step ${stepNumber}: ${titled[1].trim()}**\n\n${indent}${sentenceCase(titled[2].trim())}`;
  }

  const conditional = clean.match(/^(If [^,]{8,72}),\s+(.+)$/i);
  if (conditional) {
    return `${indent}**Step ${stepNumber}: ${sentenceCase(conditional[1].trim())}**\n\n${indent}${sentenceCase(conditional[2].trim())}`;
  }

  return `${indent}**Step ${stepNumber}**\n\n${indent}${sentenceCase(clean)}`;
}

function sentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  references: {
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  referenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 44,
  },
  referenceCard: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.softGrey,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  referenceLink: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.medium,
    flexShrink: 1,
  },
  referenceNote: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.xs * 1.5,
  },
  referenceText: {
    color: Colors.navy,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
    lineHeight: Typography.size.sm * 1.5,
  },
  sourceChipText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.medium,
    flexShrink: 1,
  },
});
