import AsyncStorage from '@react-native-async-storage/async-storage';
import { geocodeAddress, type Coords } from '@lib/geocoding';

// Per-device cache of address → coordinates. Provider addresses are global and
// the providers table is read-only to clients (no write policy), so we resolve
// each distinct address once on-device via the free Nominatim geocoder and keep
// the result locally. Nominatim asks for ≤1 request/second, so we throttle.

const STORAGE_KEY = 'provider_geocode_cache_v1';
const THROTTLE_MS = 1100;

type CacheShape = Record<string, Coords | null>;

let memory: CacheShape | null = null;

async function load(): Promise<CacheShape> {
  if (memory) return memory;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    memory = raw ? (JSON.parse(raw) as CacheShape) : {};
  } catch {
    memory = {};
  }
  return memory;
}

async function persist(cache: CacheShape): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // best-effort; a failed write just means we re-geocode next launch
  }
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/**
 * Resolves coordinates for a set of addresses, using the local cache first and
 * geocoding only the misses (throttled). Returns a map of address → Coords.
 * `onProgress` fires after each newly geocoded address so the UI can refresh.
 */
export async function resolveAddressCoords(
  addresses: string[],
  onProgress?: (resolved: Map<string, Coords>) => void,
): Promise<Map<string, Coords>> {
  const cache = await load();
  const result = new Map<string, Coords>();

  // Seed from cache (skip nulls — those are known failures, don't retry them).
  const unique = Array.from(new Set(addresses.map(a => a.trim()).filter(Boolean)));
  const misses: string[] = [];
  for (const addr of unique) {
    if (addr in cache) {
      const hit = cache[addr];
      if (hit) result.set(addr, hit);
    } else {
      misses.push(addr);
    }
  }

  if (misses.length === 0) return result;
  if (onProgress) onProgress(new Map(result));

  for (let i = 0; i < misses.length; i++) {
    const addr = misses[i];
    const coords = await geocodeAddress(addr);
    cache[addr] = coords; // store null on failure so we don't hammer it again
    if (coords) {
      result.set(addr, coords);
      if (onProgress) onProgress(new Map(result));
    }
    if (i < misses.length - 1) await sleep(THROTTLE_MS);
  }

  await persist(cache);
  return result;
}
