import { describe, it, expect } from 'vitest';
import { minimalEnrichmentService } from '@/server/services/prompt-grounding/minimal-enrichment.service';
import type { CanonicalRequest, AssetCollection, ProjectMemorySnapshot } from '@/server/services/prompt-grounding/types';

function makeCanonical(overrides?: Partial<CanonicalRequest>): CanonicalRequest {
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

  return {
    primaryInstruction: 'crée une affiche pub pro pour mon produit',
    projectContext: emptyMemory,
    referenceAssets: emptyAssets,
    lockedConstraints: {
      mustPreserveProduct: false,
      mustPreserveStyle: false,
      mustPreserveTone: false,
      lockedElements: [],
      requestedChanges: [],
    },
    outputRequirements: {
      targetPlatform: 'facebook',
      targetFormat: '1:1',
      aspectRatio: '1:1',
      qualityMode: 'STANDARD',
      outputType: 'generic_ad',
    },
    ...overrides,
  };
}

describe('MinimalEnrichmentService', () => {
  it('preserves raw user prompt in the output', () => {
    const canonical = makeCanonical();
    const result = minimalEnrichmentService.enrichLightly(canonical);
    expect(result.rawUserPrompt).toBe('crée une affiche pub pro pour mon produit');
    expect(result.finalPrompt).toContain('crée une affiche pub pro pour mon produit');
  });

  it('raw prompt is always present in finalPrompt', () => {
    const canonical = makeCanonical({
      primaryInstruction: 'create a luxury poster for my perfume',
    });
    const result = minimalEnrichmentService.enrichLightly(canonical);
    expect(result.finalPrompt).toContain('create a luxury poster for my perfume');
  });

  it('adds image instructions when assets are present', () => {
    const canonical = makeCanonical({
      referenceAssets: {
        assets: [
          {
            id: 'a1',
            url: 'data:image/png;base64,abc',
            role: 'PRIMARY_PRODUCT',
            roleConfidence: 0.9,
            visualSummary: 'tube blanc',
            objectSummary: 'crème anti-verrues',
            colorSummary: 'blanc, bleu',
            productImportanceScore: 1,
            styleImportanceScore: 0.3,
            identityPreservationScore: 0.9,
            isDataUrl: true,
          },
        ],
        primaryProduct: {
          id: 'a1',
          url: 'data:image/png;base64,abc',
          role: 'PRIMARY_PRODUCT',
          roleConfidence: 0.9,
          visualSummary: 'tube blanc',
          objectSummary: 'crème anti-verrues',
          colorSummary: 'blanc, bleu',
          productImportanceScore: 1,
          styleImportanceScore: 0.3,
          identityPreservationScore: 0.9,
          isDataUrl: true,
        },
        secondaryProducts: [],
        styleReferences: [],
        brandReferences: [],
        otherReferences: [],
        totalCount: 1,
        analyzedCount: 1,
        usedCount: 1,
      },
      lockedConstraints: {
        mustPreserveProduct: true,
        mustPreserveStyle: false,
        mustPreserveTone: false,
        lockedElements: ['produit principal importé'],
        requestedChanges: [],
      },
    });
    const result = minimalEnrichmentService.enrichLightly(canonical);
    expect(result.imageInstructions.length).toBeGreaterThan(0);
    expect(result.finalPrompt).toContain('reference image');
  });

  it('does not add excessive context that dwarfs the user prompt', () => {
    const userPrompt = 'affiche pub pour crème';
    const canonical = makeCanonical({ primaryInstruction: userPrompt });
    const result = minimalEnrichmentService.enrichLightly(canonical);
    const ratio = result.finalPrompt.length / userPrompt.length;
    expect(ratio).toBeLessThan(10);
  });
});
