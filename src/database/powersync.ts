// PowerSync offline sync — wired up in Task 6.
// Stubbed here so the app builds without the SDK installed.

export let powerSync: null = null;

export async function initPowerSync(_accessToken: () => Promise<string>): Promise<null> {
  console.warn('[PowerSync] Sync not yet configured — Task 6');
  return null;
}
