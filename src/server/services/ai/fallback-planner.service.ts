import { ProviderName } from '@/lib/ai/enums';
import type {
  NormalizedGenerationBrief,
  ProjectContext,
  RoutingDecision,
  QualityEvaluationResult,
  FallbackPlan,
} from '@/lib/ai/types';
import { providerHealthService } from '@/server/ai/providers/image/provider-health.service';
import { providerCapabilityRegistry } from '@/server/ai/providers/image/provider-capability.registry';

const FALLBACK_RULES: Array<{
  condition: (primary: ProviderName, brief: NormalizedGenerationBrief, quality: QualityEvaluationResult | null) => boolean;
    fallback: (primary: ProviderName) => ProviderName | null;
  reason: string;
}> = [
  {
    condition: (primary, brief) =>
      primary === ProviderName.FLUX && (brief.needPosterStyle || brief.needTypographyQuality),
    fallback: () => ProviderName.IDEOGRAM,
    reason: 'FLUX faible en typographie → basculement vers Ideogram',
  },
  {
    condition: (primary, brief) =>
      primary === ProviderName.IDEOGRAM && brief.needPhotorealism,
    fallback: () => ProviderName.FLUX,
    reason: 'Ideogram faible en photoréalisme → basculement vers FLUX',
  },
  {
    condition: (primary, _brief, quality) =>
      primary === ProviderName.OPENAI && !!quality && quality.realismScore < 4 && _brief.needPhotorealism,
    fallback: () => ProviderName.FLUX,
    reason: 'OpenAI: réalisme insuffisant → basculement vers FLUX',
  },
  {
    condition: (_primary, brief, quality) =>
      !!quality && quality.typographyScore < 4 && brief.needExactText,
    fallback: (_primary) => _primary === ProviderName.IDEOGRAM ? ProviderName.OPENAI : ProviderName.IDEOGRAM,
    reason: 'Typographie insuffisante → basculement vers spécialiste texte',
  },
];

export const fallbackPlanner = {
  planFallback(
    primaryDecision: RoutingDecision,
    brief: NormalizedGenerationBrief,
    _context: ProjectContext,
    quality: QualityEvaluationResult | null,
  ): FallbackPlan | null {
    for (const rule of FALLBACK_RULES) {
      if (rule.condition(primaryDecision.provider, brief, quality)) {
        const fallback = rule.fallback(primaryDecision.provider);
        if (fallback && providerHealthService.isAvailableForRouting(fallback)) {
          return {
            provider: fallback,
            reason: rule.reason,
            recompiledPrompt: true,
          };
        }
      }
    }

    const chain = primaryDecision.fallbackChain.filter((p) =>
      providerHealthService.isAvailableForRouting(p) &&
      providerCapabilityRegistry.supportsTask(p, brief.taskType),
    );

    if (chain.length > 0) {
      return {
        provider: chain[0],
        reason: `Provider ${primaryDecision.provider} indisponible ou qualité insuffisante`,
        recompiledPrompt: true,
      };
    }

    return null;
  },
};
