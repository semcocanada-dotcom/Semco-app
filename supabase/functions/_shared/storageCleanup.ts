export interface StorageListItem {
  id: string | null;
  name: string;
}
interface StorageError {
  message?: string;
}

export interface StorageBucketApi {
  list: (
    path: string,
    options: {
      limit: number;
      offset: number;
      sortBy: { column: 'name'; order: 'asc' };
    },
  ) => Promise<{ data: StorageListItem[] | null; error: StorageError | null }>;
  remove: (
    paths: string[],
  ) => Promise<{ data: unknown; error: StorageError | null }>;
}

const LIST_PAGE_SIZE = 1000;
const REMOVE_BATCH_SIZE = 1000;

function childPath(parent: string, name: string): string {
  if (!name || name === '.' || name === '..' || name.includes('/')) {
    throw new Error('Storage returned an invalid object name');
  }
  return `${parent}/${name}`;
}

async function listFolder(
  bucket: StorageBucketApi,
  path: string,
): Promise<StorageListItem[]> {
  const entries: StorageListItem[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await bucket.list(path, {
      limit: LIST_PAGE_SIZE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(error.message || 'Could not list receipt files');

    const page = data ?? [];
    entries.push(...page);
    if (page.length < LIST_PAGE_SIZE) break;
    offset += page.length;
  }

  return entries;
}

/**
 * Removes every Storage object below a user's private receipt prefix.
 * Supabase represents folders with a null id, so the traversal does not rely
 * on the application's current path depth and also cleans legacy layouts.
 */
export async function removeStoragePrefixRecursively(
  bucket: StorageBucketApi,
  userId: string,
): Promise<number> {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) {
    throw new Error('Invalid user id');
  }

  const folders = [userId];
  const visited = new Set<string>();
  const files: string[] = [];

  while (folders.length > 0) {
    const folder = folders.pop()!;
    if (visited.has(folder)) continue;
    visited.add(folder);

    const entries = await listFolder(bucket, folder);
    for (const entry of entries) {
      const path = childPath(folder, entry.name);
      if (!path.startsWith(`${userId}/`)) {
        throw new Error('Storage traversal escaped the user prefix');
      }
      if (entry.id === null) folders.push(path);
      else files.push(path);
    }
  }

  for (let i = 0; i < files.length; i += REMOVE_BATCH_SIZE) {
    const batch = files.slice(i, i + REMOVE_BATCH_SIZE);
    const { error } = await bucket.remove(batch);
    if (error) throw new Error(error.message || 'Could not remove receipt files');
  }

  return files.length;
}
