import { FirebaseGeminiProvider } from './firebase-gemini';
import type { AssistantGenerationProvider } from './types';

const firebaseGeminiProvider = new FirebaseGeminiProvider();

export function getAssistantGenerationProvider(): AssistantGenerationProvider | null {
  if (firebaseGeminiProvider.isConfigured()) return firebaseGeminiProvider;
  return null;
}

export function getConfiguredProviderStatus() {
  return {
    provider: firebaseGeminiProvider.name,
    model: firebaseGeminiProvider.model,
    configured: firebaseGeminiProvider.isConfigured(),
  };
}
