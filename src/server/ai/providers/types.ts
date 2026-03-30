export type ImageSize = { width: number; height: number };

export interface TextGenerationParams {
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  images?: string[];
}

export interface TextGenerationResult {
  text: string;
  usage?: { inputTokens: number; outputTokens: number };
  model: string;
  provider: string;
  durationMs: number;
}

export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  size: ImageSize;
  quality?: 'draft' | 'standard' | 'premium';
  style?: string;
  numberOfImages?: number;
  model?: string;
}

export interface ImageGenerationResult {
  images: Array<{
    url: string;
    base64?: string;
    width: number;
    height: number;
  }>;
  model: string;
  provider: string;
  durationMs: number;
}

export interface AiProvider {
  readonly name: string;
  generateText(params: TextGenerationParams): Promise<TextGenerationResult>;
  generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult>;
  isAvailable(): boolean;
}
