import type {
  CanonicalRequest,
  PreservedPrompt,
  AssetCollection,
  ProjectMemorySnapshot,
  LockedConstraints,
  OutputRequirements,
} from './types';

const OUTPUT_TYPE_DETECT: Record<string, RegExp> = {
  poster: /poster|affiche/i,
  banner: /banni[èe]re|banner/i,
  flyer: /flyer|tract/i,
  social_ad: /instagram|facebook|story|tiktok/i,
  product_shot: /packshot|product\s*shot|photo\s*produit/i,
};

function detectOutputType(
  prompt: string,
  memory: ProjectMemorySnapshot,
): OutputRequirements['outputType'] {
  for (const [type, pattern] of Object.entries(OUTPUT_TYPE_DETECT)) {
    if (pattern.test(prompt)) return type as OutputRequirements['outputType'];
  }
  if (memory.preferredOutputType) {
    return memory.preferredOutputType as OutputRequirements['outputType'];
  }
  return 'generic_ad';
}

export const canonicalRequestService = {
  /**
   * Build the canonical request: structured representation with the raw user prompt
   * as the PRIMARY instruction. Everything else is supporting context.
   */
  buildCanonicalRequest(params: {
    preserved: PreservedPrompt;
    assets: AssetCollection;
    memory: ProjectMemorySnapshot;
    qualityMode?: string;
    platform?: string;
    aspectRatio?: string;
  }): CanonicalRequest {
    const { preserved, assets, memory, qualityMode, platform, aspectRatio } = params;

    const lockedElements: string[] = [];

    if (assets.primaryProduct) {
      lockedElements.push('produit principal importé');
    }
    if (memory.approvedStyleDirection && preserved.isDeltaRequest) {
      lockedElements.push(`style: ${memory.approvedStyleDirection}`);
    }
    if (memory.projectTheme) {
      lockedElements.push(`thème: ${memory.projectTheme}`);
    }

    const lockedConstraints: LockedConstraints = {
      mustPreserveProduct: !!assets.primaryProduct,
      mustPreserveStyle: preserved.isDeltaRequest && !!memory.approvedStyleDirection,
      mustPreserveTone: preserved.isDeltaRequest && !!memory.activeMarketingGoal,
      lockedElements,
      requestedChanges: preserved.isDeltaRequest
        ? [preserved.rawUserPrompt]
        : [],
    };

    const outputType = detectOutputType(preserved.rawUserPrompt, memory);

    const outputRequirements: OutputRequirements = {
      targetPlatform: platform ?? 'facebook',
      targetFormat: aspectRatio ?? '1:1',
      aspectRatio: aspectRatio ?? '1:1',
      qualityMode: qualityMode ?? 'STANDARD',
      outputType,
    };

    return {
      primaryInstruction: preserved.rawUserPrompt,
      projectContext: memory,
      referenceAssets: assets,
      lockedConstraints,
      outputRequirements,
    };
  },
};
