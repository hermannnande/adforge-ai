import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { TextRequirementMode } from '@/lib/ai/enums';

/**
 * NanoBanana prompt compiler.
 *
 * RULE: The user's raw prompt is sent EXACTLY as-is to NanoBanana.
 * NO wrapping, NO instructions before/after, NO modification.
 *
 * NanoBanana (Gemini) understands multi-modal input natively.
 * The reference images are attached as inline data parts separately.
 * The text prompt should be exactly what the user typed —
 * just like they would type it directly in Google AI Studio.
 */
export function compileNanoBananaPrompt(
  brief: NormalizedGenerationBrief,
  _context: ProjectContext,
): PromptPackage {
  const notes: string[] = [];

  if (brief.referenceAssetCount > 0) {
    notes.push(`${brief.referenceAssetCount} reference image(s) attached as inline data`);
  }

  return {
    mainPrompt: brief.rawUserPrompt,
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
    metadata: { compiler: 'nanobanana-passthrough', taskType: brief.taskType },
  };
}
