import { getSignInErrorMessage, normalizeEmail } from '../lib/auth';

describe('normalizeEmail', () => {
  it('trims whitespace and normalizes case', () => {
    expect(normalizeEmail('  Reviewer@Example.COM  ')).toBe('reviewer@example.com');
  });
});

describe('getSignInErrorMessage', () => {
  it('turns invalid credentials into a clear, non-technical message', () => {
    expect(getSignInErrorMessage(new Error('Invalid login credentials'))).toBe(
      'The email or password is incorrect.',
    );
  });

  it('explains unconfirmed email accounts', () => {
    expect(getSignInErrorMessage({ message: 'Email not confirmed' })).toBe(
      'Please confirm your email before signing in.',
    );
  });

  it('does not expose backend or network details', () => {
    expect(getSignInErrorMessage(new Error('AuthRetryableFetchError: Failed to fetch'))).toBe(
      'Unable to sign in right now. Check your internet connection and try again.',
    );
  });
});
