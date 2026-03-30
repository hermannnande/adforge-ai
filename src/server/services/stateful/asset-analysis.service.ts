import { prisma } from '@/lib/db/prisma';
import { aiRegistry } from '@/server/ai/providers';

export interface AssetVisualProfile {
  assetId: string;
  assetType: 'product_solo' | 'packaging' | 'logo' | 'lifestyle' | 'unknown';
  isPrimaryProductReference: boolean;
  productCategoryGuess: string | null;
  packagingType: string | null;
  dominantColors: string[];
  logoPresence: boolean;
  textPresence: boolean;
  visibleBrandWords: string[];
  visualDescription: string;
  shapeDescription: string;
  materialLook: string | null;
  orientation: 'vertical' | 'horizontal' | 'square';
  backgroundType: 'clean' | 'complex' | 'transparent';
  qualityScore: number;
  needsCutout: boolean;
  needsUpscale: boolean;
  canonicalProductDescription: string;
  analyzedAt: string;
}

const FALLBACK_PROFILE: Omit<AssetVisualProfile, 'assetId' | 'analyzedAt'> = {
  assetType: 'unknown',
  isPrimaryProductReference: true,
  productCategoryGuess: null,
  packagingType: null,
  dominantColors: [],
  logoPresence: false,
  textPresence: false,
  visibleBrandWords: [],
  visualDescription: 'produit importé par l\'utilisateur',
  shapeDescription: 'forme non déterminée',
  materialLook: null,
  orientation: 'vertical',
  backgroundType: 'complex',
  qualityScore: 5,
  needsCutout: false,
  needsUpscale: false,
  canonicalProductDescription: 'produit importé, à préserver fidèlement dans les générations',
};

function parseVisionResponse(text: string, assetId: string): AssetVisualProfile {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      assetId,
      assetType: parsed.assetType ?? 'unknown',
      isPrimaryProductReference: parsed.isPrimaryProductReference ?? true,
      productCategoryGuess: parsed.productCategoryGuess ?? null,
      packagingType: parsed.packagingType ?? null,
      dominantColors: Array.isArray(parsed.dominantColors) ? parsed.dominantColors : [],
      logoPresence: parsed.logoPresence ?? false,
      textPresence: parsed.textPresence ?? false,
      visibleBrandWords: Array.isArray(parsed.visibleBrandWords) ? parsed.visibleBrandWords : [],
      visualDescription: parsed.visualDescription ?? 'produit importé',
      shapeDescription: parsed.shapeDescription ?? '',
      materialLook: parsed.materialLook ?? null,
      orientation: parsed.orientation ?? 'vertical',
      backgroundType: parsed.backgroundType ?? 'complex',
      qualityScore: typeof parsed.qualityScore === 'number' ? parsed.qualityScore : 5,
      needsCutout: parsed.needsCutout ?? false,
      needsUpscale: parsed.needsUpscale ?? false,
      canonicalProductDescription: parsed.canonicalProductDescription ?? parsed.visualDescription ?? '',
      analyzedAt: new Date().toISOString(),
    };
  } catch {
    return {
      ...FALLBACK_PROFILE,
      assetId,
      analyzedAt: new Date().toISOString(),
    };
  }
}

const VISION_PROMPT = `Analyse cette image de produit pour un système de génération publicitaire.
Réponds UNIQUEMENT en JSON valide avec ces champs :
{
  "assetType": "product_solo" | "packaging" | "logo" | "lifestyle" | "unknown",
  "isPrimaryProductReference": true,
  "productCategoryGuess": "cosmétique" | "alimentaire" | "technologie" | "mode" | etc.,
  "packagingType": "tube" | "pot" | "flacon" | "boîte" | "sachet" | null,
  "dominantColors": ["blanc", "bleu", ...],
  "logoPresence": true/false,
  "textPresence": true/false,
  "visibleBrandWords": ["NomMarque", ...],
  "visualDescription": "description détaillée du produit visible",
  "shapeDescription": "forme du produit: tube vertical, boîte rectangulaire, etc.",
  "materialLook": "plastique mat" | "verre" | "carton" | "métal" | null,
  "orientation": "vertical" | "horizontal" | "square",
  "backgroundType": "clean" | "complex" | "transparent",
  "qualityScore": 1-10,
  "needsCutout": true/false,
  "needsUpscale": true/false,
  "canonicalProductDescription": "description normalisée pour les prompts de génération (ex: tube blanc et bleu vertical, style pharmaceutique, texte visible)"
}`;

export const assetAnalysisService = {
  async analyzeAsset(assetId: string): Promise<AssetVisualProfile> {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error(`Asset ${assetId} not found`);

    if (asset.analysisProfile) {
      const existing = asset.analysisProfile as unknown as AssetVisualProfile;
      if (existing.analyzedAt) return existing;
    }

    const provider = aiRegistry.getDefaultTextProviderOrNull();

    if (!provider || !asset.url.startsWith('data:')) {
      const fallback: AssetVisualProfile = {
        ...FALLBACK_PROFILE,
        assetId,
        analyzedAt: new Date().toISOString(),
      };
      await prisma.asset.update({
        where: { id: assetId },
        data: { analysisProfile: JSON.parse(JSON.stringify(fallback)) },
      });
      return fallback;
    }

    try {
      const result = await provider.generateText({
        systemPrompt: VISION_PROMPT,
        userPrompt: 'Analyse cette image produit.',
        temperature: 0.2,
        maxTokens: 800,
        model: 'gpt-4o-mini',
        images: [asset.url],
      });

      const profile = parseVisionResponse(result.text, assetId);

      await prisma.asset.update({
        where: { id: assetId },
        data: { analysisProfile: JSON.parse(JSON.stringify(profile)) },
      });

      return profile;
    } catch (err) {
      console.error('[AssetAnalysis] Vision analysis failed:', err);
      const fallback: AssetVisualProfile = {
        ...FALLBACK_PROFILE,
        assetId,
        analyzedAt: new Date().toISOString(),
      };
      await prisma.asset.update({
        where: { id: assetId },
        data: { analysisProfile: JSON.parse(JSON.stringify(fallback)) },
      });
      return fallback;
    }
  },

  async ensureAnalyzed(assetId: string): Promise<AssetVisualProfile> {
    return this.analyzeAsset(assetId);
  },

  async getProfile(assetId: string): Promise<AssetVisualProfile | null> {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { analysisProfile: true },
    });
    return (asset?.analysisProfile as unknown as AssetVisualProfile) ?? null;
  },
};
