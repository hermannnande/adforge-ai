import Replicate from 'replicate';

import type {
  AiProvider,
  ImageGenerationParams,
  ImageGenerationResult,
  TextGenerationParams,
  TextGenerationResult,
} from './types';

type ReplicateModelId = `${string}/${string}` | `${string}/${string}:${string}`;

const MODEL_DRAFT = 'black-forest-labs/flux-schnell' as const satisfies ReplicateModelId;
const MODEL_STANDARD = 'black-forest-labs/flux-1.1-pro' as const satisfies ReplicateModelId;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isReadableStreamLike(
  value: unknown,
): value is ReadableStream<Uint8Array> {
  if (!isRecord(value)) return false;
  const gr = value.getReader;
  return typeof gr === 'function';
}

async function readableStreamToBase64(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const total = chunks.reduce((acc, c) => acc + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }

  return Buffer.from(merged).toString('base64');
}

function isHttpUrlString(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}

async function normalizeRunOutputToImages(
  output: unknown,
  width: number,
  height: number,
): Promise<ImageGenerationResult['images']> {
  if (output == null) {
    throw new Error('Replicate returned empty output');
  }

  if (typeof output === 'string') {
    if (isHttpUrlString(output)) {
      return [{ url: output, width, height }];
    }
    throw new Error('Replicate returned a non-URL string; expected image URL');
  }

  if (isReadableStreamLike(output)) {
    const base64 = await readableStreamToBase64(output);
    return [
      {
        url: `data:image/png;base64,${base64}`,
        base64,
        width,
        height,
      },
    ];
  }

  if (Array.isArray(output)) {
    const results: ImageGenerationResult['images'] = [];
    for (const el of output) {
      const nested = await normalizeRunOutputToImages(el, width, height);
      results.push(...nested);
    }
    return results;
  }

  if (isRecord(output)) {
    const urlVal = output.url;
    if (typeof urlVal === 'string' && isHttpUrlString(urlVal)) {
      return [{ url: urlVal, width, height }];
    }
  }

  throw new Error(
    'Unsupported Replicate output shape; expected URL string, URL array, or ReadableStream',
  );
}

function resolveModel(params: ImageGenerationParams): ReplicateModelId {
  const custom = params.model?.trim();
  if (custom) {
    if (!custom.includes('/')) {
      throw new Error(
        `Invalid Replicate model id "${custom}"; expected "owner/name" or "owner/name:version"`,
      );
    }
    return custom as ReplicateModelId;
  }
  return params.quality === 'draft' ? MODEL_DRAFT : MODEL_STANDARD;
}

function replicateErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class ReplicateProvider implements AiProvider {
  readonly name = 'replicate';

  private _replicate: Replicate | null = null;
  private readonly apiToken?: string;

  constructor(apiToken?: string) {
    this.apiToken = apiToken;
  }

  private get replicate(): Replicate {
    if (!this._replicate) {
      const token = this.apiToken ?? process.env.REPLICATE_API_TOKEN;
      if (!token) throw new Error('REPLICATE_API_TOKEN is not set');
      this._replicate = new Replicate({ auth: token });
    }
    return this._replicate;
  }

  isAvailable(): boolean {
    const token = process.env.REPLICATE_API_TOKEN;
    return typeof token === 'string' && token.trim().length > 0;
  }

  async generateText(_params: TextGenerationParams): Promise<TextGenerationResult> {
    throw new Error('Replicate does not support text generation');
  }

  async generateImage(
    params: ImageGenerationParams,
  ): Promise<ImageGenerationResult> {
    const started = performance.now();
    const model = resolveModel(params);
    const width = Math.max(64, Math.round(params.size.width));
    const height = Math.max(64, Math.round(params.size.height));
    const numOutputs = Math.min(
      4,
      Math.max(1, params.numberOfImages ?? 1),
    );

    let prompt = params.prompt;
    if (params.negativePrompt?.trim()) {
      prompt = `${prompt}\n\nNegative prompt: ${params.negativePrompt.trim()}`;
    }
    if (params.style?.trim()) {
      prompt = `${prompt}\n\nStyle: ${params.style.trim()}`;
    }

    const input: Record<string, string | number> = {
      prompt,
      width,
      height,
      num_outputs: numOutputs,
    };

    try {
      const output = await this.replicate.run(model, { input });
      const images = await normalizeRunOutputToImages(
        output,
        width,
        height,
      );

      if (images.length === 0) {
        throw new Error('Replicate returned no images');
      }

      return {
        images,
        model,
        provider: this.name,
        durationMs: Math.round(performance.now() - started),
      };
    } catch (err) {
      throw new Error(
        `Replicate image generation failed: ${replicateErrorMessage(err)}`,
      );
    }
  }
}
