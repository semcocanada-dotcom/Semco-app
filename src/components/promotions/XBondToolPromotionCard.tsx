import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import {
  XBOND_TOOL_PROMOTION,
  XBOND_TOOL_PROMOTION_MINIMUM_SQFT,
} from '@/knowledge/pro-installer-promotion';

interface XBondToolPromotionCardProps {
  variant: 'overview' | 'eligible';
  areaSqft?: number;
  onOpenCalculator?: () => void;
}

export function XBondToolPromotionCard({
  variant,
  areaSqft,
  onOpenCalculator,
}: XBondToolPromotionCardProps) {
  const isEligible = variant === 'eligible';
  const formattedArea = areaSqft?.toLocaleString('en-CA', {
    minimumFractionDigits: Number.isInteger(areaSqft) ? 0 : 1,
    maximumFractionDigits: 1,
  });

  return (
    <Card elevated style={[styles.card, isEligible && styles.eligibleCard]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, isEligible && styles.eligibleIconWrap]}>
          <Ionicons name={isEligible ? 'checkmark-circle' : 'gift-outline'} size={24} color={Colors.white} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>{XBOND_TOOL_PROMOTION.eyebrow}</Text>
          {isEligible ? <Text style={styles.reviewStatus}>ELIGIBLE FOR REVIEW</Text> : null}
        </View>
      </View>

      <Text style={styles.title}>{XBOND_TOOL_PROMOTION.title}</Text>
      <Text style={styles.value}>{XBOND_TOOL_PROMOTION.value}</Text>
      <Text style={styles.body}>
        {isEligible && formattedArea
          ? `Your ${formattedArea} sq. ft. calculator result meets the ${XBOND_TOOL_PROMOTION_MINIMUM_SQFT.toLocaleString('en-CA')} sq. ft. area threshold. Submit the complete system material request for dealer review.`
          : XBOND_TOOL_PROMOTION.qualifyingTerm}
      </Text>

      <View style={styles.termsBox}>
        {isEligible ? <Text style={styles.qualifyingTerm}>{XBOND_TOOL_PROMOTION.qualifyingTerm}</Text> : null}
        <Text style={styles.terms}>{XBOND_TOOL_PROMOTION.terms.join(' ')}</Text>
        {isEligible ? (
          <Text style={styles.reviewNote}>
            Area eligibility starts the review; the kit is not guaranteed until the order is approved.
          </Text>
        ) : null}
      </View>

      {onOpenCalculator ? (
        <Button
          label="Check My Project in Calculator"
          onPress={onOpenCalculator}
          fullWidth
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
    borderColor: Colors.semcoOrange,
    backgroundColor: '#FFF9F1',
  },
  eligibleCard: {
    borderColor: Colors.success,
    backgroundColor: Colors.successMuted,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.semcoOrange,
  },
  eligibleIconWrap: {
    backgroundColor: Colors.success,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: Colors.semcoOrange,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1.1,
  },
  reviewStatus: {
    color: Colors.success,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.7,
  },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    lineHeight: Typography.size.xl * 1.12,
  },
  value: {
    color: Colors.semcoOrange,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  body: {
    color: Colors.textPrimary,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  termsBox: {
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  qualifyingTerm: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.4,
  },
  terms: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.45,
  },
  reviewNote: {
    color: Colors.success,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    lineHeight: Typography.size.xs * 1.4,
  },
});
