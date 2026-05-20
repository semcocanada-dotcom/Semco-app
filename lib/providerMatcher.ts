import { supabase } from '@lib/supabase';
import { normalize, similarity } from '@lib/textMatch';
import type { Provider } from '@lib/types';

export interface ProviderMatch {
  provider:   Provider;
  score:      number;  // 0–1
}

/**
 * Fuzzy-matches one or more candidate strings against the providers table.
 * When given an array (e.g. all lines from a receipt), makes a single DB call
 * and returns the best score per provider across all candidates.
 * Returns up to 3 ranked matches (score descending).
 */
export async function matchProviders(input: string | string[]): Promise<ProviderMatch[]> {
  const candidates = (Array.isArray(input) ? input : [input])
    .map(s => s?.trim())
    .filter(Boolean);
  if (!candidates.length) return [];

  // Collect unique words across all candidates for the OR filter
  const wordSet = new Set<string>();
  for (const c of candidates) {
    for (const w of normalize(c).split(/\s+/).filter(w => w.length > 2)) {
      wordSet.add(w);
    }
  }
  if (!wordSet.size) return [];

  // Cap OR filter to 15 words to avoid overwhelming PostgREST
  const filterWords = [...wordSet].slice(0, 15);

  const { data } = await supabase
    .from('providers')
    .select('*')
    .or(filterWords.map(w => `name.ilike.%${w}%`).join(','))
    .limit(30);

  if (!data?.length) return [];

  // Score each provider against its best-matching candidate
  const scored: ProviderMatch[] = (data as Provider[]).map(p => {
    const pNorm = normalize(p.name);
    const best  = Math.max(...candidates.map(c => similarity(normalize(c), pNorm)));
    return { provider: p, score: best };
  });

  return scored
    .filter(m => m.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
