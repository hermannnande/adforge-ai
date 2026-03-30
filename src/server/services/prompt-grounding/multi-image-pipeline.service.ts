import { prisma } from '@/lib/db/prisma';
import { assetAnalysisService } from '@/server/services/stateful';
import type {
  AssetRole,
  ClassifiedAsset,
  AssetCollection,
} from './types';

const ROLE_KEYWORDS: Record<AssetRole, RegExp[]> = {
  PRIMARY_PRODUCT: [/produit|product|tube|flacon|pot|boîte|paquet|emballage/i],
  SECONDARY_PRODUCT: [/secondaire|second|autre produit|accessoire/i],
  BRAND_REFERENCE: [/logo|marque|brand|identit[ée]/i],
  STYLE_REFERENCE: [/style|inspiration|ambiance|mood|design|référence/i],
  MODEL_REFERENCE: [/modèle|mannequin|personne|femme|homme|model/i],
  PACKAGING_REFERENCE: [/packaging|emballage|boîte|packaging/i],
  TEXT_REFERENCE: [/texte|typo|font|police|slogan/i],
  LAYOUT_REFERENCE: [/layout|mise en page|disposition|template/i],
  BACKGROUND_REFERENCE: [/fond|background|arrière[- ]?plan|décor/i],
  MOOD_REFERENCE: [/mood|humeur|atmosphère|feeling/i],
};

function guessRoleFromAnalysis(
  profile: { assetType?: string; visualDescription?: string } | null,
  index: number,
  total: number,
): { role: AssetRole; confidence: number } {
  if (!profile) {
    return {
      role: index === 0 ? 'PRIMARY_PRODUCT' : 'STYLE_REFERENCE',
      confidence: 0.3,
    };
  }

  const type = profile.assetType ?? 'unknown';
  const desc = (profile.visualDescription ?? '').toLowerCase();

  if (type === 'product_solo' || type === 'packaging') {
    if (index === 0) return { role: 'PRIMARY_PRODUCT', confidence: 0.9 };
    return { role: 'SECONDARY_PRODUCT', confidence: 0.7 };
  }

  if (type === 'logo') return { role: 'BRAND_REFERENCE', confidence: 0.9 };
  if (type === 'lifestyle') return { role: 'STYLE_REFERENCE', confidence: 0.7 };

  if (/femme|homme|person|model|mannequin/i.test(desc)) {
    return { role: 'MODEL_REFERENCE', confidence: 0.7 };
  }

  if (/fond|background|paysage|décor/i.test(desc)) {
    return { role: 'BACKGROUND_REFERENCE', confidence: 0.6 };
  }

  if (index === 0 && total <= 3) {
    return { role: 'PRIMARY_PRODUCT', confidence: 0.5 };
  }

  return { role: 'STYLE_REFERENCE', confidence: 0.4 };
}

function guessRoleFromContext(
  prompt: string,
  _index: number,
  _total: number,
): AssetRole | null {
  const lower = prompt.toLowerCase();

  for (const [role, patterns] of Object.entries(ROLE_KEYWORDS)) {
    for (const p of patterns) {
      if (p.test(lower)) return role as AssetRole;
    }
  }

  return null;
}

export const multiImagePipelineService = {
  /**
   * Collect ALL reference images for a generation request.
   * Combines: uploaded URLs, stored project assets, locked product references.
   * RULE: No image is silently dropped.
   */
  async buildAssetCollection(params: {
    projectId: string;
    referenceImageUrls: string[];
    userPrompt: string;
  }): Promise<AssetCollection> {
    const { projectId, referenceImageUrls, userPrompt } = params;
    const classified: ClassifiedAsset[] = [];

    const storedAssets = await prisma.asset.findMany({
      where: { projectId, type: 'REFERENCE' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        url: true,
        isPrimaryProduct: true,
        analysisProfile: true,
      },
    });

    const allUrls = new Set<string>();

    for (const url of referenceImageUrls) {
      allUrls.add(url);
    }

    for (const asset of storedAssets) {
      if (!allUrls.has(asset.url)) {
        allUrls.add(asset.url);
      }
    }

    const urlArray = Array.from(allUrls);
    const total = urlArray.length;

    for (let i = 0; i < urlArray.length; i++) {
      const url = urlArray[i];
      const isDataUrl = url.startsWith('data:');

      const matchingAsset = storedAssets.find((a) => a.url === url);
      const profile = matchingAsset?.analysisProfile as Record<string, unknown> | null;

      const contextRole = guessRoleFromContext(userPrompt, i, total);
      const analysisGuess = guessRoleFromAnalysis(
        profile as { assetType?: string; visualDescription?: string } | null,
        i,
        total,
      );

      const role = matchingAsset?.isPrimaryProduct
        ? 'PRIMARY_PRODUCT'
        : contextRole ?? analysisGuess.role;
      const confidence = matchingAsset?.isPrimaryProduct
        ? 1.0
        : contextRole
          ? 0.8
          : analysisGuess.confidence;

      classified.push({
        id: matchingAsset?.id ?? `inline-${i}`,
        url,
        role,
        roleConfidence: confidence,
        visualSummary: (profile?.visualDescription as string) ?? '',
        objectSummary: (profile?.canonicalProductDescription as string) ?? '',
        colorSummary: Array.isArray(profile?.dominantColors)
          ? (profile.dominantColors as string[]).join(', ')
          : '',
        productImportanceScore: role === 'PRIMARY_PRODUCT' ? 1.0
          : role === 'SECONDARY_PRODUCT' ? 0.7
          : 0.3,
        styleImportanceScore: role === 'STYLE_REFERENCE' || role === 'MOOD_REFERENCE' ? 0.8 : 0.3,
        identityPreservationScore: role === 'PRIMARY_PRODUCT' || role === 'SECONDARY_PRODUCT' ? 0.9 : 0.4,
        isDataUrl,
      });
    }

    const primaryProduct = classified.find((a) => a.role === 'PRIMARY_PRODUCT') ?? null;
    const secondaryProducts = classified.filter((a) => a.role === 'SECONDARY_PRODUCT');
    const styleReferences = classified.filter(
      (a) => a.role === 'STYLE_REFERENCE' || a.role === 'MOOD_REFERENCE',
    );
    const brandReferences = classified.filter(
      (a) => a.role === 'BRAND_REFERENCE' || a.role === 'TEXT_REFERENCE',
    );
    const otherReferences = classified.filter(
      (a) =>
        a.role !== 'PRIMARY_PRODUCT' &&
        a.role !== 'SECONDARY_PRODUCT' &&
        a.role !== 'STYLE_REFERENCE' &&
        a.role !== 'MOOD_REFERENCE' &&
        a.role !== 'BRAND_REFERENCE' &&
        a.role !== 'TEXT_REFERENCE',
    );

    return {
      assets: classified,
      primaryProduct,
      secondaryProducts,
      styleReferences,
      brandReferences,
      otherReferences,
      totalCount: classified.length,
      analyzedCount: classified.filter((a) => a.visualSummary.length > 0).length,
      usedCount: classified.length,
    };
  },

  /**
   * Ensure ALL referenced images are analyzed.
   * Triggers asset analysis for any unanalyzed stored asset.
   */
  async ensureAllAnalyzed(collection: AssetCollection): Promise<void> {
    for (const asset of collection.assets) {
      if (!asset.id.startsWith('inline-') && !asset.visualSummary) {
        try {
          await assetAnalysisService.ensureAnalyzed(asset.id);
        } catch {
          console.warn(`[MultiImage] Failed to analyze asset ${asset.id}`);
        }
      }
    }
  },

  /**
   * Build a structured multi-image context string for prompt enrichment.
   */
  buildImageContextString(collection: AssetCollection): string {
    if (collection.totalCount === 0) return '';

    const parts: string[] = [];
    parts.push(`${collection.totalCount} reference image(s) provided.`);

    if (collection.primaryProduct) {
      const pp = collection.primaryProduct;
      parts.push(
        `Primary product: ${pp.objectSummary || pp.visualSummary || 'imported product image'}. ` +
        'Preserve its exact appearance, packaging, colors, and branding.',
      );
    }

    if (collection.secondaryProducts.length > 0) {
      parts.push(
        `${collection.secondaryProducts.length} additional product image(s) — include them in the composition.`,
      );
    }

    if (collection.styleReferences.length > 0) {
      parts.push(
        `${collection.styleReferences.length} style/mood reference(s) — match the visual style and atmosphere.`,
      );
    }

    if (collection.brandReferences.length > 0) {
      parts.push(
        `${collection.brandReferences.length} brand reference(s) — respect branding identity.`,
      );
    }

    return parts.join(' ');
  },

  /**
   * Get all image URLs that should be sent to the provider.
   * RULE: ALL images are included. None dropped.
   */
  getAllImageUrls(collection: AssetCollection): string[] {
    return collection.assets.map((a) => a.url);
  },

  /**
   * Build usage reasoning log for audit.
   */
  buildUsageReasoningLog(collection: AssetCollection): string[] {
    return collection.assets.map((asset) => {
      return `[${asset.role}] ${asset.id.startsWith('inline-') ? 'inline' : 'stored'} (confidence: ${asset.roleConfidence.toFixed(2)}) — ${asset.visualSummary || 'no analysis'} — ${asset.isDataUrl ? 'data:' : 'URL'}`;
    });
  },
};
