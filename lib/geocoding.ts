import { SOUTHERN_RATE_PER_KM, NORTHERN_RATE_PER_KM, PARALLEL_54_LATITUDE } from '@constants/mileage';

export interface Coords {
  lat: number;
  lng: number;
}

export interface MileageCalculation {
  distanceKm:   number;
  ratePerKm:    number;
  amount:       number;
  isNorthern:   boolean;
  providerCoords: Coords;
}

// ─── Geocoding (Nominatim — free, no API key) ─────────────────────────────────

async function tryGeocode(address: string): Promise<Coords | null> {
  try {
    const query = encodeURIComponent(`${address}, Saskatchewan, Canada`);
    const url   = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ca`;
    const res   = await fetch(url, { headers: { 'User-Agent': 'SemcoApp/1.0 (ca.semco.app)' } });
    if (!res.ok) return null;
    const data  = await res.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

// Tries full address first, then drops the street and retries with city+postal,
// then city-only. Handles small rural addresses Nominatim doesn't know by street.
export async function geocodeAddress(address: string): Promise<Coords | null> {
  const hit = await tryGeocode(address);
  if (hit) return hit;

  const parts = address.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const noStreet = await tryGeocode(parts.slice(1).join(', '));
    if (noStreet) return noStreet;
  }
  if (parts.length >= 2) {
    return tryGeocode(parts[parts.length - 1]);
  }
  return null;
}

// ─── Driving distance (OSRM — free, no API key) ──────────────────────────────

export async function getDrivingDistanceKm(
  origin:      Coords,
  destination: Coords,
): Promise<number | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
      `?overview=false`;
    const res  = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const meters: number | undefined = data.routes?.[0]?.distance;
    if (meters != null) {
      return Math.round((meters / 1000) * 10) / 10; // 1 decimal km
    }
  } catch {}
  return null;
}

// ─── Full mileage calculation ─────────────────────────────────────────────────

/**
 * Geocodes both addresses, checks the provider latitude against the 54th
 * parallel, selects the correct rate, and returns the full calculation.
 */
export async function calculateMileage(
  homeAddress:     string,
  providerAddress: string,
): Promise<MileageCalculation | null> {
  const [homeCoords, providerCoords] = await Promise.all([
    geocodeAddress(homeAddress),
    geocodeAddress(providerAddress),
  ]);

  if (!homeCoords || !providerCoords) return null;

  const distanceKm = await getDrivingDistanceKm(homeCoords, providerCoords);
  if (!distanceKm) return null;

  const isNorthern = providerCoords.lat >= PARALLEL_54_LATITUDE;
  const ratePerKm  = isNorthern ? NORTHERN_RATE_PER_KM : SOUTHERN_RATE_PER_KM;
  const amount     = Math.round(distanceKm * ratePerKm * 100) / 100;

  return { distanceKm, ratePerKm, amount, isNorthern, providerCoords };
}
