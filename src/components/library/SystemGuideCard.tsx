import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import { DocumentPagePreview } from '@/components/library/DocumentPagePreview';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import type { InstallationGuide } from '@/knowledge/installation-guides';
import { getDocumentPageAsset } from '@/knowledge/document-page-assets';

type SystemGuideCardProps = {
  guide: InstallationGuide;
  compact?: boolean;
  onPress?: () => void;
  onAsk?: () => void;
  style?: ViewStyle;
};

export function SystemGuideCard({ guide, compact = false, onPress, onAsk, style }: SystemGuideCardProps) {
  const hasDocumentPreview = Boolean(getDocumentPageAsset(guide.sourceDocument));
  const body = (
    <>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons name="layers-outline" size={20} color={Colors.darkTeal} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{guide.title}</Text>
          <Text style={styles.subtitle}>{guide.subtitle}</Text>
        </View>
        <Badge label={guide.category} variant="accent" />
      </View>

      {hasDocumentPreview ? (
        <DocumentPagePreview sourceDocument={guide.sourceDocument} compact={compact} />
      ) : (
        <LayerDiagram guide={guide} compact={compact} />
      )}

      {!compact ? (
        <>
          <Text style={styles.summary}>{guide.summary}</Text>
          <View style={styles.stepList}>
            {guide.steps.map((step, index) => (
              <View key={`${guide.id}-step-${index}`} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
          <View style={styles.materialRow}>
            {guide.materials.map((material) => (
              <View key={`${guide.id}-${material}`} style={styles.materialChip}>
                <Text style={styles.materialText}>{material}</Text>
              </View>
            ))}
          </View>
          <View style={styles.sourceRow}>
            <Text style={styles.sourceText}>{guide.sourceDocument}</Text>
            {guide.sourcePage ? <Text style={styles.sourcePage}>{guide.sourcePage}</Text> : null}
          </View>
          {onAsk ? (
            <TouchableOpacity onPress={onAsk} style={styles.askButton} accessibilityRole="button">
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.white} />
              <Text style={styles.askText}>Ask Semco about this</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={[styles.card, compact && styles.compactCard, style]}>
        {body}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, compact && styles.compactCard, style]}>{body}</View>;
}

function LayerDiagram({ guide, compact }: { guide: InstallationGuide; compact: boolean }) {
  const layers = [...guide.layers].reverse();

  return (
    <View style={[styles.diagram, compact && styles.diagramCompact]}>
      <View style={styles.diagramLabels}>
        <Text style={styles.diagramLabel}>Top</Text>
        <Text style={styles.diagramLabel}>Substrate</Text>
      </View>
      <View style={styles.layerStack}>
        {layers.map((layer) => (
          <View key={`${guide.id}-${layer.label}`} style={[styles.layerBand, { backgroundColor: layer.color }]}>
            <Text style={[styles.layerLabel, { color: layer.textColor ?? Colors.navy }]} numberOfLines={1}>
              {layer.label}
            </Text>
            {!compact ? (
              <Text style={[styles.layerDetail, { color: layer.textColor ?? Colors.navy }]} numberOfLines={1}>
                {layer.detail}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  compactCard: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#C6EEF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.base,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
  },
  diagram: {
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 164,
  },
  diagramCompact: {
    minHeight: 118,
  },
  diagramLabels: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  diagramLabel: {
    color: Colors.textDisabled,
    fontFamily: Fonts.semibold,
    fontSize: 9,
    textTransform: 'uppercase',
    transform: [{ rotate: '-90deg' }],
    width: 56,
    textAlign: 'center',
  },
  layerStack: {
    flex: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  layerBand: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,35,45,0.16)',
  },
  layerLabel: {
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xs,
  },
  layerDetail: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    opacity: 0.82,
  },
  summary: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.45,
  },
  stepList: {
    gap: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.semcoOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.xs,
  },
  stepText: {
    flex: 1,
    color: Colors.navy,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.4,
  },
  materialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  materialChip: {
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  materialText: {
    color: Colors.darkTeal,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
  },
  sourceRow: {
    gap: 2,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  sourceText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
  },
  sourcePage: {
    color: Colors.textDisabled,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
  },
  askButton: {
    minHeight: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.semcoOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  askText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.sm,
  },
});
