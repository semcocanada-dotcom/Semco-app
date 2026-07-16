import { supabase } from '@/services/supabase';

export async function createPrivateFileUrl(bucket: string, storagePath: string, ttlSeconds = 3600) {
  const resolvedPath = extractStoragePath(bucket, storagePath);
  if (!resolvedPath) return storagePath;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(resolvedPath, ttlSeconds);
  if (error) {
    console.error(`[private-storage] ${bucket} signed URL error`, error);
    return null;
  }
  return data.signedUrl;
}

function extractStoragePath(bucket: string, value: string) {
  if (!/^https?:\/\//i.test(value)) return value;

  try {
    const url = new URL(value);
    const markers = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`,
    ];
    const marker = markers.find((candidate) => url.pathname.includes(candidate));
    if (!marker) return null;
    return decodeURIComponent(url.pathname.slice(url.pathname.indexOf(marker) + marker.length));
  } catch {
    return null;
  }
}
