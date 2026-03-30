import type { ConversationMemory } from './conversation-memory.service';
import type { LockedProductProfile } from './product-memory.service';

export interface CanonicalBrief {
  latestUserInput: string;
  isOnlyDelta: boolean;

  product: {
    name: string | null;
    category: string | null;
    visualDescription: string;
    dominantColors: string[];
    packagingType: string | null;
    shapeDescription: string;
    materialLook: string | null;
    brandWords: string[];
    hasImportedReference: boolean;
    mustPreserveIdentity: boolean;
  };

  conversation: {
    projectGoal: string | null;
    approvedTone: string | null;
    approvedAudience: string | null;
    approvedPlatform: string | null;
    approvedFormat: string | null;
    approvedVisualDirection: string | null;
    lockedInstructions: string[];
    currentDelta: string;
    fullSummary: string;
  };

  constraints: {
    mustPreserveProduct: boolean;
    mustPreserveStyle: boolean;
    mustPreserveTone: boolean;
    lockedElements: string[];
    requestedChanges: string[];
  };

  output: {
    targetPlatform: string;
    targetFormat: string;
    aspectRatio: string;
    qualityMode: string;
    realismLevel: string;
    minResolution: number;
  };

  brandKit: {
    name: string | null;
    tone: string | null;
    primaryColors: string[];
    fonts: string[];
    slogan: string | null;
  } | null;
}

function detectDelta(latestInput: string): {
  isOnlyDelta: boolean;
  requestedChanges: string[];
} {
  const lower = latestInput.toLowerCase();

  const deltaPatterns = [
    /plus\s+(premium|luxe|réaliste|lumineu|sombre|dynamique|coloré)/i,
    /ajoute\s+(un|une|des|le|la)/i,
    /change\s+(le|la|les)/i,
    /garde\s+(tout|le|la)/i,
    /même\s+chose\s+(mais|avec|sans)/i,
    /remplace\s+(le|la)/i,
    /mets?\s+(un|une|le|la|mon|ma)/i,
    /rend[s]?\s+(plus|moins)/i,
    /enlève|supprime|retire/i,
  ];

  const isOnlyDelta = deltaPatterns.some((p) => p.test(lower));
  const changes: string[] = [];

  if (/plus\s+(\w+)/i.test(lower)) changes.push(lower.match(/plus\s+(\w+)/i)![0]);
  if (/ajoute\s+(.+?)(?:\.|,|$)/i.test(lower)) changes.push(lower.match(/ajoute\s+(.+?)(?:\.|,|$)/i)![0]);
  if (/change\s+(.+?)(?:\.|,|$)/i.test(lower)) changes.push(lower.match(/change\s+(.+?)(?:\.|,|$)/i)![0]);

  return { isOnlyDelta, requestedChanges: changes };
}

export const canonicalBriefBuilder = {
  build(params: {
    latestUserInput: string;
    lockedProduct: LockedProductProfile | null;
    conversationMemory: ConversationMemory;
    brandKit?: {
      name: string;
      tone?: string | null;
      primaryColors: string[];
      fonts: string[];
      slogan?: string | null;
    } | null;
    qualityMode?: string;
    platform?: string;
    aspectRatio?: string;
  }): CanonicalBrief {
    const {
      latestUserInput,
      lockedProduct,
      conversationMemory,
      brandKit,
      qualityMode,
      platform,
      aspectRatio,
    } = params;

    const { isOnlyDelta, requestedChanges } = detectDelta(latestUserInput);

    const hasProduct = !!lockedProduct;
    const productProfile = lockedProduct;

    const lockedElements: string[] = [];
    if (hasProduct) {
      lockedElements.push('produit principal importé');
      if (productProfile!.mustPreserveProductShape) lockedElements.push('forme du produit');
      if (productProfile!.mustPreservePackagingLook) lockedElements.push('apparence du packaging');
      if (productProfile!.mustPreserveBrandingIfVisible) lockedElements.push('branding visible');
    }
    if (conversationMemory.approvedTone && isOnlyDelta) {
      lockedElements.push(`ton: ${conversationMemory.approvedTone}`);
    }
    lockedElements.push(...conversationMemory.lockedInstructions.slice(-5));

    return {
      latestUserInput,
      isOnlyDelta,

      product: {
        name: null,
        category: productProfile?.assetProfile.productCategoryGuess ?? null,
        visualDescription: productProfile?.canonicalVisualDescription ?? '',
        dominantColors: productProfile?.dominantColors ?? [],
        packagingType: productProfile?.packagingType ?? null,
        shapeDescription: productProfile?.shapeDescription ?? '',
        materialLook: productProfile?.materialLook ?? null,
        brandWords: productProfile?.brandTextDetected ?? [],
        hasImportedReference: hasProduct,
        mustPreserveIdentity: hasProduct,
      },

      conversation: {
        projectGoal: conversationMemory.projectGoal,
        approvedTone: conversationMemory.approvedTone,
        approvedAudience: conversationMemory.approvedAudience,
        approvedPlatform: conversationMemory.approvedPlatform ?? platform ?? null,
        approvedFormat: conversationMemory.approvedFormat ?? aspectRatio ?? null,
        approvedVisualDirection: conversationMemory.approvedVisualDirection,
        lockedInstructions: conversationMemory.lockedInstructions,
        currentDelta: isOnlyDelta ? latestUserInput : '',
        fullSummary: conversationMemory.fullSummary,
      },

      constraints: {
        mustPreserveProduct: hasProduct,
        mustPreserveStyle: isOnlyDelta && !!conversationMemory.approvedVisualDirection,
        mustPreserveTone: isOnlyDelta && !!conversationMemory.approvedTone,
        lockedElements,
        requestedChanges,
      },

      output: {
        targetPlatform: platform ?? conversationMemory.approvedPlatform ?? 'facebook',
        targetFormat: aspectRatio ?? conversationMemory.approvedFormat ?? '1:1',
        aspectRatio: aspectRatio ?? conversationMemory.approvedFormat ?? '1:1',
        qualityMode: qualityMode ?? 'STANDARD',
        realismLevel: 'high',
        minResolution: 1024,
      },

      brandKit: brandKit
        ? {
            name: brandKit.name,
            tone: brandKit.tone ?? null,
            primaryColors: brandKit.primaryColors,
            fonts: brandKit.fonts,
            slogan: brandKit.slogan ?? null,
          }
        : null,
    };
  },

  toPromptContext(brief: CanonicalBrief): string {
    const parts: string[] = [];

    if (brief.product.hasImportedReference) {
      parts.push(`PRODUIT PRINCIPAL: ${brief.product.visualDescription}`);
      if (brief.product.dominantColors.length > 0) {
        parts.push(`Couleurs produit: ${brief.product.dominantColors.join(', ')}`);
      }
      if (brief.product.packagingType) {
        parts.push(`Packaging: ${brief.product.packagingType}`);
      }
      if (brief.product.shapeDescription) {
        parts.push(`Forme: ${brief.product.shapeDescription}`);
      }
      parts.push('INSTRUCTION CRITIQUE: conserver fidèlement l\'apparence du produit importé');
    }

    if (brief.conversation.projectGoal) {
      parts.push(`Objectif projet: ${brief.conversation.projectGoal}`);
    }
    if (brief.conversation.approvedTone) {
      parts.push(`Ton validé: ${brief.conversation.approvedTone}`);
    }
    if (brief.conversation.approvedVisualDirection) {
      parts.push(`Direction visuelle: ${brief.conversation.approvedVisualDirection}`);
    }

    if (brief.constraints.lockedElements.length > 0) {
      parts.push(`Éléments verrouillés: ${brief.constraints.lockedElements.join(', ')}`);
    }

    if (brief.isOnlyDelta && brief.constraints.requestedChanges.length > 0) {
      parts.push(`Modifications demandées: ${brief.constraints.requestedChanges.join(', ')}`);
      parts.push('TOUT LE RESTE doit rester identique');
    }

    if (brief.brandKit) {
      parts.push(`Brand: ${brief.brandKit.name}`);
      if (brief.brandKit.primaryColors.length > 0) {
        parts.push(`Couleurs marque: ${brief.brandKit.primaryColors.join(', ')}`);
      }
    }

    return parts.join('\n');
  },
};
