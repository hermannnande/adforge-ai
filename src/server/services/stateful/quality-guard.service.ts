import type { CanonicalBrief } from './canonical-brief-builder.service';

export interface QualityEvaluation {
  productFaithfulnessScore: number;
  compositionScore: number;
  sharpnessEstimate: number;
  finalRenderQualityScore: number;
  issues: string[];
  passesThreshold: boolean;
}

export const qualityGuardService = {
  evaluate(
    brief: CanonicalBrief,
    generatedImageWidth: number,
    generatedImageHeight: number,
    providerUsed: string,
  ): QualityEvaluation {
    const issues: string[] = [];
    let productScore = 8;
    let compositionScore = 7;
    let sharpnessEstimate = 7;

    if (brief.product.hasImportedReference) {
      if (providerUsed === 'flux') {
        productScore = 7;
      } else {
        productScore = 4;
        issues.push('OpenAI ne reçoit pas l\'image de référence — fidélité réduite');
      }
    }

    const minDim = Math.min(generatedImageWidth, generatedImageHeight);
    if (minDim < 768) {
      sharpnessEstimate = 4;
      issues.push(`Résolution faible: ${generatedImageWidth}x${generatedImageHeight}`);
    } else if (minDim >= 1024) {
      sharpnessEstimate = 8;
    }

    if (brief.output.qualityMode === 'PREMIUM' && providerUsed !== 'flux') {
      compositionScore -= 1;
      issues.push('Mode premium demandé mais provider non optimal');
    }

    const finalScore = Math.round(
      (productScore * 0.4 + compositionScore * 0.3 + sharpnessEstimate * 0.3) * 10,
    ) / 10;

    return {
      productFaithfulnessScore: productScore,
      compositionScore,
      sharpnessEstimate,
      finalRenderQualityScore: finalScore,
      issues,
      passesThreshold: finalScore >= 5,
    };
  },
};
