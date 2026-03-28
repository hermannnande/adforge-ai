import OpenAI from 'openai';

import type {
  AiProvider,
  ImageGenerationParams,
  ImageGenerationResult,
  ImageSize,
  TextGenerationParams,
  TextGenerationResult,
} from './types';

const DEFAULT_TEXT_MODEL = 'gpt-4o-mini';
const DEFAULT_IMAGE_MODEL = 'dall-e-3';

type Dalle3Size = '1024x1024' | '1792x1024' | '1024x1792';

function mapToDalle3Size(size: ImageSize): Dalle3Size {
  const w = Math.max(1, size.width);
  const h = Math.max(1, size.height);
  const ratio = w / h;

  const distSquare = Math.abs(ratio - 1);
  const distLandscape = Math.abs(ratio - 1792 / 1024);
  const distPortrait = Math.abs(ratio - 1024 / 1792);

  if (distLandscape <= distSquare && distLandscape <= distPortrait) {
    return '1792x1024';
  }
  if (distPortrait <= distSquare) {
    return '1024x1792';
  }
  return '1024x1024';
}

function dalle3SizeToDimensions(
  size: Dalle3Size,
): { width: number; height: number } {
  const [a, b] = size.split('x').map((n) => Number.parseInt(n, 10));
  return { width: a, height: b };
}

function mapQuality(
  quality: ImageGenerationParams['quality'],
): 'standard' | 'hd' {
  switch (quality) {
    case 'premium':
      return 'hd';
    case 'draft':
    case 'standard':
    default:
      return 'standard';
  }
}

function mapStyle(
  style: string | undefined,
): 'vivid' | 'natural' | undefined {
  if (!style) return undefined;
  const s = style.toLowerCase();
  if (s === 'vivid' || s === 'natural') return s;
  return undefined;
}

function buildImagePrompt(params: ImageGenerationParams): string {
  if (!params.negativePrompt?.trim()) return params.prompt;
  return `${params.prompt}\n\nAvoid the following: ${params.negativePrompt.trim()}`;
}

function openAiErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';

  private _client: OpenAI | null = null;
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private get client(): OpenAI {
    if (!this._client) {
      const key = this.apiKey ?? process.env.OPENAI_API_KEY;
      if (!key) throw new Error('OPENAI_API_KEY is not set');
      this._client = new OpenAI({ apiKey: key });
    }
    return this._client;
  }

  isAvailable(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return typeof key === 'string' && key.trim().length > 0;
  }

  async generateText(
    params: TextGenerationParams,
  ): Promise<TextGenerationResult> {
    const started = performance.now();
    const model = params.model ?? DEFAULT_TEXT_MODEL;

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt },
        ],
        temperature: params.temperature,
        max_completion_tokens: params.maxTokens ?? undefined,
        response_format:
          params.responseFormat === 'json'
            ? { type: 'json_object' }
            : undefined,
      });

      const choice = completion.choices[0];
      const text = choice?.message?.content ?? '';
      const usage = completion.usage;

      return {
        text,
        usage:
          usage != null
            ? {
                inputTokens: usage.prompt_tokens,
                outputTokens: usage.completion_tokens,
              }
            : undefined,
        model: completion.model ?? model,
        provider: this.name,
        durationMs: Math.round(performance.now() - started),
      };
    } catch (err) {
      throw new Error(
        `OpenAI text generation failed: ${openAiErrorMessage(err)}`,
      );
    }
  }

  async generateImage(
    params: ImageGenerationParams,
  ): Promise<ImageGenerationResult> {
    const started = performance.now();
    const model = params.model ?? DEFAULT_IMAGE_MODEL;
    const dalleSize = mapToDalle3Size(params.size);
    const { width, height } = dalle3SizeToDimensions(dalleSize);
    const quality = mapQuality(params.quality);
    const style = mapStyle(params.style);
    const count = Math.min(
      10,
      Math.max(1, params.numberOfImages ?? 1),
    );
    const prompt = buildImagePrompt(params);

    try {
      const images: ImageGenerationResult['images'] = [];

      for (let i = 0; i < count; i += 1) {
        const res = await this.client.images.generate({
          model,
          prompt,
          n: 1,
          size: dalleSize,
          quality,
          style: style ?? undefined,
          response_format: 'url',
        });

        const item = res.data?.[0];
        const url = item?.url;
        if (!url) {
          throw new Error('OpenAI image response contained no URL');
        }

        images.push({
          url,
          width,
          height,
        });
      }

      return {
        images,
        model,
        provider: this.name,
        durationMs: Math.round(performance.now() - started),
      };
    } catch (err) {
      throw new Error(
        `OpenAI image generation failed: ${openAiErrorMessage(err)}`,
      );
    }
  }
}
