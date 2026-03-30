import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { TextRequirementMode } from '@/lib/ai/enums';

export function compileNanoBananaPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const before: string[] = [];
  const after: string[] = [];
  const notes: string[] = [];

  if (brief.referenceAssetCount > 0) {
    before.push(
      `Use the ${brief.referenceAssetCount} provided reference image(s) as the exact product to feature in the poster.`,
      'Keep the product appearance, packaging, colors, shape, and branding exactly as shown in the reference.',
    );
    notes.push(`${brief.referenceAssetCount} reference image(s) — product identity must be preserved`);
  }

  after.push('Professional advertising visual, high quality, clean composition, 4K resolution.');

  if (brief.needPhotorealism) {
    after.push('Photorealistic style, studio lighting, sharp focus.');
  }

  if (brief.providedExactText.length > 0) {
    for (const t of brief.providedExactText) {
      after.push(`Include visible text: "${t}"`);
    }
  }

  if (context.brandKit) {
    const bk: string[] = [];
    if (context.brandKit.primaryColors.length > 0) {
      bk.push(`colors: ${context.brandKit.primaryColors.join(', ')}`);
    }
    if (context.brandKit.tone) {
      bk.push(`tone: ${context.brandKit.tone}`);
    }
    if (bk.length > 0) {
      after.push(`Brand: ${bk.join(', ')}.`);
    }
  }

  const mainPrompt = [
    ...before,
    brief.rawUserPrompt,
    ...after,
  ].join('\n');

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
    metadata: { compiler: 'nanobanana', taskType: brief.taskType },
  };
}
