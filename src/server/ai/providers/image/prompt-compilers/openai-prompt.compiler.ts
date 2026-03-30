import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';

const QUALITY_MODIFIERS: Record<string, string> = {
  DRAFT: 'quick concept sketch, simple composition',
  STANDARD: 'professional quality, polished design, commercial photography',
  PREMIUM: 'ultra-high quality, 8K, masterful composition, award-winning advertising photography, studio lighting, photorealistic',
};

const PLATFORM_HINTS: Record<string, string> = {
  facebook: 'Facebook advertisement, clean layout with clear CTA',
  instagram: 'Instagram post, visually striking, mobile-first',
  instagram_story: 'Instagram Story, vertical, bold text overlay',
  tiktok: 'TikTok ad, vibrant, dynamic, vertical',
  whatsapp: 'WhatsApp Status, simple and clear',
  banner: 'web banner, horizontal, professional',
  flyer: 'print flyer, high resolution, professional layout',
};

/**
 * OpenAI prompt compiler.
 * RULE: brief.rawUserPrompt MUST be included as the core instruction.
 */
export function compileOpenAIPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const before: string[] = [];
  const after: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  if (brief.needPhotorealism) {
    before.push('photorealistic advertising visual');
  } else if (brief.needPosterStyle) {
    before.push('professional advertising poster design');
  } else {
    before.push('professional advertising visual');
  }

  if (brief.referenceAssetCount > 0) {
    before.push(
      `Use the ${brief.referenceAssetCount} provided reference image(s) — preserve the product appearance exactly`,
    );
    notes.push(`${brief.referenceAssetCount} reference image(s) attached`);
  }

  if (brief.providedExactText.length > 0) {
    for (const t of brief.providedExactText) {
      after.push(`text "${t}" clearly visible`);
    }
    notes.push('Exact text requested');
  }

  if (context.brandKit) {
    if (context.brandKit.primaryColors.length > 0) {
      after.push(`brand colors: ${context.brandKit.primaryColors.join(', ')}`);
    }
    if (context.brandKit.tone) {
      after.push(`${context.brandKit.tone} brand tone`);
    }
  }

  const platformKey = brief.platform ?? context.settings.platform ?? '';
  const platformHint = PLATFORM_HINTS[platformKey.toLowerCase().replace(/\s+/g, '_')];
  if (platformHint) after.push(platformHint);

  after.push(QUALITY_MODIFIERS[brief.qualityMode] ?? QUALITY_MODIFIERS.STANDARD);

  const negativePrompt = brief.negativeConstraintsRaw.join(', ');

  const mainPrompt = [
    ...before,
    brief.rawUserPrompt,
    ...after,
  ].join(', ');

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
    metadata: { compiler: 'openai', taskType: brief.taskType },
  };
}
