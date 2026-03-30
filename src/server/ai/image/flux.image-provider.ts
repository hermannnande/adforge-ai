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

interface FluxSubmitRaw {
  id?: string;
  polling_url?: string;
}

interface FluxPollRaw {
  id?: string;
  status?: string;
  result?: Record<string, unknown>;
}

function extractSubmitId(raw: unknown): string {
  if (raw && typeof raw === 'object') {
    const o = raw as FluxSubmitRaw;
    if (typeof o.id === 'string' && o.id) return o.id;
  }
  throw new Error('FLUX: no task ID returned');
}

function extractImageUrl(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as FluxPollRaw;
  const result = o.result;
  if (!result) return null;

  if (typeof result.sample === 'string' && result.sample) return result.sample;
  if (typeof result.url === 'string' && result.url) return result.url;
  if (typeof result.image === 'string' && result.image) return result.image;
  if (typeof result.output === 'string' && result.output) return result.output;

  if (Array.isArray(result.images) && result.images.length > 0) {
    const first = result.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && typeof (first as Record<string, unknown>).url === 'string') {
      return (first as Record<string, unknown>).url as string;
    }
  }

  return null;
}

function extractPollStatus(raw: unknown): string {
  if (raw && typeof raw === 'object') {
    const s = (raw as FluxPollRaw).status;
    if (typeof s === 'string') return s;
  }
  return 'Unknown';
}

const TERMINAL_STATUSES = new Set([
  'Error',
  'Request Moderated',
  'Content Moderated',
  'Task not found',
  'error',
  'failed',
  'moderated',
]);

async function pollUntilReady(
  taskId: string,
  maxWaitMs = 120_000,
  intervalMs = 2_000,
): Promise<unknown> {
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    const res = await fluxFetch(
      `/get_result?id=${encodeURIComponent(taskId)}`,
    );

    const status = extractPollStatus(res);

    if (status === 'Ready' || status === 'ready' || status === 'completed') {
      return res;
    }

    if (TERMINAL_STATUSES.has(status)) {
      throw new Error(`FLUX job ${taskId} failed: ${status}`);
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
      tier === 'max' ? '/flux-pro-1.1-ultra' : '/flux-pro-1.1';

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

    const submitRaw = await fluxFetch(endpoint, payload);
    const taskId = extractSubmitId(submitRaw);

    const pollResult = await pollUntilReady(taskId);

    const imageUrl = extractImageUrl(pollResult);
    if (!imageUrl) {
      throw new Error('FLUX: no image URL in result');
    }

    return {
      images: [
        {
          url: imageUrl,
          width: input.size.width || 1024,
          height: input.size.height || 1024,
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

    const submitRaw = await fluxFetch('/flux-pro-1.1/edit', payload);
    const taskId = extractSubmitId(submitRaw);

    const pollResult = await pollUntilReady(taskId);
    const imageUrl = extractImageUrl(pollResult);
    if (!imageUrl) {
      throw new Error('FLUX edit: no image URL in result');
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
