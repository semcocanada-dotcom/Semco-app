import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius, Spacing, Typography } from '@/constants/theme';

interface PhotoTileProps {
  title: string;
  uri?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function PhotoTile({ title, uri, onPress, style }: PhotoTileProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.78} style={[styles.tile, style]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera-outline" size={28} color={Colors.primary} />
        </View>
      )}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 112,
    gap: Spacing.sm,
  },
  image: {
    width: 112,
    height: 92,
    borderRadius: Radius.md,
    backgroundColor: Colors.softGrey,
  },
  placeholder: {
    width: 112,
    height: 92,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.xs,
  },
});
