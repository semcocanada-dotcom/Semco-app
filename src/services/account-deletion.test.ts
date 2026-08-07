import { deleteCurrentAccount } from '@/services/account-deletion';
import { supabase } from '@/services/supabase';

jest.mock('@/services/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

const invoke = supabase.functions.invoke as jest.Mock;

describe('account deletion', () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it('completes only after the authenticated deletion function confirms success', async () => {
    invoke.mockResolvedValue({ data: { deleted: true }, error: null });

    await expect(deleteCurrentAccount()).resolves.toBeUndefined();
    expect(invoke).toHaveBeenCalledWith('delete-account', { method: 'POST' });
  });

  it('keeps the client signed in when the deletion function fails', async () => {
    invoke.mockResolvedValue({ data: null, error: new Error('network error') });

    await expect(deleteCurrentAccount()).rejects.toThrow('could not be completed');
  });

  it('rejects an unconfirmed response instead of claiming the account was deleted', async () => {
    invoke.mockResolvedValue({ data: {}, error: null });

    await expect(deleteCurrentAccount()).rejects.toThrow('could not be confirmed');
  });
});
