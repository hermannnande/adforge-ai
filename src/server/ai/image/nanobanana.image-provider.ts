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

const IMAGE_MODEL = 'gemini-2.5-flash-image';

function getClient(): GoogleGenAI {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '';
  if (!key) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not configured');
  return new GoogleGenAI({ apiKey: key });
}

interface InlineDataPart {
  inlineData: { mimeType: string; data: string };
}

interface TextPart {
  text: string;
}

type ContentPart = InlineDataPart | TextPart;

export class NanoBananaImageProvider implements ImageProvider {
  readonly name: ImageProviderName = 'nanobanana';

  async generateImage(input: ImageGenerateInput): Promise<ImageProviderResult> {
    const started = performance.now();
    const client = getClient();

    const parts: ContentPart[] = [];

    if (input.referenceImages && input.referenceImages.length > 0) {
      for (const ref of input.referenceImages) {
        if (ref.startsWith('data:')) {
          const match = ref.match(/^data:(image\/[\w+]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: { mimeType: match[1], data: match[2] },
            });
          }
        }
      }
    }

    parts.push({ text: input.prompt });

    console.log(`[NanoBanana] Generating with model=${IMAGE_MODEL}, ${parts.length} parts (${parts.length - 1} ref images)`);

    const response = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const responseParts = response.candidates?.[0]?.content?.parts ?? [];

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
      const textParts = responseParts.filter(
        (p) => (p as unknown as Record<string, unknown>).text,
      );
      const textContent = textParts
        .map((p) => (p as unknown as { text: string }).text)
        .join(' ');
      console.error(`[NanoBanana] No image data. Text response: ${textContent.slice(0, 300)}`);
      throw new Error(`NanoBanana: no image generated. ${textContent.slice(0, 200)}`);
    }

    const dataUrl = `data:${imageMimeType};base64,${imageBase64}`;

    console.log(`[NanoBanana] Image generated in ${Math.round(performance.now() - started)}ms`);

    return {
      images: [
        {
          url: dataUrl,
          base64: imageBase64,
          width: input.size.width || 1024,
          height: input.size.height || 1024,
        },
      ],
      model: IMAGE_MODEL,
      provider: 'nanobanana',
      durationMs: Math.round(performance.now() - started),
    };
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
      model: IMAGE_MODEL,
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const responseParts = response.candidates?.[0]?.content?.parts ?? [];
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
      model: IMAGE_MODEL,
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
