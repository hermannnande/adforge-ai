import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { TextRequirementMode } from '@/lib/ai/enums';

const QUALITY_MAP: Record<string, string> = {
  DRAFT: 'good quality, clean composition',
  STANDARD: 'professional advertising photography, studio quality, sharp details, 4K resolution',
  PREMIUM: 'ultra-high quality 8K, masterful composition, award-winning photography, cinematic lighting, professional retouching, commercial grade',
};

export function compileNanoBananaPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const parts: string[] = [];
  const notes: string[] = [];

  if (brief.needPhotorealism) {
    parts.push('photorealistic professional advertising photograph');
    parts.push('realistic lighting, natural shadows, depth of field, sharp focus');
  } else if (brief.needPosterStyle) {
    parts.push('professional advertising poster design');
    parts.push('bold typography, clean layout, eye-catching composition');
  } else {
    parts.push('professional advertising visual');
  }

  if (brief.productName) {
    parts.push(`featuring ${brief.productName} as the central subject`);
  }
  if (brief.productCategory) {
    parts.push(`${brief.productCategory} product photography`);
  }

  if (brief.needProductFocus) {
    parts.push('product is the focal point, centered composition, clean background');
  }

  if (brief.styleIntent.length > 0) {
    parts.push(brief.styleIntent.join(' and ') + ' aesthetic');
  }

  if (brief.providedExactText.length > 0) {
    for (const t of brief.providedExactText) {
      parts.push(`with visible text reading "${t}"`);
    }
    notes.push('NanoBanana has strong text rendering — exact text should appear accurately');
  }

  if (context.brandKit) {
    if (context.brandKit.primaryColors.length > 0) {
      parts.push(`color palette: ${context.brandKit.primaryColors.join(', ')}`);
    }
    if (context.brandKit.tone) {
      parts.push(`${context.brandKit.tone} atmosphere`);
    }
  }

  if (context.settings.tone) {
    parts.push(`${context.settings.tone} mood and atmosphere`);
  }

  parts.push(QUALITY_MAP[brief.qualityMode] ?? QUALITY_MAP.STANDARD);

  if (brief.positiveConstraints.length > 0) {
    parts.push(brief.positiveConstraints.join(', '));
  }

  if (brief.referenceAssetCount > 0) {
    parts.push('maintain the same product, style, colors and identity as the reference image');
    parts.push('preserve the exact visual appearance of the imported product');
    notes.push(`${brief.referenceAssetCount} reference image(s) provided — visual consistency is critical`);
  }

  const negativePrompt = brief.negativeConstraintsRaw.length > 0
    ? brief.negativeConstraintsRaw.join(', ')
    : undefined;

  if (negativePrompt) {
    parts.push(`Avoid: ${negativePrompt}`);
  }

  return {
    mainPrompt: parts.join(', '),
    negativePrompt: undefined,
    textHandlingMode: brief.needExactText ? TextRequirementMode.EXACT : brief.textRequirementMode,
    generationNotes: notes,
    providerWarnings: [],
    exactTextOverlayPlan: brief.needExactText && brief.providedExactText.length > 0
      ? {
          texts: brief.providedExactText.map((t, i) => ({
            content: t,
            role: i === 0 ? 'headline' as const : 'other' as const,
            priority: brief.providedExactText.length - i,
          })),
          mode: 'DETERMINISTIC_TEXT_REQUIRED' as const,
        }
      : undefined,
    metadata: { compiler: 'nanobanana', taskType: brief.taskType },
  };
}
