import { supabase } from '@/services/supabase';

type DeleteAccountResponse = {
  deleted?: boolean;
  error?: string;
};

export async function deleteCurrentAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke<DeleteAccountResponse>('delete-account', {
    method: 'POST',
  });

  if (error) {
    throw new Error('Account deletion could not be completed. Check your connection and try again.');
  }

  if (!data?.deleted) {
    throw new Error(data?.error || 'Account deletion could not be confirmed. Please try again.');
  }
}
