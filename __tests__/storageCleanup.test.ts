import {
  removeStoragePrefixRecursively,
  type StorageBucketApi,
  type StorageListItem,
} from '../supabase/functions/_shared/storageCleanup';

const USER_ID = '11111111-1111-4111-8111-111111111111';

function bucketFor(folders: Record<string, StorageListItem[]>) {
  const list = jest.fn(async (path: string, options: { limit: number; offset: number }) => ({
    data: (folders[path] ?? []).slice(options.offset, options.offset + options.limit),
    error: null,
  }));
  const remove = jest.fn().mockResolvedValue({ data: [], error: null });
  return { list, remove } as unknown as StorageBucketApi & {
    list: jest.Mock;
    remove: jest.Mock;
  };
}

describe('removeStoragePrefixRecursively', () => {
  it('finds files at arbitrary nested depths and removes full object paths', async () => {
    const bucket = bucketFor({
      [USER_ID]: [{ id: null, name: 'child-a' }],
      [`${USER_ID}/child-a`]: [
        { id: null, name: 'expense-a' },
        { id: 'file-1', name: 'legacy.pdf' },
      ],
      [`${USER_ID}/child-a/expense-a`]: [
        { id: null, name: 'originals' },
        { id: 'file-2', name: 'receipt.jpg' },
      ],
      [`${USER_ID}/child-a/expense-a/originals`]: [
        { id: 'file-3', name: 'scan.png' },
      ],
    });

    await expect(removeStoragePrefixRecursively(bucket, USER_ID)).resolves.toBe(3);
    expect(bucket.remove).toHaveBeenCalledWith([
      `${USER_ID}/child-a/legacy.pdf`,
      `${USER_ID}/child-a/expense-a/receipt.jpg`,
      `${USER_ID}/child-a/expense-a/originals/scan.png`,
    ]);
  });

  it('paginates listings and removes at most 1000 objects per request', async () => {
    const files = Array.from({ length: 1001 }, (_, index) => ({
      id: `file-${index}`,
      name: `receipt-${String(index).padStart(4, '0')}.jpg`,
    }));
    const bucket = bucketFor({ [USER_ID]: files });

    await expect(removeStoragePrefixRecursively(bucket, USER_ID)).resolves.toBe(1001);
    expect(bucket.list).toHaveBeenCalledTimes(2);
    expect(bucket.remove).toHaveBeenCalledTimes(2);
    expect(bucket.remove.mock.calls[0][0]).toHaveLength(1000);
    expect(bucket.remove.mock.calls[1][0]).toHaveLength(1);
  });

  it('stops without deleting when a folder listing fails', async () => {
    const bucket = bucketFor({});
    bucket.list.mockResolvedValueOnce({ data: null, error: { message: 'storage unavailable' } });

    await expect(removeStoragePrefixRecursively(bucket, USER_ID)).rejects.toThrow(
      'storage unavailable',
    );
    expect(bucket.remove).not.toHaveBeenCalled();
  });

  it('rejects malformed user ids and unsafe path segments', async () => {
    const bucket = bucketFor({ [USER_ID]: [{ id: 'file', name: '../other-user/file' }] });

    await expect(removeStoragePrefixRecursively(bucket, 'not-a-user')).rejects.toThrow(
      'Invalid user id',
    );
    await expect(removeStoragePrefixRecursively(bucket, USER_ID)).rejects.toThrow(
      'invalid object name',
    );
    expect(bucket.remove).not.toHaveBeenCalled();
  });
});
