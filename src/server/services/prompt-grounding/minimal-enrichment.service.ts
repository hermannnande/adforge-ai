import type { CanonicalRequest, MinimalEnrichedPrompt } from './types';
import { multiImagePipelineService } from './multi-image-pipeline.service';

/**
 * RULE: The user's raw prompt MUST remain the dominant instruction.
 * Only add context that helps the AI produce a better result.
 * Never rewrite, summarize destructively, or replace the user's words.
 */
export const minimalEnrichmentService = {
  enrichLightly(canonical: CanonicalRequest): MinimalEnrichedPrompt {
    const contextAdditions: string[] = [];
    const imageInstructions: string[] = [];
    const qualityHints: string[] = [];

    const assets = canonical.referenceAssets;

    if (assets.totalCount > 0) {
      const imageCtx = multiImagePipelineService.buildImageContextString(assets);
      if (imageCtx) imageInstructions.push(imageCtx);
    }

    if (canonical.lockedConstraints.mustPreserveProduct && assets.primaryProduct) {
      imageInstructions.push(
        'The primary product in the reference image MUST be preserved exactly as shown — same packaging, shape, colors, and branding.',
      );
    }

    if (
      canonical.projectContext.projectGoal &&
      canonical.lockedConstraints.requestedChanges.length > 0
    ) {
      contextAdditions.push(
        `Project context: ${canonical.projectContext.projectGoal.slice(0, 100)}`,
      );
    }

    if (canonical.lockedConstraints.mustPreserveStyle && canonical.projectContext.approvedStyleDirection) {
      contextAdditions.push(
        `Maintain style: ${canonical.projectContext.approvedStyleDirection}`,
      );
    }

    qualityHints.push('Professional advertising visual, high quality, clean composition.');
    if (canonical.outputRequirements.qualityMode === 'PREMIUM') {
      qualityHints.push('Ultra-high quality, 4K resolution, studio lighting, photorealistic.');
    }

    const outputHint = getOutputTypeHint(canonical.outputRequirements.outputType);
    if (outputHint) qualityHints.push(outputHint);

    const parts: string[] = [];

    if (imageInstructions.length > 0) {
      parts.push(imageInstructions.join(' '));
    }

    parts.push(canonical.primaryInstruction);

    if (contextAdditions.length > 0) {
      parts.push(contextAdditions.join('. '));
    }

    if (qualityHints.length > 0) {
      parts.push(qualityHints.join(' '));
    }

    return {
      finalPrompt: parts.join('\n'),
      rawUserPrompt: canonical.primaryInstruction,
      contextAdditions,
      imageInstructions,
      qualityHints,
    };
  },
};

function getOutputTypeHint(outputType: string): string | null {
  switch (outputType) {
    case 'poster':
      return 'Advertising poster format, bold composition, impactful layout.';
    case 'banner':
      return 'Banner format, wide composition, clear messaging.';
    case 'flyer':
      return 'Flyer format, print-ready, professional layout.';
    case 'social_ad':
      return 'Social media ad format, eye-catching, mobile-optimized.';
    case 'product_shot':
      return 'Product photography, clean background, studio lighting.';
    default:
      return null;
  }
}
