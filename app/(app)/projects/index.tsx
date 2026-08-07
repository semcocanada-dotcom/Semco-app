import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '@/database/client';
import { projects } from '@/database/schema/projects';
import { desc, eq } from 'drizzle-orm';
import type { Project } from '@/database/schema/projects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { AppHeader, Button, EmptyState, SearchBar, TabControl } from '@/components/ui';
import { Colors, Layout, Spacing } from '@/constants/theme';
import { fetchInstallerProjectsFromCloud } from '@/services/cloud-sync';
import { useAuthStore } from '@/store/auth';

type ProjectFilter = 'all' | 'active' | 'on_hold' | 'complete';

const FILTER_OPTIONS: { value: ProjectFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'In Progress' },
  { value: 'on_hold', label: 'Planning' },
  { value: 'complete', label: 'Completed' },
];

export default function ProjectsScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const load = useCallback(async () => {
    if (!user?.id) {
      setProjectList([]);
      return;
    }
    const localRows = await db
      .select()
      .from(projects)
      .where(eq(projects.installerId, user.id))
      .orderBy(desc(projects.updatedAt));

    try {
      const cloudRows = await fetchInstallerProjectsFromCloud(user.id);
      const merged = new Map(localRows.map((project) => [project.id, project]));
      for (const project of cloudRows) {
        const local = merged.get(project.id);
        if (!local || Date.parse(project.updatedAt) >= Date.parse(local.updatedAt)) {
          merged.set(project.id, project);
        }
      }
      setProjectList([...merged.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)));
    } catch (error) {
      console.error('[projects] cloud refresh failed; showing offline records', error);
      setProjectList(localRows);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  useEffect(() => {
    const requestedFilter = Array.isArray(params.filter) ? params.filter[0] : params.filter;
    if (requestedFilter && isProjectFilter(requestedFilter)) {
      setFilter(requestedFilter);
    }
  }, [params.filter]);

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
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search projects" />
        <TabControl value={filter} options={FILTER_OPTIONS} onChange={setFilter} />
        <Button label="Add Project" variant="primary" onPress={() => router.push('/projects/create' as any)} fullWidth />
      </View>

      <FlatList
        data={filteredProjects}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            onPress={() => router.push({ pathname: '/projects/[id]', params: { id: item.id } } as any)}
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

function isProjectFilter(value: string): value is ProjectFilter {
  return FILTER_OPTIONS.some((option) => option.value === value);
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
