import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { qualityBoostService } from '@/server/services/prompt-grounding/quality-boost.service';

const PLATFORM_HINTS: Record<string, string> = {
  facebook: 'Facebook advertisement format',
  instagram: 'Instagram post, mobile-first',
  instagram_story: 'Instagram Story, vertical',
  tiktok: 'TikTok ad, vertical, dynamic',
  whatsapp: 'WhatsApp Status, simple and clear',
  banner: 'web banner, horizontal',
  flyer: 'print flyer, high resolution',
};

/**
 * OpenAI prompt compiler.
 * User prompt = PRIMARY instruction, quality boost APPENDED after.
 */
export function compileOpenAIPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const notes: string[] = [];
  const warnings: string[] = [];

  const boost = qualityBoostService.buildQualityBoost(
    brief.rawUserPrompt,
    brief.qualityMode,
  );

  let mainPrompt = brief.rawUserPrompt;

  if (brief.referenceAssetCount > 0) {
    notes.push(`${brief.referenceAssetCount} reference image(s) attached`);
  }

  if (brief.providedExactText.length > 0) {
    for (const t of brief.providedExactText) {
      mainPrompt += `, text "${t}" clearly visible`;
    }
    notes.push('Exact text requested');
  }

  if (context.brandKit) {
    if (context.brandKit.primaryColors.length > 0) {
      mainPrompt += `, brand colors: ${context.brandKit.primaryColors.join(', ')}`;
    }
  }

  const platformKey = brief.platform ?? context.settings.platform ?? '';
  const platformHint = PLATFORM_HINTS[platformKey.toLowerCase().replace(/\s+/g, '_')];
  if (platformHint) mainPrompt += `, ${platformHint}`;

  mainPrompt += boost.suffix;

  const negativePrompt = brief.negativeConstraintsRaw.join(', ');

  return {
    mainPrompt,
    negativePrompt,
    textHandlingMode: brief.textRequirementMode,
    generationNotes: notes,
    providerWarnings: warnings,
    exactTextOverlayPlan: brief.needExactText && brief.providedExactText.length > 0
      ? {
          texts: brief.providedExactText.map((t, i) => ({
            content: t,
            role: i === 0 ? 'headline' as const : 'other' as const,
            priority: brief.providedExactText.length - i,
          })),
          mode: 'AI_TEXT_OK' as const,
        }
      : undefined,
    metadata: {
      compiler: 'openai-quality-boost',
      taskType: brief.taskType,
      qualityEnhancements: boost.appliedEnhancements,
    },
  };
}
