import type { NormalizedGenerationBrief, PromptPackage, ProjectContext } from '@/lib/ai/types';
import { TextRequirementMode } from '@/lib/ai/enums';

export function compileNanoBananaPrompt(
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  const sections: string[] = [];
  const notes: string[] = [];

  // 1. Core visual direction
  if (brief.referenceAssetCount > 0) {
    sections.push(
      'Create a professional advertising poster using the provided reference product image(s) as the EXACT product to feature.',
      'The product from the reference image(s) MUST appear exactly as-is in the final composition — same shape, colors, packaging, branding, and text.',
      'Do NOT replace, reimagine, or alter the product appearance in any way.',
    );
    notes.push(`${brief.referenceAssetCount} reference image(s) — product identity must be perfectly preserved`);
  }

  if (brief.needPhotorealism) {
    sections.push(
      'Photorealistic commercial advertising photograph.',
      'Studio-quality lighting with professional 3-point setup, natural shadows, shallow depth of field, razor-sharp product focus.',
    );
  } else if (brief.needPosterStyle) {
    sections.push(
      'Professional advertising poster design.',
      'Bold headline typography, clear visual hierarchy, eye-catching layout, balanced white space.',
    );
  } else {
    sections.push(
      'Professional high-end advertising visual suitable for digital marketing campaigns.',
    );
  }

  // 2. Product details
  if (brief.productName) {
    sections.push(`Central product: "${brief.productName}" — must be prominently featured as the hero element.`);
  }
  if (brief.productCategory) {
    sections.push(`Product category: ${brief.productCategory}.`);
  }
  if (brief.needProductFocus) {
    sections.push('Product must be the dominant focal point, occupying at least 40% of the frame.');
  }

  // 3. Style and aesthetic
  if (brief.styleIntent.length > 0) {
    sections.push(`Visual style: ${brief.styleIntent.join(', ')}.`);
  }

  // 4. Text elements
  if (brief.providedExactText.length > 0) {
    for (const t of brief.providedExactText) {
      sections.push(`Include clearly visible, well-designed text: "${t}"`);
    }
  }

  // 5. Brand kit
  if (context.brandKit) {
    const bk: string[] = [];
    if (context.brandKit.primaryColors.length > 0) {
      bk.push(`brand colors: ${context.brandKit.primaryColors.join(', ')}`);
    }
    if (context.brandKit.tone) {
      bk.push(`brand tone: ${context.brandKit.tone}`);
    }
    if (bk.length > 0) {
      sections.push(`Brand guidelines: ${bk.join('; ')}.`);
    }
  }

  // 6. Tone and mood
  if (context.settings.tone) {
    sections.push(`Overall mood: ${context.settings.tone}.`);
  }

  // 7. Positive constraints from user
  if (brief.positiveConstraints.length > 0) {
    sections.push(brief.positiveConstraints.join('. ') + '.');
  }

  // 8. Negative constraints as avoidance instructions
  if (brief.negativeConstraintsRaw.length > 0) {
    sections.push(`Avoid: ${brief.negativeConstraintsRaw.join(', ')}.`);
  }

  // 9. Quality and resolution
  sections.push(
    'Output: ultra-high resolution, 4K, print-ready quality.',
    'Clean composition, no artifacts, no watermarks, no blurring.',
    'Professional commercial advertising standard — ready for Facebook Ads, Instagram, or print.',
  );

  const mainPrompt = sections.join('\n');

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
