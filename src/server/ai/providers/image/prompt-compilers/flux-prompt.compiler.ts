import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { TextRequirementMode } from '@/lib/ai/enums';

const PHOTO_ENRICHMENT = [
  'professional studio lighting',
  'realistic skin texture',
  'realistic shadows',
  'depth of field',
  'premium product photography',
  'advertising scene',
  'high detail',
  'sharp focus',
];

const QUALITY_MAP: Record<string, string> = {
  DRAFT: 'clean composition, good quality',
  STANDARD: 'professional advertising photography, studio quality, sharp details',
  PREMIUM: 'ultra-high quality 8K, masterful composition, award-winning photography, cinematic lighting, professional retouching',
};

export function compileFluxPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const parts: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  warnings.push('FLUX does not support negative prompts — all constraints expressed positively');

  if (brief.needPhotorealism) {
    parts.push('photorealistic advertising photograph');
    parts.push(...PHOTO_ENRICHMENT);
  } else {
    parts.push('professional advertising visual');
  }

  if (brief.productName) {
    parts.push(`featuring ${brief.productName} as the central subject`);
  }
  if (brief.productCategory) {
    parts.push(`${brief.productCategory} commercial photography`);
  }

  if (brief.needProductFocus) {
    parts.push('product is the focal point, centered composition, clean background');
  }

  if (brief.styleIntent.length > 0) {
    parts.push(brief.styleIntent.join(' and ') + ' aesthetic');
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

  if (brief.translatedConstraintsForFlux.length > 0) {
    parts.push(brief.translatedConstraintsForFlux.slice(0, 5).join(', '));
  }

  if (brief.positiveConstraints.length > 0) {
    parts.push(brief.positiveConstraints.join(', '));
  }

  if (brief.needVisibleText) {
    notes.push('FLUX has limited typography capability — text may not be accurate');
    if (brief.providedExactText.length > 0) {
      for (const t of brief.providedExactText) {
        parts.push(`with text "${t}"`);
      }
    }
  }

  if (brief.referenceAssetCount > 0) {
    parts.push('maintain the same product, style, colors and identity as the reference image');
    parts.push('keep visual consistency with the provided reference');
    notes.push(`${brief.referenceAssetCount} reference image(s) provided — using Kontext for visual coherence`);
  }

  return {
    mainPrompt: parts.join(', '),
    negativePrompt: undefined,
    textHandlingMode: brief.needExactText ? TextRequirementMode.EXACT : brief.textRequirementMode,
    generationNotes: notes,
    providerWarnings: warnings,
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
    metadata: { compiler: 'flux', taskType: brief.taskType },
  };
}
