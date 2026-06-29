// Dependency-free base64 → bytes decoder.
//
// React Native's `fetch(localUri).blob()` produces a blob that Supabase
// Storage uploads as an empty/corrupt object, so receipts must be uploaded as
// an ArrayBuffer instead. expo-file-system reads files as base64; this turns
// that string into the bytes Storage expects. Kept pure so it is unit-testable
// and works under Hermes (where a global `atob` is not guaranteed).

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const LOOKUP = new Uint8Array(256);
for (let i = 0; i < B64_CHARS.length; i++) {
  LOOKUP[B64_CHARS.charCodeAt(i)] = i;
}

/** Decodes a standard base64 string into a Uint8Array. */
export function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  if (clean.length === 0) return new Uint8Array(0);

  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  const byteLength = (clean.length / 4) * 3 - padding;
  const bytes = new Uint8Array(byteLength);

  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const e1 = LOOKUP[clean.charCodeAt(i)];
    const e2 = LOOKUP[clean.charCodeAt(i + 1)];
    const e3 = LOOKUP[clean.charCodeAt(i + 2)];
    const e4 = LOOKUP[clean.charCodeAt(i + 3)];
    const chunk = (e1 << 18) | (e2 << 12) | (e3 << 6) | e4;
    if (p < byteLength) bytes[p++] = (chunk >> 16) & 0xff;
    if (p < byteLength) bytes[p++] = (chunk >> 8) & 0xff;
    if (p < byteLength) bytes[p++] = chunk & 0xff;
  }
  return bytes;
}
