import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { TextRequirementMode } from '@/lib/ai/enums';

const QUALITY_MAP: Record<string, string> = {
  DRAFT: 'clean and clear design',
  STANDARD: 'professional design, high quality typography, polished layout',
  PREMIUM: 'premium advertising design, award-winning typography, impeccable text rendering, magazine quality',
};

export function compileIdeogramPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const parts: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];

  warnings.push('Ideogram asset URLs are temporary — download and persist immediately');

  if (brief.needPosterStyle) {
    parts.push('professional advertising poster with strong typography hierarchy');
  } else if (brief.needVisibleText) {
    parts.push('advertising visual with clear, well-rendered text');
  } else {
    parts.push('professional advertising visual design');
  }

  if (brief.productName) {
    parts.push(`for ${brief.productName}`);
  }
  if (brief.productCategory) {
    parts.push(`${brief.productCategory} sector`);
  }

  if (brief.providedExactText.length > 0) {
    const [headline, ...rest] = brief.providedExactText;
    parts.push(`main headline text: "${headline}"`);
    for (const t of rest) {
      parts.push(`secondary text: "${t}"`);
    }
    notes.push('Exact text requested — Ideogram is strong at text rendering');
  }

  if (brief.needTypographyQuality) {
    parts.push('emphasis on clean, readable, impactful typography');
    parts.push('clear text hierarchy: headline > subheadline > body > CTA');
  }

  if (brief.styleIntent.length > 0) {
    parts.push(`${brief.styleIntent.join(', ')} design style`);
  }

  if (context.brandKit) {
    if (context.brandKit.primaryColors.length > 0) {
      parts.push(`brand color palette: ${context.brandKit.primaryColors.join(', ')}`);
    }
    if (context.brandKit.fonts.length > 0) {
      parts.push(`typography inspired by: ${context.brandKit.fonts.join(', ')}`);
    }
    if (context.brandKit.tone) {
      parts.push(`${context.brandKit.tone} brand identity`);
    }
    if (context.brandKit.slogan) {
      parts.push(`featuring slogan "${context.brandKit.slogan}"`);
    }
  }

  if (context.settings.tone) {
    parts.push(`${context.settings.tone} visual tone`);
  }

  parts.push(QUALITY_MAP[brief.qualityMode] ?? QUALITY_MAP.STANDARD);

  if (brief.positiveConstraints.length > 0) {
    parts.push(brief.positiveConstraints.join(', '));
  }

  const negativePrompt = brief.negativeConstraintsRaw.length > 0
    ? brief.negativeConstraintsRaw.join(', ')
    : undefined;

  let exactTextOverlayPlan = undefined;
  if (brief.needExactText && brief.providedExactText.length > 0) {
    exactTextOverlayPlan = {
      texts: brief.providedExactText.map((t, i) => ({
        content: t,
        role: (i === 0 ? 'headline' : i === brief.providedExactText.length - 1 ? 'cta' : 'other') as 'headline' | 'cta' | 'other',
        priority: brief.providedExactText.length - i,
      })),
      mode: (brief.textRequirementMode === TextRequirementMode.EXACT
        ? 'DETERMINISTIC_TEXT_REQUIRED'
        : 'AI_TEXT_OK') as 'AI_TEXT_OK' | 'DETERMINISTIC_TEXT_REQUIRED',
    };
  }

  return {
    mainPrompt: parts.join(', '),
    negativePrompt,
    textHandlingMode: brief.textRequirementMode,
    generationNotes: notes,
    providerWarnings: warnings,
    exactTextOverlayPlan,
    metadata: { compiler: 'ideogram', taskType: brief.taskType },
  };
}
