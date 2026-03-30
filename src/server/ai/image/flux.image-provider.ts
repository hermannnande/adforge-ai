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
  pro: 'flux-2-pro-preview',
  max: 'flux-pro-1.1-ultra',
} as const;

type FluxTier = keyof typeof FLUX_MODELS;

function resolveFluxModel(quality: string): { tier: FluxTier; model: string; endpoint: string } {
  switch (quality) {
    case 'draft':
      return { tier: 'fast', model: FLUX_MODELS.fast, endpoint: '/flux-pro-1.1' };
    case 'premium':
      return { tier: 'max', model: FLUX_MODELS.max, endpoint: '/flux-pro-1.1-ultra' };
    default:
      return { tier: 'pro', model: FLUX_MODELS.pro, endpoint: '/flux-2-pro-preview' };
  }
}

function getConfig() {
  const apiKey = process.env.FLUX_API_KEY ?? '';
  const baseUrl = process.env.FLUX_BASE_URL ?? 'https://api.bfl.ai/v1';
  return { apiKey, baseUrl };
}

async function rawFetch(
  url: string,
  apiKey: string,
  method: 'GET' | 'POST',
  body?: unknown,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    return await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-key': apiKey,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function submitGeneration(endpoint: string, payload: unknown): Promise<{ id: string; pollingUrl: string }> {
  const { apiKey, baseUrl } = getConfig();
  if (!apiKey) throw new Error('FLUX API key not configured');

  const url = `${baseUrl}${endpoint}`;
  console.log(`[FLUX] POST ${url}`);

  let res: Response;
  try {
    res = await rawFetch(url, apiKey, 'POST', payload);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`FLUX: submit timeout on ${endpoint}`);
    }
    throw new Error(`FLUX: cannot reach API — ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`FLUX API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as Record<string, unknown>;

  const id = typeof data.id === 'string' ? data.id : '';
  const pollingUrl = typeof data.polling_url === 'string' ? data.polling_url : '';

  if (!id) throw new Error('FLUX: no task ID in response');

  if (!pollingUrl) {
    const fallback = `${baseUrl}/get_result?id=${encodeURIComponent(id)}`;
    console.warn(`[FLUX] No polling_url returned, falling back to ${fallback}`);
    return { id, pollingUrl: fallback };
  }

  return { id, pollingUrl };
}

const TERMINAL_STATUSES = new Set([
  'Error', 'error', 'Failed', 'failed',
  'Request Moderated', 'Content Moderated',
  'Task not found', 'moderated',
]);

async function pollUntilReady(
  pollingUrl: string,
  taskId: string,
  maxWaitMs = 100_000,
  intervalMs = 1_500,
): Promise<Record<string, unknown>> {
  const { apiKey } = getConfig();
  const deadline = Date.now() + maxWaitMs;

  while (Date.now() < deadline) {
    let res: Response;
    try {
      res = await rawFetch(pollingUrl, apiKey, 'GET');
    } catch {
      await new Promise((r) => setTimeout(r, intervalMs));
      continue;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      if (res.status === 404) {
        await new Promise((r) => setTimeout(r, intervalMs));
        continue;
      }
      throw new Error(`FLUX poll error ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const status = typeof data.status === 'string' ? data.status : 'Unknown';

    if (status === 'Ready' || status === 'ready' || status === 'completed') {
      return data;
    }

    if (TERMINAL_STATUSES.has(status)) {
      throw new Error(`FLUX job ${taskId}: ${status}`);
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(`FLUX job ${taskId} timed out after ${maxWaitMs}ms`);
}

function extractImageUrl(data: Record<string, unknown>): string | null {
  const result = data.result as Record<string, unknown> | undefined;
  if (!result) return null;

  if (typeof result.sample === 'string' && result.sample) return result.sample;
  if (typeof result.url === 'string' && result.url) return result.url;
  if (typeof result.image === 'string' && result.image) return result.image;

  if (Array.isArray(result.images) && result.images.length > 0) {
    const first = result.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && typeof (first as Record<string, unknown>).url === 'string') {
      return (first as Record<string, unknown>).url as string;
    }
  }

  return null;
}

export class FluxImageProvider implements ImageProvider {
  readonly name: ImageProviderName = 'flux';

  async generateImage(input: ImageGenerateInput): Promise<ImageProviderResult> {
    const started = performance.now();
    const { model, endpoint } = resolveFluxModel(input.quality);

    const payload: Record<string, unknown> = {
      prompt: input.prompt,
      width: input.size.width || 1024,
      height: input.size.height || 1024,
    };

    if (endpoint.includes('ultra')) {
      payload.aspect_ratio = `${input.size.width || 1024}:${input.size.height || 1024}`;
      delete payload.width;
      delete payload.height;
    }

    const { id, pollingUrl } = await submitGeneration(endpoint, payload);
    const pollResult = await pollUntilReady(pollingUrl, id);

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

    const { id, pollingUrl } = await submitGeneration('/flux-pro-1.1/edit', payload);
    const pollResult = await pollUntilReady(pollingUrl, id);

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
