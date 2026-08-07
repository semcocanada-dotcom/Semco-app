import { runAccountDeletion } from '../supabase/functions/_shared/accountDeletionOrchestrator';

function steps(events: string[]) {
  return {
    lockAccount: jest.fn(async () => { events.push('lock'); }),
    removeReceiptFiles: jest.fn(async () => { events.push('remove-receipts'); }),
    deleteAuthUser: jest.fn(async () => { events.push('delete-auth-user'); }),
    unlockAccount: jest.fn(async () => { events.push('unlock'); }),
  };
}

describe('runAccountDeletion', () => {
  it('removes receipt objects before deleting the Auth user', async () => {
    const events: string[] = [];
    const deletionSteps = steps(events);

    await runAccountDeletion(deletionSteps);

    expect(events).toEqual(['lock', 'remove-receipts', 'delete-auth-user']);
    expect(deletionSteps.unlockAccount).not.toHaveBeenCalled();
  });

  it('unlocks an existing account when receipt cleanup fails', async () => {
    const events: string[] = [];
    const deletionSteps = steps(events);
    deletionSteps.removeReceiptFiles.mockImplementationOnce(async () => {
      events.push('remove-receipts');
      throw new Error('Storage unavailable');
    });

    await expect(runAccountDeletion(deletionSteps)).rejects.toThrow('Storage unavailable');
    expect(events).toEqual(['lock', 'remove-receipts', 'unlock']);
    expect(deletionSteps.deleteAuthUser).not.toHaveBeenCalled();
  });

  it('does not attempt to unlock when creating the deletion lock fails', async () => {
    const events: string[] = [];
    const deletionSteps = steps(events);
    deletionSteps.lockAccount.mockRejectedValueOnce(new Error('Lock failed'));

    await expect(runAccountDeletion(deletionSteps)).rejects.toThrow('Lock failed');
    expect(deletionSteps.unlockAccount).not.toHaveBeenCalled();
  });

  it('preserves the primary error if best-effort unlock also fails', async () => {
    const events: string[] = [];
    const deletionSteps = steps(events);
    const onUnlockError = jest.fn();
    deletionSteps.removeReceiptFiles.mockRejectedValueOnce(new Error('Storage failed'));
    deletionSteps.unlockAccount.mockRejectedValueOnce(new Error('Unlock failed'));

    await expect(runAccountDeletion({ ...deletionSteps, onUnlockError })).rejects.toThrow(
      'Storage failed',
    );
    expect(onUnlockError).toHaveBeenCalledTimes(1);
  });
});
