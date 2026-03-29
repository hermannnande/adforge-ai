import { OpenAiProvider } from '@/server/ai/providers/openai.provider';
import type {
  ImageProvider,
  ImageGenerateInput,
  ImageProviderResult,
  ImageFeature,
  ImageProviderName,
} from './types';
import { PROVIDER_FEATURES } from './types';

export class OpenAIImageProvider implements ImageProvider {
  readonly name: ImageProviderName = 'openai';
  private readonly legacy: OpenAiProvider;

  constructor() {
    this.legacy = new OpenAiProvider();
  }

  async generateImage(input: ImageGenerateInput): Promise<ImageProviderResult> {
    const result = await this.legacy.generateImage({
      prompt: input.prompt,
      negativePrompt: input.negativePrompt,
      size: input.size,
      quality: input.quality,
      style: input.style,
      numberOfImages: input.numberOfImages,
      model: input.model,
    });

    return {
      images: result.images.map((img) => ({
        url: img.url ?? '',
        base64: img.base64,
        width: img.width,
        height: img.height,
      })),
      model: result.model,
      provider: 'openai',
      durationMs: result.durationMs,
    };
  }

  estimateCost(_input: ImageGenerateInput): number {
    return 2;
  }

  supportsFeature(feature: ImageFeature): boolean {
    return PROVIDER_FEATURES.openai.has(feature);
  }

  isAvailable(): boolean {
    return this.legacy.isAvailable();
  }

  getProviderName(): ImageProviderName {
    return 'openai';
  }
}
