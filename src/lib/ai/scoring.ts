import type { ProviderName } from './enums';
import { GenerationTaskType } from './enums';
import type { ProviderCapabilityProfile, NormalizedGenerationBrief, ProviderHealthSnapshot, ConsistencyProfile } from './types';

const TASK_WEIGHTS: Record<GenerationTaskType, Record<string, number>> = {
  [GenerationTaskType.GENERAL_AD_VISUAL]: { generalistScore: 3, photorealismScore: 1, typographyScore: 1, posterScore: 1 },
  [GenerationTaskType.PHOTOREALISTIC_AD]: { generalistScore: 1, photorealismScore: 4, typographyScore: 0, posterScore: 0 },
  [GenerationTaskType.PRODUCT_SHOT]: { generalistScore: 1, photorealismScore: 3, typographyScore: 0, posterScore: 0 },
  [GenerationTaskType.LIFESTYLE_SCENE]: { generalistScore: 1, photorealismScore: 3, typographyScore: 0, posterScore: 0 },
  [GenerationTaskType.POSTER_TEXT_HEAVY]: { generalistScore: 0, photorealismScore: 0, typographyScore: 4, posterScore: 3 },
  [GenerationTaskType.LOGO_LIKE_TEXT_VISUAL]: { generalistScore: 0, photorealismScore: 0, typographyScore: 4, posterScore: 2 },
  [GenerationTaskType.SOCIAL_AD_SQUARE]: { generalistScore: 2, photorealismScore: 1, typographyScore: 1, posterScore: 1 },
  [GenerationTaskType.STORY_VERTICAL]: { generalistScore: 2, photorealismScore: 1, typographyScore: 1, posterScore: 1 },
  [GenerationTaskType.IMAGE_EDIT]: { generalistScore: 1, photorealismScore: 1, typographyScore: 0, posterScore: 0 },
  [GenerationTaskType.BACKGROUND_REPLACE]: { generalistScore: 1, photorealismScore: 1, typographyScore: 0, posterScore: 0 },
  [GenerationTaskType.MULTI_REFERENCE_EDIT]: { generalistScore: 1, photorealismScore: 2, typographyScore: 0, posterScore: 0 },
  [GenerationTaskType.PREMIUM_RENDER]: { generalistScore: 1, photorealismScore: 3, typographyScore: 1, posterScore: 1 },
  [GenerationTaskType.QUICK_DRAFT]: { generalistScore: 3, photorealismScore: 0, typographyScore: 0, posterScore: 0 },
};

export function computeCapabilityFit(
  capability: ProviderCapabilityProfile,
  brief: NormalizedGenerationBrief,
): number {
  const weights = TASK_WEIGHTS[brief.taskType] ?? TASK_WEIGHTS[GenerationTaskType.GENERAL_AD_VISUAL];
  let score = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const capValue = capability[key as keyof ProviderCapabilityProfile];
    if (typeof capValue === 'number' && weight > 0) {
      score += capValue * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 5;
  let normalized = score / totalWeight;

  if (brief.needPhotorealism && capability.photorealismScore >= 9) normalized += 2;
  if (brief.needVisibleText && capability.typographyScore >= 9) normalized += 2;
  if (brief.needPosterStyle && capability.posterScore >= 9) normalized += 2;
  if (brief.referenceAssetCount >= 2 && capability.multiReferenceScore >= 8) normalized += 1.5;
  if (brief.needExactText && capability.supportsExactTextReliability === 'high') normalized += 1;

  return Math.min(normalized, 15);
}

export function computeHealthScore(health: ProviderHealthSnapshot): number {
  switch (health.status) {
    case 'HEALTHY': return 10;
    case 'RECOVERING': return 6;
    case 'DEGRADED': return 3;
    case 'UNAVAILABLE': return 0;
    case 'CIRCUIT_OPEN': return 0;
    default: return 5;
  }
}

export function computeContextFit(
  provider: ProviderName,
  consistency: ConsistencyProfile | null,
): number {
  if (!consistency || consistency.generationCount < 2) return 5;
  if (consistency.bestProvider === provider) return 8;
  return 5;
}

export function computeLatencyScore(health: ProviderHealthSnapshot): number {
  if (health.avgLatencyMs === 0) return 7;
  if (health.avgLatencyMs < 5000) return 9;
  if (health.avgLatencyMs < 15000) return 7;
  if (health.avgLatencyMs < 30000) return 5;
  return 3;
}
