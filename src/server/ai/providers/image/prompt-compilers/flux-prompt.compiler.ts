import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { TextRequirementMode } from '@/lib/ai/enums';
import { qualityBoostService } from '@/server/services/prompt-grounding/quality-boost.service';

/**
 * FLUX prompt compiler.
 * User prompt = PRIMARY instruction, quality boost APPENDED after.
 * FLUX does not support negative prompts.
 */
export function compileFluxPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const notes: string[] = [];
  const warnings: string[] = [];

  warnings.push('FLUX does not support negative prompts');

  const boost = qualityBoostService.buildQualityBoost(
    brief.rawUserPrompt,
    brief.qualityMode,
  );

  let mainPrompt = brief.rawUserPrompt;

  if (brief.referenceAssetCount > 0) {
    mainPrompt += ', maintain the same product, style, colors and identity as the reference image(s)';
    notes.push(`${brief.referenceAssetCount} reference image(s) — using Kontext for visual coherence`);
  }

  if (context.brandKit) {
    if (context.brandKit.primaryColors.length > 0) {
      mainPrompt += `, color palette: ${context.brandKit.primaryColors.join(', ')}`;
    }
  }

  if (brief.needVisibleText && brief.providedExactText.length > 0) {
    notes.push('FLUX has limited typography capability');
    for (const t of brief.providedExactText) {
      mainPrompt += `, with text "${t}"`;
    }
  }

  mainPrompt += boost.suffix;

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
    metadata: {
      compiler: 'flux-quality-boost',
      taskType: brief.taskType,
      qualityEnhancements: boost.appliedEnhancements,
    },
  };
}
