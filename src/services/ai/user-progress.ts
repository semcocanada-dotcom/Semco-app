import { supabase } from '@/services/supabase';

export interface UserProgressEntry {
  topic: string;
  times_asked: number;
  confidence_score: number;
  is_weak_area: boolean;
  last_asked_at: string;
}

// Keyword map: installer message keywords → topic slug
const TOPIC_KEYWORDS: { topic: string; keywords: string[] }[] = [
  { topic: 'primer_application', keywords: ['primer', 'prime', 'priming', '2k', 'adhesion primer'] },
  { topic: 'base_coat', keywords: ['base coat', 'basecoat', 'first coat', 'second coat'] },
  { topic: 'finish_coat', keywords: ['finish coat', 'finishcoat', 'top coat', 'topcoat', 'texture'] },
  { topic: 'sealer', keywords: ['sealer', 'seal', 'sealing', 'matte', 'satin', 'gloss', 'xprotect'] },
  { topic: 'color_mixing', keywords: ['color', 'colour', 'pigment', 'tint', 'xbond', 'mix', 'ratio', 'ml', 'formula'] },
  { topic: 'substrate_prep', keywords: ['substrate', 'surface', 'concrete', 'plywood', 'tile', 'prep', 'prepare', 'clean', 'sand'] },
  { topic: 'pot_life', keywords: ['pot life', 'working time', 'how long', 'open time', 'gel'] },
  { topic: 'cure_time', keywords: ['cure', 'curing', 'dry', 'drying', 'wait', 'recoat', 'between coats'] },
  { topic: 'troubleshooting', keywords: ['crack', 'peel', 'adhesion', 'fail', 'bubble', 'blister', 'delaminate', 'problem', 'issue', 'wrong'] },
  { topic: 'coverage_rates', keywords: ['coverage', 'how much', 'sqm', 'square', 'area', 'quantity', 'pack', 'kg'] },
  { topic: 'temperature', keywords: ['temperature', 'temp', 'cold', 'hot', 'humidity', 'weather', 'celsius', 'fahrenheit'] },
  { topic: 'application_tools', keywords: ['trowel', 'tool', 'squeegee', 'brush', 'roller', 'spray', 'apply'] },
];

export function extractTopicFromMessage(message: string): string {
  const lower = message.toLowerCase();
  let bestMatch: { topic: string; score: number } = { topic: 'general', score: 0 };

  for (const { topic, keywords } of TOPIC_KEYWORDS) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestMatch.score) {
      bestMatch = { topic, score };
    }
  }

  return bestMatch.topic;
}

export async function fetchUserProgress(installerId: string): Promise<UserProgressEntry[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('topic, times_asked, confidence_score, is_weak_area, last_asked_at')
    .eq('installer_id', installerId)
    .order('times_asked', { ascending: false })
    .limit(20);

  if (error) {
    console.warn('[user-progress] fetch error:', error.message);
    return [];
  }

  return data ?? [];
}

export async function recordTopicAsked(
  installerId: string,
  topic: string,
  confidenceDelta = 5,
): Promise<void> {
  const { error } = await supabase.rpc('upsert_user_progress', {
    p_installer_id: installerId,
    p_topic: topic,
    p_confidence_delta: confidenceDelta,
  });

  if (error) {
    console.warn('[user-progress] upsert error:', error.message);
  }
}

export function buildProgressContext(progress: UserProgressEntry[]): string {
  if (progress.length === 0) return '';

  const weakAreas = progress.filter((p) => p.is_weak_area);
  const mastered = progress.filter((p) => p.confidence_score >= 70);
  const learning = progress.filter(
    (p) => !p.is_weak_area && p.confidence_score < 70 && p.times_asked > 1,
  );

  const lines: string[] = [];

  if (weakAreas.length > 0) {
    const topics = weakAreas.map((p) => p.topic.replace(/_/g, ' ')).join(', ');
    lines.push(`WEAK AREAS (reinforce with extra detail): ${topics}`);
  }

  if (mastered.length > 0) {
    const topics = mastered.map((p) => p.topic.replace(/_/g, ' ')).join(', ');
    lines.push(`MASTERED TOPICS (skip basics, be concise): ${topics}`);
  }

  if (learning.length > 0) {
    const topics = learning.map((p) => `${p.topic.replace(/_/g, ' ')} (asked ${p.times_asked}x)`).join(', ');
    lines.push(`STILL LEARNING: ${topics}`);
  }

  return lines.join('\n');
}
