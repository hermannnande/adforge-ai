export type ImageProviderName = 'openai' | 'flux' | 'ideogram';

export type ImageUsageType =
  | 'standard_generate'
  | 'premium_generate'
  | 'text_heavy_generate'
  | 'photorealistic_generate'
  | 'product_generate'
  | 'lifestyle_generate'
  | 'multi_reference_generate'
  | 'simple_edit'
  | 'masked_edit'
  | 'reframe'
  | 'background_replace';

export type ImageFeature =
  | 'text_generation'
  | 'text_in_image'
  | 'photorealistic'
  | 'product_photography'
  | 'lifestyle'
  | 'multi_reference'
  | 'inpainting'
  | 'outpainting'
  | 'reframe'
  | 'background_replace'
  | 'negative_prompt'
  | 'style_transfer';

export interface ImageSize {
  width: number;
  height: number;
}

export interface ImageGenerateInput {
  prompt: string;
  negativePrompt?: string;
  size: ImageSize;
  quality: 'draft' | 'standard' | 'premium';
  style?: string;
  numberOfImages?: number;
  model?: string;
  referenceImages?: string[];
  /** Override provider (user manual selection) */
  providerOverride?: ImageProviderName;
  /** Usage type detected by router */
  usageType?: ImageUsageType;
}

export interface ImageEditInput {
  imageUrl: string;
  prompt: string;
  mask?: string;
  size?: ImageSize;
  model?: string;
  editType: 'simple_edit' | 'masked_edit' | 'reframe' | 'background_replace';
}

export interface ImageAsset {
  url: string;
  base64?: string;
  width: number;
  height: number;
}

export interface ImageProviderResult {
  images: ImageAsset[];
  model: string;
  provider: ImageProviderName;
  durationMs: number;
  costEstimate?: number;
}

export interface ImageProviderError {
  provider: ImageProviderName;
  code: string;
  message: string;
  retryable: boolean;
}

export interface ImageProvider {
  readonly name: ImageProviderName;

  generateImage(input: ImageGenerateInput): Promise<ImageProviderResult>;

  editImage?(input: ImageEditInput): Promise<ImageProviderResult>;

  estimateCost(input: ImageGenerateInput): number;

  supportsFeature(feature: ImageFeature): boolean;

  isAvailable(): boolean;

  getProviderName(): ImageProviderName;
}

export const PROVIDER_FEATURES: Record<ImageProviderName, Set<ImageFeature>> = {
  openai: new Set([
    'text_generation',
    'photorealistic',
    'inpainting',
    'style_transfer',
    'negative_prompt',
  ]),
  flux: new Set([
    'photorealistic',
    'product_photography',
    'lifestyle',
    'multi_reference',
    'style_transfer',
  ]),
  ideogram: new Set([
    'text_in_image',
    'text_generation',
    'reframe',
    'background_replace',
    'inpainting',
    'negative_prompt',
  ]),
};
