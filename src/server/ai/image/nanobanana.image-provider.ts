import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  ImageProvider,
  ImageGenerateInput,
  ImageEditInput,
  ImageProviderResult,
  ImageFeature,
  ImageProviderName,
} from './types';
import { PROVIDER_FEATURES } from './types';

function getClient(): GoogleGenerativeAI {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '';
  if (!key) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured');
  return new GoogleGenerativeAI(key);
}

export class NanoBananaImageProvider implements ImageProvider {
  readonly name: ImageProviderName = 'nanobanana';

  async generateImage(input: ImageGenerateInput): Promise<ImageProviderResult> {
    const started = performance.now();
    const client = getClient();

    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (input.referenceImages && input.referenceImages.length > 0) {
      for (const ref of input.referenceImages) {
        if (ref.startsWith('data:')) {
          const match = ref.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: { mimeType: match[1], data: match[2] },
            });
          }
        }
      }
    }

    parts.push({ text: input.prompt });

    console.log(`[NanoBanana] Generating with ${parts.length} parts (${parts.length - 1} images)`);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as Record<string, unknown>,
    });

    const response = result.response;
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('NanoBanana: no candidates in response');
    }

    const responseParts = candidates[0].content?.parts ?? [];

    let imageBase64: string | null = null;
    let imageMimeType = 'image/png';

    for (const part of responseParts) {
      const p = part as unknown as Record<string, unknown>;
      const inline = p.inlineData as { mimeType: string; data: string } | undefined;
      if (inline?.data) {
        imageBase64 = inline.data;
        imageMimeType = inline.mimeType || 'image/png';
        break;
      }
    }

    if (!imageBase64) {
      throw new Error('NanoBanana: no image data in response');
    }

    const dataUrl = `data:${imageMimeType};base64,${imageBase64}`;

    return {
      images: [
        {
          url: dataUrl,
          base64: imageBase64,
          width: input.size.width || 1024,
          height: input.size.height || 1024,
        },
      ],
      model: 'gemini-2.0-flash-exp',
      provider: 'nanobanana',
      durationMs: Math.round(performance.now() - started),
    };
  }

  async editImage(input: ImageEditInput): Promise<ImageProviderResult> {
    const started = performance.now();
    const client = getClient();

    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (input.imageUrl.startsWith('data:')) {
      const match = input.imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
      }
    }

    parts.push({ text: `Edit this image: ${input.prompt}` });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as Record<string, unknown>,
    });

    const responseParts = result.response.candidates?.[0]?.content?.parts ?? [];
    let imageBase64: string | null = null;
    let imageMimeType = 'image/png';

    for (const part of responseParts) {
      const p = part as unknown as Record<string, unknown>;
      const inline = p.inlineData as { mimeType: string; data: string } | undefined;
      if (inline?.data) {
        imageBase64 = inline.data;
        imageMimeType = inline.mimeType || 'image/png';
        break;
      }
    }

    if (!imageBase64) {
      throw new Error('NanoBanana edit: no image in response');
    }

    return {
      images: [
        {
          url: `data:${imageMimeType};base64,${imageBase64}`,
          base64: imageBase64,
          width: input.size?.width ?? 1024,
          height: input.size?.height ?? 1024,
        },
      ],
      model: 'gemini-2.0-flash-exp',
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
