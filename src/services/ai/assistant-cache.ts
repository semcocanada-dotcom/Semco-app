import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AssistantCitation } from '@/database/schema/conversations';
import type { RetrievedSemcoChunk } from './semco-retrieval';

export const DAILY_AI_LIMIT = 20;

export interface CachedAssistantAnswer {
  content: string;
  citations: AssistantCitation[];
  provider: string;
  createdAt: string;
}

export interface AssistantDebugLog {
  id: string;
  timestamp: string;
  question: string;
  provider: string;
  status: 'generated' | 'cached' | 'fallback' | 'blocked';
  retrievalNotes: string[];
  chunks: Array<{
    id: string;
    documentName: string;
    title?: string;
    pageNumber?: number;
    score: number;
    retrieval: 'semantic' | 'local';
    preview: string;
  }>;
  answerPreview: string;
  sources: AssistantCitation[];
  error?: string;
}

const CACHE_KEY = 'semco.ai.cache.v2';
const LOG_KEY = 'semco.ai.logs.v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 80;
const MAX_LOG_ENTRIES = 40;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function usageKey(installerId?: string): string {
  return `semco.ai.limit.v1.${installerId ?? 'anonymous'}.${todayKey()}`;
}

function normalizeQuestion(question: string): string {
  return question.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function hashString(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) + value.charCodeAt(i);
    hash &= hash;
  }
  return Math.abs(hash).toString(36);
}

function cacheKey(question: string, chunks: RetrievedSemcoChunk[]): string {
  const evidence = chunks
    .map((chunk) => `${chunk.documentName}:${chunk.pageNumber ?? 'na'}:${chunk.id}`)
    .join('|');
  return hashString(`${normalizeQuestion(question)}|${evidence}`);
}

async function readCacheMap(): Promise<Record<string, CachedAssistantAnswer>> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function getCachedAnswer(
  question: string,
  chunks: RetrievedSemcoChunk[],
): Promise<CachedAssistantAnswer | null> {
  const key = cacheKey(question, chunks);
  const map = await readCacheMap();
  const cached = map[key];
  if (!cached) return null;

  const age = Date.now() - new Date(cached.createdAt).getTime();
  if (age > CACHE_TTL_MS) {
    delete map[key];
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(map));
    return null;
  }

  return cached;
}

export async function setCachedAnswer(
  question: string,
  chunks: RetrievedSemcoChunk[],
  answer: CachedAssistantAnswer,
): Promise<void> {
  const key = cacheKey(question, chunks);
  const map = await readCacheMap();
  const entries = Object.entries({ ...map, [key]: answer })
    .sort(([, a], [, b]) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_CACHE_ENTRIES);

  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
}

export async function getDailyAiUsage(installerId?: string): Promise<number> {
  const raw = await AsyncStorage.getItem(usageKey(installerId));
  const count = Number(raw);
  return Number.isFinite(count) ? count : 0;
}

export async function incrementDailyAiUsage(installerId?: string): Promise<number> {
  const next = (await getDailyAiUsage(installerId)) + 1;
  await AsyncStorage.setItem(usageKey(installerId), String(next));
  return next;
}

export async function appendAssistantDebugLog(log: AssistantDebugLog): Promise<void> {
  const logs = await getAssistantDebugLogs();
  await AsyncStorage.setItem(LOG_KEY, JSON.stringify([log, ...logs].slice(0, MAX_LOG_ENTRIES)));
}

export async function getAssistantDebugLogs(): Promise<AssistantDebugLog[]> {
  const raw = await AsyncStorage.getItem(LOG_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function clearAssistantDebugLogs(): Promise<void> {
  await AsyncStorage.removeItem(LOG_KEY);
}
