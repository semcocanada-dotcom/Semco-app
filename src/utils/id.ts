// Operational records sync to Supabase UUID columns. Keep the existing helper
// signature so callers stay simple, but generate an RFC 4122 v4 identifier.
// The prefix is intentionally ignored; record type is already known from the
// table and a prefixed id cannot be inserted into a UUID cloud column.
export function createLocalId(_prefix: string): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
