import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

interface ReplyChipsProps {
  replies: string[];
  /** answer = tap choices for a clarifying question; suggestion = optional next questions. */
  variant: 'answer' | 'suggestion';
  onSelect: (reply: string) => void;
  disabled?: boolean;
}

export function ReplyChips({ replies, variant, onSelect, disabled = false }: ReplyChipsProps) {
  if (replies.length === 0) return null;
  const isAnswer = variant === 'answer';

  return (
    <View style={styles.wrapper}>
      {!isAnswer ? <Text style={styles.label}>Ask next</Text> : null}
      <View style={styles.row}>
        {replies.map((reply) => (
          <TouchableOpacity
            key={reply}
            onPress={() => onSelect(reply)}
            disabled={disabled}
            activeOpacity={0.75}
            style={[styles.chip, isAnswer ? styles.chipAnswer : styles.chipSuggestion, disabled && styles.chipDisabled]}
            accessibilityRole="button"
            accessibilityLabel={isAnswer ? `Answer: ${reply}` : `Ask: ${reply}`}
          >
            {isAnswer ? (
              <Ionicons name="checkmark-circle-outline" size={15} color={Colors.primary} />
            ) : (
              <Ionicons name="arrow-forward-circle-outline" size={15} color={Colors.textSecondary} />
            )}
            <Text style={[styles.chipText, isAnswer ? styles.chipTextAnswer : styles.chipTextSuggestion]}>
              {reply}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  label: {
    color: Colors.textDisabled,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  chipAnswer: {
    backgroundColor: Colors.primaryMuted,
    borderColor: '#C6EEF0',
  },
  chipSuggestion: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  chipDisabled: { opacity: 0.5 },
  chipText: {
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.sm,
    flexShrink: 1,
  },
  chipTextAnswer: { color: Colors.primary },
  chipTextSuggestion: { color: Colors.textSecondary },
});
