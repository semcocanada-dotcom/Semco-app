import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/database/client';
import { projects } from '@/database/schema/projects';
import { desc } from 'drizzle-orm';
import type { Project } from '@/database/schema/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function ProjectsScreen() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const router = useRouter();

  const load = () => {
    db.select().from(projects).orderBy(desc(projects.updatedAt))
      .then(setProjectList).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/projects/create')}
          style={styles.addBtn}
          accessibilityLabel="Create new project"
        >
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={projectList}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => router.push({ pathname: '/(app)/projects/[id]', params: { id: item.id } })}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.textDisabled} />
            <Text style={styles.emptyText}>No projects yet. Start one to track your work.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
  },
  title: { color: Colors.textPrimary, fontSize: Typography.size.xl, fontWeight: Typography.weight.bold },
  addBtn: { padding: Spacing.xs },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  empty: { alignItems: 'center', gap: Spacing.md, marginTop: Spacing.xxxl },
  emptyText: { color: Colors.textSecondary, fontSize: Typography.size.base, textAlign: 'center' },
});
