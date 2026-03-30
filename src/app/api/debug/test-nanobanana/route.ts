import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function GET() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!key) {
    return NextResponse.json({
      status: 'error',
      message: 'GOOGLE_GENERATIVE_AI_API_KEY not set',
      keyPresent: false,
    });
  }

  const ai = new GoogleGenAI({
    apiKey: key,
    httpOptions: { apiVersion: 'v1beta' },
  });

  const models = [
    'gemini-2.5-flash-image',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
  ];

  const results: Record<string, unknown> = {
    keyPresent: true,
    keyLength: key.length,
    keyPrefix: key.substring(0, 6) + '...',
  };

  for (const model of models) {
    try {
      const r = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Generate a simple red circle on a white background' }],
          },
        ],
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      });

      const parts = r.candidates?.[0]?.content?.parts ?? [];
      const hasImage = parts.some(
        (p) => (p as unknown as Record<string, unknown>).inlineData,
      );
      const textParts = parts
        .filter((p) => (p as unknown as { text?: string }).text)
        .map((p) => (p as unknown as { text: string }).text.substring(0, 200));

      results[model] = {
        status: 'success',
        hasImage,
        candidateCount: r.candidates?.length ?? 0,
        partsCount: parts.length,
        textResponse: textParts,
      };
    } catch (e) {
      const err = e as Error & { status?: number; statusText?: string };
      results[model] = {
        status: 'error',
        message: err.message?.substring(0, 500),
        errorStatus: err.status,
        errorStatusText: err.statusText,
      };
    }
  }

  return NextResponse.json(results);
}
