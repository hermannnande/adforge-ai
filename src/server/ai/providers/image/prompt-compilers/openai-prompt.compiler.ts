import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';

const QUALITY_MODIFIERS: Record<string, string> = {
  DRAFT: 'quick concept sketch, simple composition',
  STANDARD: 'professional quality, polished design, commercial photography',
  PREMIUM: 'ultra-high quality, 8K, masterful composition, award-winning advertising photography, studio lighting, photorealistic',
};

const PLATFORM_HINTS: Record<string, string> = {
  facebook: 'Facebook advertisement, clean layout with clear CTA',
  instagram: 'Instagram post, visually striking, mobile-first, social media aesthetic',
  instagram_story: 'Instagram Story, vertical, bold text overlay, eye-catching',
  tiktok: 'TikTok ad, vibrant, dynamic, youth-oriented, vertical',
  whatsapp: 'WhatsApp Status, simple and clear, mobile viewing',
  banner: 'web banner, horizontal, professional',
  flyer: 'print flyer, high resolution, professional layout',
};

export function compileOpenAIPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const parts: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  if (brief.needPhotorealism) {
    parts.push('photorealistic advertising visual');
  } else if (brief.needPosterStyle) {
    parts.push('professional advertising poster design');
  } else {
    parts.push('professional advertising visual');
  }

  if (brief.productName) {
    parts.push(`featuring ${brief.productName}`);
  }
  if (brief.productCategory) {
    parts.push(`${brief.productCategory} product advertisement`);
  }

  if (brief.providedExactText.length > 0) {
    for (const t of brief.providedExactText) {
      parts.push(`text "${t}" clearly visible`);
    }
    notes.push('Exact text requested — verify text accuracy in output');
  }

  if (brief.styleIntent.length > 0) {
    parts.push(`${brief.styleIntent.join(', ')} style`);
  }

  if (context.brandKit) {
    if (context.brandKit.primaryColors.length > 0) {
      parts.push(`using brand colors: ${context.brandKit.primaryColors.join(', ')}`);
    }
    if (context.brandKit.tone) {
      parts.push(`${context.brandKit.tone} brand tone`);
    }
    if (context.brandKit.slogan) {
      parts.push(`brand slogan "${context.brandKit.slogan}"`);
    }
  }

  if (context.settings.tone) {
    parts.push(`${context.settings.tone} mood`);
  }

  const platformKey = brief.platform ?? context.settings.platform ?? '';
  const platformHint = PLATFORM_HINTS[platformKey.toLowerCase().replace(/\s+/g, '_')];
  if (platformHint) parts.push(platformHint);

  parts.push(QUALITY_MODIFIERS[brief.qualityMode] ?? QUALITY_MODIFIERS.STANDARD);

  if (brief.positiveConstraints.length > 0) {
    parts.push(brief.positiveConstraints.join(', '));
  }

  const negativePrompt = brief.negativeConstraintsRaw.join(', ');

  let exactTextOverlayPlan = undefined;
  if (brief.needExactText && brief.providedExactText.length > 0) {
    exactTextOverlayPlan = {
      texts: brief.providedExactText.map((t, i) => ({
        content: t,
        role: i === 0 ? 'headline' as const : 'other' as const,
        priority: brief.providedExactText.length - i,
      })),
      mode: 'AI_TEXT_OK' as const,
    };
  }

  return {
    mainPrompt: parts.join(', '),
    negativePrompt,
    textHandlingMode: brief.textRequirementMode,
    generationNotes: notes,
    providerWarnings: warnings,
    exactTextOverlayPlan,
    metadata: { compiler: 'openai', taskType: brief.taskType },
  };
}
