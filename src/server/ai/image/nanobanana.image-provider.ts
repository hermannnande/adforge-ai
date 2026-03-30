import { GoogleGenAI } from '@google/genai';
import type {
  ImageProvider,
  ImageGenerateInput,
  ImageEditInput,
  ImageProviderResult,
  ImageFeature,
  ImageProviderName,
} from './types';
import { PROVIDER_FEATURES } from './types';

const MODELS = [
  'gemini-2.5-flash-image',
] as const;

function getClient(): GoogleGenAI {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '';
  if (!key) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured');
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: { apiVersion: 'v1beta' },
  });
}

interface InlineDataPart {
  inlineData: { mimeType: string; data: string };
}

interface TextPart {
  text: string;
}

type ContentPart = InlineDataPart | TextPart;

function extractImage(responseParts: unknown[]): { base64: string; mimeType: string } | null {
  for (const part of responseParts) {
    const p = part as unknown as Record<string, unknown>;
    const inline = p.inlineData as { mimeType: string; data: string } | undefined;
    if (inline?.data) {
      return { base64: inline.data, mimeType: inline.mimeType || 'image/png' };
    }
  }
  return null;
}

function extractText(responseParts: unknown[]): string {
  return (responseParts as Array<Record<string, unknown>>)
    .filter((p) => typeof p.text === 'string')
    .map((p) => p.text as string)
    .join(' ')
    .trim();
}

async function toInlinePart(ref: string): Promise<InlineDataPart | null> {
  if (ref.startsWith('data:')) {
    const match = ref.match(/^data:(image\/[\w+]+);base64,(.+)$/);
    if (match) {
      return { inlineData: { mimeType: match[1], data: match[2] } };
    }
  } else if (ref.startsWith('http')) {
    try {
      const response = await fetch(ref);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';
        const base64 = Buffer.from(buffer).toString('base64');
        return { inlineData: { mimeType: contentType, data: base64 } };
      }
      console.warn(`[NanoBanana] Failed to fetch reference image: ${ref.slice(0, 80)} (${response.status})`);
    } catch (err) {
      console.warn(`[NanoBanana] Could not fetch reference image: ${ref.slice(0, 80)}`, err);
    }
  }
  return null;
}

/**
 * Build multi-image reference instruction that tells Gemini HOW to use the images.
 * Placed BEFORE the user prompt so the AI understands the context of the images
 * it just "saw" in the inline data parts.
 */
function buildMultiImageInstruction(imageCount: number): string {
  if (imageCount === 0) return '';

  if (imageCount === 1) {
    return (
      'I have attached 1 reference image above. ' +
      'You MUST use the EXACT content from this image in the final composition. ' +
      'If it shows a product, reproduce that EXACT product (same packaging, colors, label, shape). ' +
      'If it shows a person, reproduce that person faithfully. ' +
      'Do NOT replace or substitute it with a different product or person.\n\n'
    );
  }

  return (
    `I have attached ${imageCount} reference images above. ` +
    'You MUST use the EXACT content from ALL of these images in the final composition. ' +
    'Each image is a reference element that must be faithfully reproduced:\n' +
    '- If an image shows a product: reproduce that EXACT product (same packaging, colors, label, shape, branding)\n' +
    '- If an image shows a person: reproduce that person faithfully (appearance, style, pose)\n' +
    '- If an image shows a logo or brand element: reproduce it exactly\n' +
    '- If an image shows a style/mood reference: follow that visual direction\n' +
    'Do NOT replace any image element with something different. ' +
    'ALL reference images must be visible and combined coherently in the final result.\n\n'
  );
}

export class NanoBananaImageProvider implements ImageProvider {
  readonly name: ImageProviderName = 'nanobanana';

  async generateImage(input: ImageGenerateInput): Promise<ImageProviderResult> {
    const started = performance.now();
    const client = getClient();

    const parts: ContentPart[] = [];
    let attachedCount = 0;

    if (input.referenceImages && input.referenceImages.length > 0) {
      const inlinePromises = input.referenceImages.map(toInlinePart);
      const inlineResults = await Promise.all(inlinePromises);

      for (const inlinePart of inlineResults) {
        if (inlinePart) {
          parts.push(inlinePart);
          attachedCount++;
        }
      }
      console.log(`[NanoBanana] Attached ${attachedCount}/${input.referenceImages.length} reference images`);
    }

    const multiImageInstruction = buildMultiImageInstruction(attachedCount);
    const finalPrompt = multiImageInstruction + input.prompt;

    parts.push({ text: finalPrompt });

    console.log(`[NanoBanana] FINAL prompt sent to API (first 300 chars): "${finalPrompt.slice(0, 300)}"`);
    console.log(`[NanoBanana] FINAL parts count: ${parts.length} (${attachedCount} images + 1 text)`);

    let lastError: Error | null = null;

    for (const modelId of MODELS) {
      console.log(`[NanoBanana] Trying model=${modelId}, ${parts.length} parts (${attachedCount} ref images)`);

      try {
        const response = await client.models.generateContent({
          model: modelId,
          contents: [{ role: 'user', parts }],
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        const responseParts = response.candidates?.[0]?.content?.parts ?? [];
        const image = extractImage(responseParts);

        if (image) {
          const dataUrl = `data:${image.mimeType};base64,${image.base64}`;
          console.log(`[NanoBanana] Image generated with ${modelId} in ${Math.round(performance.now() - started)}ms`);

          return {
            images: [
              {
                url: dataUrl,
                base64: image.base64,
                width: input.size.width || 1024,
                height: input.size.height || 1024,
              },
            ],
            model: modelId,
            provider: 'nanobanana',
            durationMs: Math.round(performance.now() - started),
          };
        }

        const textContent = extractText(responseParts);
        if (/sorry|cannot|can't|unable|refuse|inappropriate|safety/i.test(textContent)) {
          console.warn(`[NanoBanana] Safety filter with ${modelId}: ${textContent.slice(0, 200)}`);
          throw new Error(
            'Le contenu de votre demande a été filtré par le système de sécurité. Essayez de reformuler votre requête.',
          );
        }

        console.warn(`[NanoBanana] No image from ${modelId}. Text: ${textContent.slice(0, 200)}`);
        lastError = new Error(`No image from ${modelId}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);

        if (/safety|filtré|reformuler/i.test(msg)) {
          throw err;
        }

        console.error(`[NanoBanana] Model ${modelId} failed: ${msg.slice(0, 300)}`);
        lastError = err instanceof Error ? err : new Error(msg);
      }
    }

    throw lastError ?? new Error('NanoBanana: all models failed');
  }

  async editImage(input: ImageEditInput): Promise<ImageProviderResult> {
    const started = performance.now();
    const client = getClient();

    const parts: ContentPart[] = [];

    if (input.imageUrl.startsWith('data:')) {
      const match = input.imageUrl.match(/^data:(image\/[\w+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
      }
    }

    parts.push({ text: `Edit this image: ${input.prompt}` });

    const response = await client.models.generateContent({
      model: MODELS[0],
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const responseParts = response.candidates?.[0]?.content?.parts ?? [];
    const image = extractImage(responseParts);

    if (!image) {
      const textContent = extractText(responseParts);
      if (/sorry|cannot|can't|unable|refuse|inappropriate|safety/i.test(textContent)) {
        throw new Error(
          'Le contenu de votre demande a été filtré par le système de sécurité. Essayez de reformuler votre requête.',
        );
      }
      throw new Error('NanoBanana edit: no image in response');
    }

    return {
      images: [
        {
          url: `data:${image.mimeType};base64,${image.base64}`,
          base64: image.base64,
          width: input.size?.width ?? 1024,
          height: input.size?.height ?? 1024,
        },
      ],
      model: MODELS[0],
      provider: 'nanobanana',
      durationMs: Math.round(performance.now() - started),
    };
  }

  estimateCost(_input: ImageGenerateInput): number {
    return 1;
  }

  supportsFeature(feature: ImageFeature): boolean {
    return PROVIDER_FEATURES.nanobanana.has(feature);
  }

  isAvailable(): boolean {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    return typeof key === 'string' && key.trim().length > 0;
  }

  getProviderName(): ImageProviderName {
    return 'nanobanana';
  }
}
