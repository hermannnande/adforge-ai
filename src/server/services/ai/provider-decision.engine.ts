import { ProviderName } from '@/lib/ai/enums';
import type {
  NormalizedGenerationBrief,
  ProjectContext,
  RoutingDecision,
  ProviderScore,
} from '@/lib/ai/types';
import {
  computeCapabilityFit,
  computeHealthScore,
  computeContextFit,
  computeLatencyScore,
} from '@/lib/ai/scoring';
import { getProviderCreditCost } from '@/lib/constants/credit-costs';
import { providerCapabilityRegistry } from '@/server/ai/providers/image/provider-capability.registry';
import { providerHealthService } from '@/server/ai/providers/image/provider-health.service';

function costPenalty(provider: ProviderName, quality: string): number {
  const cost = getProviderCreditCost(provider, quality.toLowerCase());
  if (cost <= 2) return 0;
  if (cost <= 4) return 1;
  return 2;
}

function riskPenalty(provider: ProviderName, brief: NormalizedGenerationBrief): number {
  let penalty = 0;

  const cap = providerCapabilityRegistry.getCapabilities(provider);

  if (brief.needExactText && cap.supportsExactTextReliability === 'low') penalty += 3;
  if (brief.needPhotorealism && cap.photorealismScore < 7) penalty += 2;
  if (brief.needPosterStyle && cap.posterScore < 7) penalty += 2;
  if (brief.needTypographyQuality && cap.typographyScore < 7) penalty += 2;
  if (brief.referenceAssetCount >= 2 && cap.multiReferenceScore < 7) penalty += 2;

  if (!cap.supportsNegativePrompt && brief.negativeConstraintsRaw.length > 0) {
    penalty += 0.5;
  }

  return penalty;
}

function buildReasons(
  provider: ProviderName,
  brief: NormalizedGenerationBrief,
  score: ProviderScore,
): string[] {
  const reasons: string[] = [];

  if (score.capabilityFit >= 10) reasons.push(`Excellent match pour ${brief.taskType}`);
  else if (score.capabilityFit >= 7) reasons.push(`Bon match pour ${brief.taskType}`);

  if (brief.needPhotorealism && provider === ProviderName.NANOBANANA)
    reasons.push('Moteur photoréaliste Google de haute qualité');
  if (brief.needPhotorealism && provider === ProviderName.FLUX)
    reasons.push('Moteur photoréaliste');
  if (brief.needPosterStyle && provider === ProviderName.NANOBANANA)
    reasons.push('Excellent rendu texte et poster');
  if (brief.needPosterStyle && provider === ProviderName.IDEOGRAM)
    reasons.push('Spécialiste typographie et poster');
  if (brief.needExactText && provider === ProviderName.NANOBANANA)
    reasons.push('Très bonne fiabilité texte exact');
  if (brief.needExactText && provider === ProviderName.IDEOGRAM)
    reasons.push('Fiabilité texte exact');
  if (brief.referenceAssetCount >= 2 && provider === ProviderName.NANOBANANA)
    reasons.push('Support multi-référence natif (14 images max)');
  if (brief.referenceAssetCount >= 2 && provider === ProviderName.FLUX)
    reasons.push('Cohérence multi-référence');

  if (score.healthScore < 5) reasons.push('Santé dégradée');
  if (score.contextFit >= 7) reasons.push('Historique positif sur ce projet');
  if (score.costPenalty >= 2) reasons.push('Coût élevé');

  return reasons.length > 0 ? reasons : ['Sélection automatique optimale'];
}

export const providerDecisionEngine = {
  scoreProvider(
    provider: ProviderName,
    brief: NormalizedGenerationBrief,
    context: ProjectContext,
  ): ProviderScore {
    const capability = providerCapabilityRegistry.getCapabilities(provider);
    const health = providerHealthService.getHealth(provider);

    const capabilityFit = computeCapabilityFit(capability, brief);
    const healthScore = computeHealthScore(health);
    const contextFit = computeContextFit(provider, context.consistencyHints);
    const historicalSuccess = context.consistencyHints?.bestProvider === provider ? 7 : 5;
    const latencyScore = computeLatencyScore(health);
    const cost = costPenalty(provider, brief.qualityMode);
    const risk = riskPenalty(provider, brief);

    const total =
      capabilityFit * 3 +
      healthScore * 2 +
      contextFit * 1.5 +
      historicalSuccess * 1 +
      latencyScore * 0.5 -
      cost * 2 -
      risk * 2;

    return {
      provider,
      capabilityFit,
      healthScore,
      contextFit,
      historicalSuccess,
      latencyScore,
      costPenalty: cost,
      riskPenalty: risk,
      total: Math.round(total * 100) / 100,
    };
  },

  decideProvider(
    brief: NormalizedGenerationBrief,
    context: ProjectContext,
    userOverride?: ProviderName,
  ): RoutingDecision {
    if (userOverride) {
      const health = providerHealthService.getHealth(userOverride);
      if (providerHealthService.isAvailableForRouting(userOverride)) {
        const score = this.scoreProvider(userOverride, brief, context);
        const fallbackChain = this.buildFallbackChain(userOverride, brief, context);
        return {
          provider: userOverride,
          taskType: brief.taskType,
          scores: [score],
          reason: ['Sélection manuelle par l\'utilisateur'],
          fallbackChain,
          estimatedCost: getProviderCreditCost(userOverride, brief.qualityMode.toLowerCase()),
        };
      }
      console.warn(`[DecisionEngine] User override ${userOverride} unavailable (${health.status})`);
    }

    const candidates = providerCapabilityRegistry
      .listAvailableProviders()
      .filter((p) => providerHealthService.isAvailableForRouting(p))
      .filter((p) => providerCapabilityRegistry.supportsTask(p, brief.taskType));

    if (candidates.length === 0) {
      throw new Error('Aucun moteur de génération disponible actuellement');
    }

    const scored = candidates
      .map((p) => this.scoreProvider(p, brief, context))
      .sort((a, b) => b.total - a.total);

    const best = scored[0];
    const reasons = buildReasons(best.provider, brief, best);
    const fallbackChain = this.buildFallbackChain(best.provider, brief, context);

    return {
      provider: best.provider,
      taskType: brief.taskType,
      scores: scored,
      reason: reasons,
      fallbackChain,
      estimatedCost: getProviderCreditCost(best.provider, brief.qualityMode.toLowerCase()),
    };
  },

  buildFallbackChain(
    primary: ProviderName,
    brief: NormalizedGenerationBrief,
    context: ProjectContext,
  ): ProviderName[] {
    const others = providerCapabilityRegistry
      .listAvailableProviders()
      .filter((p) => p !== primary)
      .filter((p) => providerHealthService.isAvailableForRouting(p))
      .filter((p) => providerCapabilityRegistry.supportsTask(p, brief.taskType));

    return others
      .map((p) => ({ provider: p, score: this.scoreProvider(p, brief, context).total }))
      .sort((a, b) => b.score - a.score)
      .map((s) => s.provider);
  },

  explainDecision(decision: RoutingDecision): string[] {
    const lines: string[] = [];
    lines.push(`Provider choisi: ${decision.provider}`);
    lines.push(`Type de tâche: ${decision.taskType}`);
    lines.push(`Raisons: ${decision.reason.join(' | ')}`);
    lines.push(`Coût estimé: ${decision.estimatedCost} crédits`);
    lines.push(`Fallback: ${decision.fallbackChain.join(' → ') || 'aucun'}`);

    if (decision.scores.length > 1) {
      lines.push('--- Scores ---');
      for (const s of decision.scores) {
        lines.push(
          `  ${s.provider}: total=${s.total} (cap=${s.capabilityFit} health=${s.healthScore} ctx=${s.contextFit} hist=${s.historicalSuccess} lat=${s.latencyScore} -cost=${s.costPenalty} -risk=${s.riskPenalty})`,
        );
      }
    }

    return lines;
  },
};
