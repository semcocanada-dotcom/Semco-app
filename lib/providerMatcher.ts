import { supabase } from '@lib/supabase';
import { normalize, similarity } from '@lib/textMatch';
import type { Provider } from '@lib/types';

export interface ProviderMatch {
  provider:   Provider;
  score:      number;  // 0–1
}

/**
 * Fuzzy-matches a business name string against the providers table.
 * Returns up to 3 ranked matches (score descending).
 */
export async function matchProviders(rawName: string): Promise<ProviderMatch[]> {
  if (!rawName?.trim()) return [];

  const normalized = normalize(rawName);
  const words      = normalized.split(/\s+/).filter(w => w.length > 2);
  if (!words.length) return [];

  // Build OR query: any word appears in the provider name
  const { data } = await supabase
    .from('providers')
    .select('*')
    .or(words.map(w => `name.ilike.%${w}%`).join(','))
    .limit(20);

  if (!data?.length) return [];

  const scored: ProviderMatch[] = (data as Provider[]).map(p => ({
    provider: p,
    score:    similarity(normalized, normalize(p.name)),
  }));

  return scored
    .filter(m => m.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
