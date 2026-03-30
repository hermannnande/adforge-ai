import type {
  NormalizedGenerationBrief,
  ProjectContext,
  ProviderExecutionResult,
  QualityEvaluationResult,
} from '@/lib/ai/types';

const QUALITY_THRESHOLD = 5.0;

export const generationQualityEvaluator = {
  evaluate(
    result: ProviderExecutionResult,
    brief: NormalizedGenerationBrief,
    context: ProjectContext,
  ): QualityEvaluationResult {
    const issues: string[] = [];

    const hasImages = result.images.length > 0;
    if (!hasImages) {
      return {
        briefAlignmentScore: 0,
        realismScore: 0,
        typographyScore: 0,
        productFocusScore: 0,
        compositionScore: 0,
        brandConsistencyScore: 0,
        finalQualityScore: 0,
        issues: ['Aucune image générée'],
        passesThreshold: false,
      };
    }

    let briefAlignmentScore = 7;
    let realismScore = 7;
    let typographyScore = 7;
    let productFocusScore = 7;
    let compositionScore = 7;
    let brandConsistencyScore = 7;

    if (brief.needPhotorealism) {
      if (result.provider === 'flux') {
        realismScore = 9;
      } else if (result.provider === 'openai') {
        realismScore = 7;
      } else {
        realismScore = 6;
        issues.push('Provider non optimal pour le photoréalisme demandé');
      }
    }

    if (brief.needTypographyQuality || brief.needVisibleText) {
      if (result.provider === 'ideogram') {
        typographyScore = 9;
      } else if (result.provider === 'openai') {
        typographyScore = 6;
      } else {
        typographyScore = 4;
        issues.push('Provider faible en typographie pour une demande texte');
      }
    }

    if (brief.needExactText && result.provider !== 'ideogram') {
      typographyScore = Math.max(typographyScore - 2, 2);
      issues.push('Texte exact demandé mais provider non spécialisé');
    }

    if (brief.needProductFocus) {
      if (result.provider === 'flux') {
        productFocusScore = 9;
      } else {
        productFocusScore = 7;
      }
    }

    if (context.brandKit) {
      brandConsistencyScore = 6;
      if (brief.positiveConstraints.length > 0 || context.brandKit.primaryColors.length > 0) {
        brandConsistencyScore = 7;
      }
    }

    for (const img of result.images) {
      if (img.width < 512 || img.height < 512) {
        compositionScore = Math.max(compositionScore - 2, 3);
        issues.push('Résolution de sortie faible');
      }
    }

    const weights = {
      briefAlignment: 2.5,
      realism: brief.needPhotorealism ? 2 : 1,
      typography: brief.needVisibleText ? 2 : 0.5,
      productFocus: brief.needProductFocus ? 1.5 : 0.5,
      composition: 1.5,
      brandConsistency: context.brandKit ? 1.5 : 0.5,
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const finalQualityScore = Math.round((
      briefAlignmentScore * weights.briefAlignment +
      realismScore * weights.realism +
      typographyScore * weights.typography +
      productFocusScore * weights.productFocus +
      compositionScore * weights.composition +
      brandConsistencyScore * weights.brandConsistency
    ) / totalWeight * 10) / 10;

    return {
      briefAlignmentScore,
      realismScore,
      typographyScore,
      productFocusScore,
      compositionScore,
      brandConsistencyScore,
      finalQualityScore,
      issues,
      passesThreshold: finalQualityScore >= QUALITY_THRESHOLD,
    };
  },

  getThreshold(): number {
    return QUALITY_THRESHOLD;
  },
};
