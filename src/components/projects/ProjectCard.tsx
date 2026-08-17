import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/components/ui/Badge';
import type { Project } from '@/database/schema/projects';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Active', variant: 'success' },
  on_hold: { label: 'On Hold', variant: 'warning' },
  complete: { label: 'Complete', variant: 'neutral' },
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
      activeOpacity={0.75}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Project: ${project.clientName ?? 'Unnamed'}`}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.clientName} numberOfLines={1}>
            {project.clientName ?? 'Unnamed Project'}
          </Text>
          {project.siteAddress ? (
            <Text style={styles.address} numberOfLines={1}>{project.siteAddress}</Text>
          ) : null}
        </View>
        <Badge label={statusInfo.label} variant={statusInfo.variant} />
      </View>

      <View style={styles.meta}>
        {project.totalAreaSqm ? (
          <View style={styles.metaItem}>
            <Ionicons name="expand-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{project.totalAreaSqm} m²</Text>
          </View>
        ) : null}
        {project.substrateType ? (
          <View style={styles.metaItem}>
            <Ionicons name="layers-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{project.substrateType.replace(/_/g, ' ')}</Text>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{new Date(project.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.textDisabled}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  headerLeft: { flex: 1, marginRight: Spacing.sm },
  clientName: { color: Colors.textPrimary, fontSize: Typography.size.md, fontWeight: Typography.weight.semibold },
  address: { color: Colors.textSecondary, fontSize: Typography.size.sm, marginTop: 2 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: Colors.textSecondary, fontSize: Typography.size.sm },
  chevron: { position: 'absolute', right: Spacing.base, top: '50%' },
});
