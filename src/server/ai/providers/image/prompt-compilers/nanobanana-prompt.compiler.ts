import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { TextRequirementMode } from '@/lib/ai/enums';
import { qualityBoostService } from '@/server/services/prompt-grounding/quality-boost.service';

/**
 * NanoBanana prompt compiler.
 *
 * STRATEGY:
 * 1. User's raw prompt = PRIMARY instruction (never modified)
 * 2. Quality boost = APPENDED after as "Style & Quality" hints
 * 3. Reference images = sent as inline data parts (handled by provider)
 *
 * The user's words are the FIRST thing the AI reads.
 * Quality enhancers come AFTER, helping the AI produce ultra-realistic results.
 */
export function compileNanoBananaPrompt(
  brief: NormalizedGenerationBrief,
  _context: ProjectContext,
): PromptPackage {
  const notes: string[] = [];

  const boost = qualityBoostService.buildQualityBoost(
    brief.rawUserPrompt,
    brief.qualityMode,
  );

  const mainPrompt = brief.rawUserPrompt + boost.suffix;

  if (brief.referenceAssetCount > 0) {
    notes.push(`${brief.referenceAssetCount} reference image(s) attached as inline data`);
  }
  notes.push(`Quality enhancements: ${boost.appliedEnhancements.join(', ')}`);

  return {
    mainPrompt,
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
    metadata: {
      compiler: 'nanobanana-quality-boost',
      taskType: brief.taskType,
      qualityEnhancements: boost.appliedEnhancements,
    },
  };
}
