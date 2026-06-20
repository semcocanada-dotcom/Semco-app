export interface AssistantGenerationRequest {
  prompt: string;
  systemInstruction: string;
}

export interface AssistantGenerationResult {
  content: string;
  provider: string;
  model: string;
}

export interface AssistantGenerationProvider {
  readonly name: string;
  readonly model: string;
  isConfigured(): boolean;
  generate(request: AssistantGenerationRequest): Promise<AssistantGenerationResult>;
}
