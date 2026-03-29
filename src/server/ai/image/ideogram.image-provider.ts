import type {
  ImageProvider,
  ImageGenerateInput,
  ImageEditInput,
  ImageProviderResult,
  ImageFeature,
  ImageProviderName,
} from './types';
import { PROVIDER_FEATURES } from './types';

function getConfig() {
  const apiKey = process.env.IDEOGRAM_API_KEY ?? '';
  const baseUrl =
    process.env.IDEOGRAM_BASE_URL ?? 'https://api.ideogram.ai';
  return { apiKey, baseUrl };
}

async function ideogramFetch(
  path: string,
  body: unknown,
): Promise<unknown> {
  const { apiKey, baseUrl } = getConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ideogram API error ${res.status}: ${text.slice(0, 300)}`);
  }

  return res.json();
}

function mapAspectRatio(w: number, h: number): string {
  const ratio = w / h;
  if (ratio > 1.6) return 'ASPECT_16_9';
  if (ratio > 1.3) return 'ASPECT_4_3';
  if (ratio < 0.6) return 'ASPECT_9_16';
  if (ratio < 0.75) return 'ASPECT_3_4';
  return 'ASPECT_1_1';
}

function mapQualityToModel(quality: string): string {
  switch (quality) {
    case 'draft':
      return 'V_2_TURBO';
    case 'premium':
      return 'V_2';
    default:
      return 'V_2';
  }
}

interface IdeogramImage {
  url: string;
  resolution: { width: number; height: number };
  is_image_safe: boolean;
}

interface IdeogramGenerateResponse {
  data: IdeogramImage[];
}

export class IdeogramImageProvider implements ImageProvider {
  readonly name: ImageProviderName = 'ideogram';

  async generateImage(
    input: ImageGenerateInput,
  ): Promise<ImageProviderResult> {
    const started = performance.now();
    const model = mapQualityToModel(input.quality);

    const payload = {
      image_request: {
        prompt: input.prompt,
        model,
        aspect_ratio: mapAspectRatio(input.size.width, input.size.height),
        magic_prompt_option: 'AUTO',
        ...(input.negativePrompt
          ? { negative_prompt: input.negativePrompt }
          : {}),
        ...(input.style
          ? { style_type: input.style.toUpperCase() }
          : {}),
      },
    };

    const res = (await ideogramFetch(
      '/generate',
      payload,
    )) as IdeogramGenerateResponse;

    if (!res.data?.length) {
      throw new Error('Ideogram: no images returned');
    }

    return {
      images: res.data.map((img) => ({
        url: img.url,
        width: img.resolution.width,
        height: img.resolution.height,
      })),
      model: `ideogram-${model.toLowerCase()}`,
      provider: 'ideogram',
      durationMs: Math.round(performance.now() - started),
    };
  }

  async editImage(input: ImageEditInput): Promise<ImageProviderResult> {
    const started = performance.now();

    if (input.editType === 'reframe') {
      return this.reframe(input, started);
    }
    if (input.editType === 'background_replace') {
      return this.replaceBackground(input, started);
    }

    const payload = {
      image_request: {
        prompt: input.prompt,
        model: 'V_2',
        magic_prompt_option: 'AUTO',
      },
      init_image: { url: input.imageUrl },
      ...(input.mask ? { mask: { url: input.mask } } : {}),
    };

    const res = (await ideogramFetch(
      '/edit',
      payload,
    )) as IdeogramGenerateResponse;

    if (!res.data?.length) {
      throw new Error('Ideogram edit: no images returned');
    }

    return {
      images: res.data.map((img) => ({
        url: img.url,
        width: img.resolution.width,
        height: img.resolution.height,
      })),
      model: 'ideogram-v2-edit',
      provider: 'ideogram',
      durationMs: Math.round(performance.now() - started),
    };
  }

  private async reframe(
    input: ImageEditInput,
    started: number,
  ): Promise<ImageProviderResult> {
    const payload = {
      image_request: {
        prompt: input.prompt ?? '',
        model: 'V_2',
        aspect_ratio: input.size
          ? mapAspectRatio(input.size.width, input.size.height)
          : 'ASPECT_1_1',
      },
      image_file: { url: input.imageUrl },
    };

    const res = (await ideogramFetch(
      '/reframe',
      payload,
    )) as IdeogramGenerateResponse;

    if (!res.data?.length) {
      throw new Error('Ideogram reframe: no images returned');
    }

    return {
      images: res.data.map((img) => ({
        url: img.url,
        width: img.resolution.width,
        height: img.resolution.height,
      })),
      model: 'ideogram-v2-reframe',
      provider: 'ideogram',
      durationMs: Math.round(performance.now() - started),
    };
  }

  private async replaceBackground(
    input: ImageEditInput,
    started: number,
  ): Promise<ImageProviderResult> {
    const payload = {
      image_request: {
        prompt: input.prompt,
        model: 'V_2',
      },
      image_file: { url: input.imageUrl },
    };

    const res = (await ideogramFetch(
      '/replace-background',
      payload,
    )) as IdeogramGenerateResponse;

    if (!res.data?.length) {
      throw new Error('Ideogram bg replace: no images returned');
    }

    return {
      images: res.data.map((img) => ({
        url: img.url,
        width: img.resolution.width,
        height: img.resolution.height,
      })),
      model: 'ideogram-v2-bg-replace',
      provider: 'ideogram',
      durationMs: Math.round(performance.now() - started),
    };
  }

  estimateCost(input: ImageGenerateInput): number {
    return input.quality === 'premium' ? 3 : 2;
  }

  supportsFeature(feature: ImageFeature): boolean {
    return PROVIDER_FEATURES.ideogram.has(feature);
  }

  isAvailable(): boolean {
    const key = process.env.IDEOGRAM_API_KEY;
    return (
      typeof key === 'string' &&
      key.trim().length > 0 &&
      process.env.ENABLE_IDEOGRAM !== 'false'
    );
  }

  getProviderName(): ImageProviderName {
    return 'ideogram';
  }
}
