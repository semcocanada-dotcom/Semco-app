import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '@/database/client';
import { projects } from '@/database/schema/projects';
import { desc } from 'drizzle-orm';
import type { Project } from '@/database/schema/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { AppHeader, Button, EmptyState, SearchBar, TabControl } from '@/components/ui';
import { Colors, Layout, Spacing } from '@/constants/theme';

type ProjectFilter = 'all' | 'active' | 'on_hold' | 'complete';

const FILTER_OPTIONS: { value: ProjectFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'In Progress' },
  { value: 'on_hold', label: 'Planning' },
  { value: 'complete', label: 'Completed' },
];

export default function ProjectsScreen() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const router = useRouter();

  const load = () => {
    db.select().from(projects).orderBy(desc(projects.updatedAt))
      .then(setProjectList).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const filteredProjects = projectList.filter((project) => {
    const matchesStatus = filter === 'all' || project.status === filter;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q ||
      (project.clientName ?? '').toLowerCase().includes(q) ||
      (project.siteAddress ?? '').toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppHeader title="Projects" subtitle="Live jobs, photos, batches, and specs." rightIcon="folder-open-outline" />
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search projects" showMic={false} />
        <TabControl value={filter} options={FILTER_OPTIONS} onChange={setFilter} />
        <Button label="Add Project" variant="primary" onPress={() => router.push('/(app)/projects/create')} fullWidth />
      </View>

      <FlatList
        data={filteredProjects}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => router.push({ pathname: '/(app)/projects/[id]', params: { id: item.id } })}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title={projectList.length === 0 ? 'No projects yet' : 'No matching projects'}
            body={projectList.length === 0 ? 'Start one to track your work, photos, and batch history.' : 'Try a different search or status filter.'}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.appBackground },
  header: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  list: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl + 44,
  },
});
