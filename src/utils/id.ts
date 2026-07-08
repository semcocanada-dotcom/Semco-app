// Timestamp-only ids collide when two records are created in the same
// millisecond (double-tap, batched handlers). Keep the timestamp for rough
// ordering and add a random suffix for uniqueness.
export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
