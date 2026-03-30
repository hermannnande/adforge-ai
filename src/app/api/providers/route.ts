import { NextResponse } from 'next/server';
import { imageRouter } from '@/server/ai/image';
import { PROVIDER_CREDIT_COSTS } from '@/lib/constants/credit-costs';
import { providerHealthService } from '@/server/ai/providers/image/provider-health.service';
import { ProviderName } from '@/lib/ai/enums';

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'Standard — Polyvalent',
  flux: 'Premium — Photoréaliste',
  ideogram: 'Créatif — Texte & Poster',
};

export async function GET() {
  const available = imageRouter.getAvailableProviders();

  const providers = available.map((name) => {
    const health = providerHealthService.getHealth(name as ProviderName);
    return {
      name,
      label: PROVIDER_LABELS[name] ?? name,
      costs: PROVIDER_CREDIT_COSTS[name] ?? {},
      health: {
        status: health.status,
        avgLatencyMs: health.avgLatencyMs,
      },
    };
  });

  return NextResponse.json(
    { providers, default: 'openai' },
    {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      },
    },
  );
}
