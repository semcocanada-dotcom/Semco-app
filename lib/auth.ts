const DEFAULT_SIGN_IN_ERROR =
  'Unable to sign in right now. Check your internet connection and try again.';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getSignInErrorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : '';
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'The email or password is incorrect.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }

  return DEFAULT_SIGN_IN_ERROR;
}
