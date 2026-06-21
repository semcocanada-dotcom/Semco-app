import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';
import { getDocumentPageAsset } from '@/knowledge/document-page-assets';

type DocumentPagePreviewProps = {
  sourceDocument: string;
  pageNumber?: number;
  compact?: boolean;
  label?: string;
  style?: ViewStyle;
};

export function DocumentPagePreview({
  sourceDocument,
  pageNumber = 1,
  compact = false,
  label,
  style,
}: DocumentPagePreviewProps) {
  const asset = getDocumentPageAsset(sourceDocument, pageNumber);

  if (!asset) {
    return (
      <View style={[styles.empty, compact && styles.emptyCompact, style]}>
        <Ionicons name="document-text-outline" size={22} color={Colors.textDisabled} />
        <Text style={styles.emptyText}>Preview not bundled</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Image
        source={asset.image}
        resizeMode="contain"
        style={[styles.image, compact ? styles.imageCompact : styles.imageFull]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  wrapCompact: {
    borderRadius: Radius.md,
  },
  label: {
    color: Colors.textSecondary,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    textTransform: 'uppercase',
  },
  image: {
    width: '100%',
    backgroundColor: Colors.white,
  },
  imageFull: {
    height: 360,
  },
  imageCompact: {
    height: 180,
  },
  empty: {
    minHeight: 140,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  emptyCompact: {
    minHeight: 110,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: Typography.size.xs,
  },
});
