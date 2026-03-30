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

  const results: Record<string, unknown> = {
    keyPresent: true,
    keyLength: key.length,
    keyPrefix: key.substring(0, 6) + '...',
  };

  // Test 1: Imagen via generateImages (separate quota)
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const r = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: 'A simple red circle on white background',
      config: { numberOfImages: 1 },
    });
    const img = r.generatedImages?.[0] as unknown as Record<string, Record<string, unknown>> | undefined;
    const imgData = img?.image?.data as string | undefined;
    results['imagen-3.0-generate-002'] = {
      status: 'success',
      hasImage: !!imgData,
      dataLength: imgData?.length ?? 0,
      mimeType: img?.image?.mimeType,
    };
  } catch (e) {
    const err = e as Error & { status?: number };
    results['imagen-3.0-generate-002'] = {
      status: 'error',
      message: err.message?.substring(0, 500),
      errorStatus: err.status,
    };
  }

  // Test 2: gemini-2.5-flash-image via v1beta
  try {
    const ai = new GoogleGenAI({ apiKey: key, httpOptions: { apiVersion: 'v1beta' } });
    const r = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ text: 'Generate a simple red circle on white background' }] }],
      config: { responseModalities: ['TEXT', 'IMAGE'] },
    });
    const parts = r.candidates?.[0]?.content?.parts ?? [];
    const hasImage = parts.some((p) => (p as unknown as Record<string, unknown>).inlineData);
    results['gemini-2.5-flash-image-v1beta'] = { status: 'success', hasImage, partsCount: parts.length };
  } catch (e) {
    const err = e as Error & { status?: number };
    results['gemini-2.5-flash-image-v1beta'] = {
      status: 'error',
      message: err.message?.substring(0, 500),
      errorStatus: err.status,
    };
  }

  // Test 3: gemini-2.5-flash-image via v1
  try {
    const ai = new GoogleGenAI({ apiKey: key, httpOptions: { apiVersion: 'v1' } });
    const r = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ text: 'Generate a simple red circle on white background' }] }],
      config: { responseModalities: ['TEXT', 'IMAGE'] },
    });
    const parts = r.candidates?.[0]?.content?.parts ?? [];
    const hasImage = parts.some((p) => (p as unknown as Record<string, unknown>).inlineData);
    results['gemini-2.5-flash-image-v1'] = { status: 'success', hasImage, partsCount: parts.length };
  } catch (e) {
    const err = e as Error & { status?: number };
    results['gemini-2.5-flash-image-v1'] = {
      status: 'error',
      message: err.message?.substring(0, 500),
      errorStatus: err.status,
    };
  }

  // Test 4: Imagen 4
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const r = await ai.models.generateImages({
      model: 'imagen-4.0-generate-preview-05-20',
      prompt: 'A simple red circle on white background',
      config: { numberOfImages: 1 },
    });
    const img4 = r.generatedImages?.[0] as unknown as Record<string, Record<string, unknown>> | undefined;
    const img4Data = img4?.image?.data as string | undefined;
    results['imagen-4.0'] = {
      status: 'success',
      hasImage: !!img4Data,
      dataLength: img4Data?.length ?? 0,
    };
  } catch (e) {
    const err = e as Error & { status?: number };
    results['imagen-4.0'] = {
      status: 'error',
      message: err.message?.substring(0, 500),
      errorStatus: err.status,
    };
  }

  return NextResponse.json(results);
}
