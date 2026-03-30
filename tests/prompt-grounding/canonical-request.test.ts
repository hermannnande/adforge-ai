import { describe, it, expect } from 'vitest';
import { canonicalRequestService } from '@/server/services/prompt-grounding/canonical-request.service';
import type { PreservedPrompt, AssetCollection, ProjectMemorySnapshot } from '@/server/services/prompt-grounding/types';

const emptyMemory: ProjectMemorySnapshot = {
  projectTheme: null,
  projectGoal: null,
  preferredOutputType: null,
  approvedStyleDirection: null,
  lockedProductReferences: [],
  lockedBrandHints: [],
  lockedVisualIntent: null,
  conversationSummary: '',
  lastAcceptedDirection: null,
  activeMarketingGoal: null,
};

const emptyAssets: AssetCollection = {
  assets: [],
  primaryProduct: null,
  secondaryProducts: [],
  styleReferences: [],
  brandReferences: [],
  otherReferences: [],
  totalCount: 0,
  analyzedCount: 0,
  usedCount: 0,
};

describe('CanonicalRequestService', () => {
  it('primaryInstruction is always the raw user prompt', () => {
    const preserved: PreservedPrompt = {
      rawUserPrompt: 'crée une affiche pour ma crème',
      normalizedPrompt: 'crée une affiche pour ma crème',
      coreIntent: 'crée une affiche pour ma crème',
      detectedLanguage: 'fr',
      isRetouchRequest: false,
      isDeltaRequest: false,
    };

    const result = canonicalRequestService.buildCanonicalRequest({
      preserved,
      assets: emptyAssets,
      memory: emptyMemory,
    });

    expect(result.primaryInstruction).toBe('crée une affiche pour ma crème');
  });

  it('includes locked constraints when product is imported', () => {
    const preserved: PreservedPrompt = {
      rawUserPrompt: 'ajoute une femme noire',
      normalizedPrompt: 'ajoute une femme noire',
      coreIntent: 'ajoute une femme noire',
      detectedLanguage: 'fr',
      isRetouchRequest: false,
      isDeltaRequest: true,
    };

    const assetsWithProduct: AssetCollection = {
      ...emptyAssets,
      primaryProduct: {
        id: 'a1',
        url: 'data:image/png;base64,abc',
        role: 'PRIMARY_PRODUCT',
        roleConfidence: 0.9,
        visualSummary: 'crème blanche',
        objectSummary: 'crème',
        colorSummary: 'blanc',
        productImportanceScore: 1,
        styleImportanceScore: 0.3,
        identityPreservationScore: 0.9,
        isDataUrl: true,
      },
      totalCount: 1,
      analyzedCount: 1,
      usedCount: 1,
    };

    const result = canonicalRequestService.buildCanonicalRequest({
      preserved,
      assets: assetsWithProduct,
      memory: {
        ...emptyMemory,
        projectGoal: 'affiche pub crème',
        approvedStyleDirection: 'réaliste',
      },
    });

    expect(result.lockedConstraints.mustPreserveProduct).toBe(true);
    expect(result.lockedConstraints.mustPreserveStyle).toBe(true);
  });

  it('detects poster output type from prompt', () => {
    const preserved: PreservedPrompt = {
      rawUserPrompt: 'crée un poster professionnel',
      normalizedPrompt: 'crée un poster professionnel',
      coreIntent: 'crée un poster professionnel',
      detectedLanguage: 'fr',
      isRetouchRequest: false,
      isDeltaRequest: false,
    };

    const result = canonicalRequestService.buildCanonicalRequest({
      preserved,
      assets: emptyAssets,
      memory: emptyMemory,
    });

    expect(result.outputRequirements.outputType).toBe('poster');
  });
});
