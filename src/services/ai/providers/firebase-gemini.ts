import Constants from 'expo-constants';
import { Platform } from 'react-native';
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
const MAX_OUTPUT_TOKENS = 2200;

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

    const errors: string[] = [];

    if (Platform.OS !== 'web') {
      try {
        return await generateWithNativeFirebase(config, request);
      } catch (error) {
        errors.push(`native: ${errorMessage(error)}`);
      }
    }

    try {
      return await generateWithWebFirebase(config, request);
    } catch (error) {
      errors.push(`web: ${errorMessage(error)}`);
    }

    throw new Error(errors.join(' | ') || 'Gemini unavailable.');
  }
}

async function generateWithNativeFirebase(
  config: FirebaseExtraConfig,
  request: AssistantGenerationRequest,
): Promise<AssistantGenerationResult> {
  const appModule = await import('@react-native-firebase/app');
  const aiModule = await import('@react-native-firebase/ai');

  const nativeApp = appModule.getApp();
  const NativeGoogleAIBackend = aiModule.GoogleAIBackend;
  const ai = aiModule.getAI(nativeApp, {
    backend: NativeGoogleAIBackend ? new NativeGoogleAIBackend() : undefined,
  });
  const model = aiModule.getGenerativeModel(ai, {
    model: config.aiModel ?? DEFAULT_MODEL,
    systemInstruction: request.systemInstruction,
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  });

  const result = await model.generateContent(request.prompt);
  const content = responseText(result.response);
  if (!content) throw new Error(responseDebugMessage(result.response));

  return {
    content,
    provider: 'firebase-ai-logic-native',
    model: config.aiModel ?? DEFAULT_MODEL,
  };
}

async function generateWithWebFirebase(
  config: FirebaseExtraConfig,
  request: AssistantGenerationRequest,
): Promise<AssistantGenerationResult> {
    const app = getFirebaseApp(config);
    const ai = getAI(app, {
      backend: new GoogleAIBackend(),
    });
    const model = getGenerativeModel(ai, {
      model: config.aiModel ?? DEFAULT_MODEL,
      systemInstruction: request.systemInstruction,
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
    });

    const result = await model.generateContent(request.prompt);
    const content = responseText(result.response);
    if (!content) throw new Error(responseDebugMessage(result.response));

    return {
      content,
      provider: 'firebase-ai-logic-web',
      model: config.aiModel ?? DEFAULT_MODEL,
    };
}

function responseText(response: unknown): string {
  const maybeText = (response as { text?: () => string }).text;
  if (typeof maybeText === 'function') {
    return maybeText.call(response).trim();
  }

  return '';
}

function responseDebugMessage(response: unknown): string {
  const candidate = (response as { candidates?: Array<{ finishReason?: string; finishMessage?: string }> })
    .candidates?.[0];
  const finishReason = candidate?.finishReason ? ` finishReason=${candidate.finishReason}` : '';
  const finishMessage = candidate?.finishMessage ? ` finishMessage=${candidate.finishMessage}` : '';
  return `Gemini returned an empty answer.${finishReason}${finishMessage}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
