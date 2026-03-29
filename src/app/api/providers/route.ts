import { NextResponse } from 'next/server';
import { imageRouter } from '@/server/ai/image';
import { PROVIDER_CREDIT_COSTS } from '@/lib/constants/credit-costs';

export async function GET() {
  const available = imageRouter.getAvailableProviders();

  const providers = available.map((name) => ({
    name,
    costs: PROVIDER_CREDIT_COSTS[name] ?? {},
    label:
      name === 'openai'
        ? 'OpenAI — Polyvalent'
        : name === 'flux'
          ? 'FLUX — Photoréaliste premium'
          : name === 'ideogram'
            ? 'Ideogram — Texte intégré / Poster'
            : name,
  }));

  return NextResponse.json(
    { providers, default: 'openai' },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      },
    },
  );
}
