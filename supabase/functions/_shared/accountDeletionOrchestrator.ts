export interface AccountDeletionSteps {
  lockAccount: () => Promise<void>;
  removeReceiptFiles: () => Promise<void>;
  deleteAuthUser: () => Promise<void>;
  unlockAccount: () => Promise<void>;
  onUnlockError?: (error: unknown) => void;
}
/**
 * Enforces deletion order: block new receipt access, remove every receipt,
 * then delete the Auth user (which cascades relational data). If anything
 * fails before Auth deletion, receipt access is restored for a later retry.
 */
export async function runAccountDeletion(steps: AccountDeletionSteps): Promise<void> {
  let deletionLocked = false;
  let authUserDeleted = false;

  try {
    await steps.lockAccount();
    deletionLocked = true;

    await steps.removeReceiptFiles();
    await steps.deleteAuthUser();
    authUserDeleted = true;
  } catch (error) {
    if (deletionLocked && !authUserDeleted) {
      try {
        await steps.unlockAccount();
      } catch (unlockError) {
        steps.onUnlockError?.(unlockError);
      }
    }
    throw error;
  }
}
