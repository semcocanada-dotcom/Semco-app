import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';

export function OfflineBanner() {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={16} color={Colors.offlineAmber} />
      <Text style={styles.text}>
        Offline Mode — answers from local product library
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.offlineAmberMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 0,
  },
  text: {
    color: Colors.offlineAmber,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    flex: 1,
  },
});
