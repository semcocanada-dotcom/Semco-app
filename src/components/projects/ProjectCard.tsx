import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import type { Project } from '@/database/schema/projects';
import { Colors, Fonts, Typography, Spacing, Radius } from '@/constants/theme';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'In Progress', variant: 'success' },
  on_hold: { label: 'Planning', variant: 'warning' },
  complete: { label: 'Completed', variant: 'neutral' },
};

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const statusInfo = STATUS_MAP[project.status] ?? STATUS_MAP.active;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Project: ${project.clientName ?? 'Unnamed'}`}
    >
      <View style={styles.thumb}>
        <Ionicons name="business-outline" size={22} color={Colors.white} />
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.clientName} numberOfLines={1}>
            {project.clientName ?? 'Unnamed Project'}
          </Text>
          <Badge label={statusInfo.label} variant={statusInfo.variant} />
        </View>

        <Text style={styles.address} numberOfLines={1}>
          {project.siteAddress ?? 'No address yet'}
        </Text>

        <View style={styles.meta}>
          {project.totalAreaSqm ? (
            <View style={styles.metaItem}>
              <Ionicons name="expand-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{project.totalAreaSqm} m2</Text>
            </View>
          ) : null}
          {project.substrateType ? (
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{project.substrateType.replace(/_/g, ' ')}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={Colors.textDisabled} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  clientName: {
    color: Colors.navy,
    fontSize: Typography.size.base,
    fontFamily: Fonts.bold,
    fontWeight: Typography.weight.bold,
    flex: 1,
  },
  address: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontFamily: Fonts.regular,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontFamily: Fonts.medium,
  },
});
