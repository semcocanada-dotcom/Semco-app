import {
  getRateForLatitude,
  SOUTHERN_RATE_PER_KM,
  NORTHERN_RATE_PER_KM,
  PARALLEL_54_LATITUDE,
} from '@constants/mileage';

describe('getRateForLatitude', () => {
  it('uses the southern rate below the 54th parallel', () => {
    expect(getRateForLatitude(50.4)).toBe(SOUTHERN_RATE_PER_KM);
  });

  it('uses the northern rate at or above the 54th parallel', () => {
    expect(getRateForLatitude(PARALLEL_54_LATITUDE)).toBe(NORTHERN_RATE_PER_KM);
    expect(getRateForLatitude(59.1)).toBe(NORTHERN_RATE_PER_KM);
  });

  it('keeps northern more generous than southern', () => {
    expect(NORTHERN_RATE_PER_KM).toBeGreaterThan(SOUTHERN_RATE_PER_KM);
  });
});
