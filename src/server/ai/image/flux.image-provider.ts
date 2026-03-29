import type {
  ImageProvider,
  ImageGenerateInput,
  ImageEditInput,
  ImageProviderResult,
  ImageFeature,
  ImageProviderName,
} from './types';
import { PROVIDER_FEATURES } from './types';

const FLUX_MODELS = {
  fast: 'flux-pro-1.1',
  pro: 'flux-pro-1.1',
  max: 'flux-pro-1.1-ultra',
} as const;

type FluxTier = keyof typeof FLUX_MODELS;

function resolveFluxModel(quality: string): { tier: FluxTier; model: string } {
  switch (quality) {
    case 'draft':
      return { tier: 'fast', model: FLUX_MODELS.fast };
    case 'premium':
      return { tier: 'max', model: FLUX_MODELS.max };
    default:
      return { tier: 'pro', model: FLUX_MODELS.pro };
  }
}

function getConfig() {
  const apiKey = process.env.FLUX_API_KEY ?? '';
  const baseUrl = process.env.FLUX_BASE_URL ?? 'https://api.bfl.ml/v1';
  return { apiKey, baseUrl };
}

async function fluxFetch(path: string, body?: unknown): Promise<unknown> {
  const { apiKey, baseUrl } = getConfig();
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Key': apiKey,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`FLUX API error ${res.status}: ${text.slice(0, 300)}`);
  }

  return res.json();
}

interface FluxSubmitResponse {
  id: string;
  polling_url?: string;
}

interface FluxPollResponse {
  id: string;
  status: 'Pending' | 'Ready' | 'Error' | 'Request Moderated' | 'Content Moderated' | 'Task not found';
  result?: {
    sample?: string;
    prompt?: string;
    seed?: number;
  };
}

async function pollUntilReady(
  taskId: string,
  maxWaitMs = 120_000,
  intervalMs = 2_000,
): Promise<FluxPollResponse> {
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    const res = (await fluxFetch(
      `/get_result?id=${encodeURIComponent(taskId)}`,
    )) as FluxPollResponse;

    if (res.status === 'Ready') return res;
    if (res.status === 'Error' || res.status === 'Request Moderated' || res.status === 'Content Moderated' || res.status === 'Task not found') {
      throw new Error(`FLUX job ${taskId} failed: ${res.status}`);
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(`FLUX job ${taskId} timed out after ${maxWaitMs}ms`);
}

export class FluxImageProvider implements ImageProvider {
  readonly name: ImageProviderName = 'flux';

  async generateImage(input: ImageGenerateInput): Promise<ImageProviderResult> {
    const started = performance.now();
    const { tier, model } = resolveFluxModel(input.quality);

    const endpoint =
      tier === 'max'
        ? '/flux-pro-1.1-ultra'
        : '/flux-pro-1.1';

    const payload: Record<string, unknown> = {
      prompt: input.prompt,
      width: input.size.width,
      height: input.size.height,
    };

    if (tier === 'max') {
      payload.aspect_ratio = `${input.size.width}:${input.size.height}`;
      delete payload.width;
      delete payload.height;
    }

    const submitRes = (await fluxFetch(endpoint, payload)) as FluxSubmitResponse;

    if (!submitRes.id) {
      throw new Error('FLUX: no task ID returned');
    }

    const result = await pollUntilReady(submitRes.id);

    const imageUrl = result.result?.sample;
    if (!imageUrl) {
      throw new Error('FLUX: no image in result');
    }

    return {
      images: [
        {
          url: imageUrl,
          width: input.size.width,
          height: input.size.height,
        },
      ],
      model,
      provider: 'flux',
      durationMs: Math.round(performance.now() - started),
    };
  }

  async editImage(input: ImageEditInput): Promise<ImageProviderResult> {
    const started = performance.now();

    const payload: Record<string, unknown> = {
      prompt: input.prompt,
      input_image: input.imageUrl,
    };

    if (input.mask) {
      payload.mask = input.mask;
    }

    const submitRes = (await fluxFetch('/flux-pro-1.1/edit', payload)) as FluxSubmitResponse;

    if (!submitRes.id) {
      throw new Error('FLUX edit: no task ID returned');
    }

    const result = await pollUntilReady(submitRes.id);
    const imageUrl = result.result?.sample;
    if (!imageUrl) {
      throw new Error('FLUX edit: no image in result');
    }

    return {
      images: [
        {
          url: imageUrl,
          width: input.size?.width ?? 1024,
          height: input.size?.height ?? 1024,
        },
      ],
      model: 'flux-pro-1.1',
      provider: 'flux',
      durationMs: Math.round(performance.now() - started),
    };
  }

  estimateCost(input: ImageGenerateInput): number {
    const { tier } = resolveFluxModel(input.quality);
    if (tier === 'max') return 5;
    if (tier === 'fast') return 3;
    return 4;
  }

  supportsFeature(feature: ImageFeature): boolean {
    return PROVIDER_FEATURES.flux.has(feature);
  }

  isAvailable(): boolean {
    const key = process.env.FLUX_API_KEY;
    return (
      typeof key === 'string' &&
      key.trim().length > 0 &&
      process.env.ENABLE_FLUX !== 'false'
    );
  }

  getProviderName(): ImageProviderName {
    return 'flux';
  }
}
