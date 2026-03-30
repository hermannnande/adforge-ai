import type {
  CanonicalRequest,
  MinimalEnrichedPrompt,
  AssetCollection,
  ProviderTranslatedPrompt,
  AssetRole,
} from './types';

/**
 * Translate the enriched prompt for each provider while preserving the user's intent.
 * RULE: the raw user prompt MUST remain the core instruction.
 * RULE: ALL images must be passed through.
 */
export const providerTranslatorService = {
  translateForNanoBanana(
    enriched: MinimalEnrichedPrompt,
    canonical: CanonicalRequest,
  ): ProviderTranslatedPrompt {
    const parts: string[] = [];
    const allUrls = getAllUrls(canonical.referenceAssets);

    if (allUrls.length > 0) {
      parts.push(buildMultiImagePreamble(canonical.referenceAssets));
    }

    parts.push(enriched.rawUserPrompt);

    parts.push('Professional advertising visual, high quality, clean composition, 4K resolution.');
    if (canonical.outputRequirements.qualityMode === 'PREMIUM') {
      parts.push('Ultra-high quality, photorealistic, studio lighting.');
    }

    return {
      mainPrompt: parts.join('\n'),
      rawUserPrompt: enriched.rawUserPrompt,
      referenceImages: allUrls,
      referenceImageRoles: buildRoleMap(canonical.referenceAssets),
      imageCount: allUrls.length,
      provider: 'nanobanana',
      translationNotes: [`${allUrls.length} images attached`],
    };
  },

  translateForOpenAI(
    enriched: MinimalEnrichedPrompt,
    canonical: CanonicalRequest,
  ): ProviderTranslatedPrompt {
    const parts: string[] = [];
    const allUrls = getAllUrls(canonical.referenceAssets);

    parts.push('Professional advertising visual.');

    if (allUrls.length > 0) {
      parts.push(buildMultiImagePreamble(canonical.referenceAssets));
    }

    parts.push(enriched.rawUserPrompt);

    if (canonical.outputRequirements.qualityMode === 'PREMIUM') {
      parts.push('ultra-high quality, 8K, masterful composition, award-winning advertising photography, studio lighting, photorealistic');
    } else {
      parts.push('professional quality, polished design, commercial photography');
    }

    return {
      mainPrompt: parts.join(', '),
      rawUserPrompt: enriched.rawUserPrompt,
      referenceImages: allUrls,
      referenceImageRoles: buildRoleMap(canonical.referenceAssets),
      imageCount: allUrls.length,
      provider: 'openai',
      translationNotes: [`${allUrls.length} images as context`],
    };
  },

  translateForFlux(
    enriched: MinimalEnrichedPrompt,
    canonical: CanonicalRequest,
  ): ProviderTranslatedPrompt {
    const parts: string[] = [];
    const allUrls = getAllUrls(canonical.referenceAssets);

    parts.push('photorealistic advertising photograph, professional studio lighting, sharp focus');

    if (allUrls.length > 0) {
      parts.push(
        'maintain the same product, style, colors and identity as the reference images',
        'keep visual consistency with all provided references',
      );
    }

    parts.push(enriched.rawUserPrompt);

    parts.push(
      'advertising scene, high detail, premium product photography',
      'professional advertising photography, studio quality, sharp details',
    );

    return {
      mainPrompt: parts.join(', '),
      rawUserPrompt: enriched.rawUserPrompt,
      referenceImages: allUrls,
      referenceImageRoles: buildRoleMap(canonical.referenceAssets),
      imageCount: allUrls.length,
      provider: 'flux',
      translationNotes: ['FLUX: no negative prompts', `${allUrls.length} images attached`],
    };
  },

  translateForIdeogram(
    enriched: MinimalEnrichedPrompt,
    canonical: CanonicalRequest,
  ): ProviderTranslatedPrompt {
    const parts: string[] = [];
    const allUrls = getAllUrls(canonical.referenceAssets);

    parts.push('professional advertising poster design');

    if (allUrls.length > 0) {
      parts.push(buildMultiImagePreamble(canonical.referenceAssets));
    }

    parts.push(enriched.rawUserPrompt);

    parts.push('clean typography, professional layout, advertising quality');

    return {
      mainPrompt: parts.join(', '),
      rawUserPrompt: enriched.rawUserPrompt,
      referenceImages: allUrls,
      referenceImageRoles: buildRoleMap(canonical.referenceAssets),
      imageCount: allUrls.length,
      provider: 'ideogram',
      translationNotes: [`${allUrls.length} images attached`],
    };
  },
};

function getAllUrls(assets: AssetCollection): string[] {
  return assets.assets.map((a) => a.url);
}

function buildRoleMap(assets: AssetCollection): Map<string, AssetRole> {
  const map = new Map<string, AssetRole>();
  for (const a of assets.assets) {
    map.set(a.url, a.role);
  }
  return map;
}

function buildMultiImagePreamble(assets: AssetCollection): string {
  const parts: string[] = [];

  if (assets.primaryProduct) {
    parts.push(
      `Use the provided primary product reference image exactly as shown — preserve its appearance, packaging, colors, shape, and branding.`,
    );
  }

  if (assets.secondaryProducts.length > 0) {
    parts.push(
      `Include the ${assets.secondaryProducts.length} additional product image(s) in the composition.`,
    );
  }

  if (assets.styleReferences.length > 0) {
    parts.push(
      `Match the visual style from the ${assets.styleReferences.length} style reference(s).`,
    );
  }

  if (assets.brandReferences.length > 0) {
    parts.push(`Respect branding identity from brand reference(s).`);
  }

  const modelRefs = assets.assets.filter((a) => a.role === 'MODEL_REFERENCE');
  if (modelRefs.length > 0) {
    parts.push(`Include the model/person from the model reference image(s).`);
  }

  if (parts.length === 0 && assets.totalCount > 0) {
    parts.push(
      `${assets.totalCount} reference image(s) provided — use them to maintain visual consistency and product identity.`,
    );
  }

  return parts.join(' ');
}
