// Pure string-matching helpers used to fuzzy-match OCR business names
// against the providers table. Kept dependency-free so they are easy to test.

/** Lowercases, strips punctuation and common corporate suffixes. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(inc|ltd|llc|corp|co|the|and|of|for|&)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Jaccard similarity on word sets (0–1). */
export function similarity(a: string, b: string): number {
  const setA = new Set(a.split(' ').filter(Boolean));
  const setB = new Set(b.split(' ').filter(Boolean));
  const intersection = [...setA].filter(w => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union ? intersection / union : 0;
}
