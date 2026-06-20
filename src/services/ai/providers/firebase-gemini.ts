import Constants from 'expo-constants';
import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import type {
  AssistantGenerationProvider,
  AssistantGenerationRequest,
  AssistantGenerationResult,
} from './types';

interface FirebaseExtraConfig extends FirebaseOptions {
  aiModel?: string;
}

const FIREBASE_APP_NAME = 'semco-pro-ai';
const DEFAULT_MODEL = 'gemini-3.5-flash';

function getExtraFirebaseConfig(): FirebaseExtraConfig {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const firebase = extra?.firebase as Record<string, unknown> | undefined;

  return {
    apiKey: stringValue(firebase?.apiKey),
    authDomain: stringValue(firebase?.authDomain),
    projectId: stringValue(firebase?.projectId),
    storageBucket: stringValue(firebase?.storageBucket),
    messagingSenderId: stringValue(firebase?.messagingSenderId),
    appId: stringValue(firebase?.appId),
    measurementId: stringValue(firebase?.measurementId),
    aiModel: stringValue(firebase?.aiModel) ?? DEFAULT_MODEL,
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getFirebaseApp(config: FirebaseExtraConfig): FirebaseApp {
  const existing = getApps().find((app) => app.name === FIREBASE_APP_NAME);
  if (existing) return existing;

  return initializeApp(config, FIREBASE_APP_NAME);
}

export class FirebaseGeminiProvider implements AssistantGenerationProvider {
  readonly name = 'firebase-ai-logic';

  get model(): string {
    return getExtraFirebaseConfig().aiModel ?? DEFAULT_MODEL;
  }

  isConfigured(): boolean {
    const config = getExtraFirebaseConfig();
    return Boolean(config.apiKey && config.projectId && config.appId);
  }

  async generate(request: AssistantGenerationRequest): Promise<AssistantGenerationResult> {
    const config = getExtraFirebaseConfig();
    if (!this.isConfigured()) {
      throw new Error('Firebase AI Logic is not configured.');
    }

    const app = getFirebaseApp(config);
    const ai = getAI(app, {
      backend: new GoogleAIBackend(),
      useLimitedUseAppCheckTokens: true,
    });
    const model = getGenerativeModel(ai, {
      model: config.aiModel ?? DEFAULT_MODEL,
      systemInstruction: request.systemInstruction,
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 900,
      },
    });

    const result = await model.generateContent(request.prompt);
    const content = result.response.text().trim();
    if (!content) throw new Error('Gemini returned an empty answer.');

    return {
      content,
      provider: this.name,
      model: config.aiModel ?? DEFAULT_MODEL,
    };
  }
}
