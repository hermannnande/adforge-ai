import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { TextRequirementMode } from '@/lib/ai/enums';

const QUALITY_MAP: Record<string, string> = {
  DRAFT: 'clean composition, good quality',
  STANDARD: 'professional advertising photography, studio quality, sharp details',
  PREMIUM: 'ultra-high quality 8K, masterful composition, award-winning photography, cinematic lighting',
};

/**
 * FLUX prompt compiler.
 * RULE: brief.rawUserPrompt MUST be included as the core instruction.
 * FLUX does not support negative prompts — all constraints expressed positively.
 */
export function compileFluxPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const before: string[] = [];
  const after: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  warnings.push('FLUX does not support negative prompts — all constraints expressed positively');

  if (brief.needPhotorealism) {
    before.push('photorealistic advertising photograph, professional studio lighting, sharp focus, depth of field');
  } else {
    before.push('professional advertising visual');
  }

  if (brief.referenceAssetCount > 0) {
    before.push(
      'maintain the same product, style, colors and identity as the reference image(s)',
      'keep visual consistency with the provided references',
    );
    notes.push(`${brief.referenceAssetCount} reference image(s) — using Kontext for visual coherence`);
  }

  if (brief.styleIntent.length > 0) {
    after.push(brief.styleIntent.join(' and ') + ' aesthetic');
  }

  if (context.brandKit) {
    if (context.brandKit.primaryColors.length > 0) {
      after.push(`color palette: ${context.brandKit.primaryColors.join(', ')}`);
    }
    if (context.brandKit.tone) {
      after.push(`${context.brandKit.tone} atmosphere`);
    }
  }

  after.push(QUALITY_MAP[brief.qualityMode] ?? QUALITY_MAP.STANDARD);

  if (brief.needVisibleText && brief.providedExactText.length > 0) {
    notes.push('FLUX has limited typography capability — text may not be accurate');
    for (const t of brief.providedExactText) {
      after.push(`with text "${t}"`);
    }
  }

  const mainPrompt = [
    ...before,
    brief.rawUserPrompt,
    ...after,
  ].join(', ');

  return {
    mainPrompt,
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
