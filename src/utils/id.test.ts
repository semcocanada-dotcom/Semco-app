import { createLocalId, isUuid } from '@/utils/id';

describe('record identifiers', () => {
  it('creates RFC 4122 version 4 identifiers for cloud records', () => {
    const ids = Array.from({ length: 20 }, () => createLocalId('project'));

    expect(ids.every(isUuid)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rejects legacy prefixed and malformed identifiers', () => {
    expect(isUuid('project-123')).toBe(false);
    expect(isUuid('')).toBe(false);
    expect(isUuid(null)).toBe(false);
  });
});
