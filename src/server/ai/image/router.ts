import type {
  ImageProvider,
  ImageProviderName,
  ImageGenerateInput,
  ImageProviderResult,
  ImageUsageType,
} from './types';
import { OpenAIImageProvider } from './openai.image-provider';
import { FluxImageProvider } from './flux.image-provider';
import { IdeogramImageProvider } from './ideogram.image-provider';

const PHOTOREALISTIC_PATTERNS =
  /photo\s*r[ée]al|ultra\s*r[ée]al|r[ée]aliste|photo\s*produit|product\s*photo|lifestyle|mise\s*en\s*sc[eè]ne|coh[ée]ren|m[eê]me\s*produit|studio\s*lighting|packshot/i;

const TEXT_HEAVY_PATTERNS =
  /texte\s*(dans|sur|visible|lisible)|affiche\s*avec\s*texte|poster|slogan|miniature\s*branding|logo.*poster|text\s*in\s*image|headline.*visible|gros\s*texte|typo(graphi)?/i;

const MULTI_REF_PATTERNS =
  /plusieurs?\s*(r[ée]f[ée]ren|image|photo)|multi[- ]?r[ée]f|garder?\s*la\s*coh[ée]ren|same\s*product/i;

export interface RouterDecision {
  provider: ImageProviderName;
  usageType: ImageUsageType;
  reason: string;
  fallbackChain: ImageProviderName[];
  estimatedCost: number;
}

function detectUsageType(prompt: string, input: ImageGenerateInput): ImageUsageType {
  if (input.referenceImages && input.referenceImages.length > 1) {
    return 'multi_reference_generate';
  }
  if (MULTI_REF_PATTERNS.test(prompt)) return 'multi_reference_generate';
  if (TEXT_HEAVY_PATTERNS.test(prompt)) return 'text_heavy_generate';
  if (PHOTOREALISTIC_PATTERNS.test(prompt)) {
    if (input.quality === 'premium') return 'premium_generate';
    return 'photorealistic_generate';
  }
  if (input.quality === 'premium') return 'premium_generate';
  return 'standard_generate';
}

function usageTypeToProvider(type: ImageUsageType): ImageProviderName {
  switch (type) {
    case 'photorealistic_generate':
    case 'product_generate':
    case 'lifestyle_generate':
    case 'multi_reference_generate':
    case 'premium_generate':
    case 'standard_generate':
      return 'flux';
    case 'text_heavy_generate':
      return 'flux';
    case 'simple_edit':
    case 'masked_edit':
    case 'reframe':
    case 'background_replace':
    default:
      return 'openai';
  }
}

const FALLBACK_ORDER: Record<ImageProviderName, ImageProviderName[]> = {
  openai: ['flux'],
  flux: ['openai'],
  ideogram: ['flux', 'openai'],
};

export class ImageGenerationRouter {
  private providers: Map<ImageProviderName, ImageProvider>;

  constructor() {
    this.providers = new Map();
    this.providers.set('openai', new OpenAIImageProvider());
    this.providers.set('flux', new FluxImageProvider());
    this.providers.set('ideogram', new IdeogramImageProvider());
  }

  getProvider(name: ImageProviderName): ImageProvider | undefined {
    return this.providers.get(name);
  }

  getAvailableProviders(): ImageProviderName[] {
    return Array.from(this.providers.entries())
      .filter(([, p]) => p.isAvailable())
      .map(([name]) => name);
  }

  route(input: ImageGenerateInput): RouterDecision {
    const usageType = detectUsageType(input.prompt, input);

    let providerName: ImageProviderName;
    let reason: string;

    if (input.providerOverride) {
      providerName = input.providerOverride;
      reason = `Sélection manuelle`;
    } else {
      providerName = usageTypeToProvider(usageType);
      reason = this.buildReason(usageType);
    }

    const fallbackChain = (FALLBACK_ORDER[providerName] ?? []).filter(
      (name) => this.providers.get(name)?.isAvailable(),
    );

    const provider = this.providers.get(providerName);

    if (!provider?.isAvailable()) {
      const firstAvailable = fallbackChain[0];
      if (firstAvailable) {
        const fb = this.providers.get(firstAvailable)!;
        return {
          provider: firstAvailable,
          usageType,
          reason: `${reason} (moteur principal indisponible)`,
          fallbackChain: fallbackChain.slice(1),
          estimatedCost: fb.estimateCost(input),
        };
      }
      throw new Error('Aucun moteur de génération d\'image disponible');
    }

    return {
      provider: providerName,
      usageType,
      reason,
      fallbackChain,
      estimatedCost: provider.estimateCost(input),
    };
  }

  async generate(
    input: ImageGenerateInput,
  ): Promise<ImageProviderResult & { decision: RouterDecision }> {
    const decision = this.route(input);

    const tryOrder = [decision.provider, ...decision.fallbackChain];
    let lastError: unknown = null;

    for (const name of tryOrder) {
      const provider = this.providers.get(name);
      if (!provider?.isAvailable()) continue;

      try {
        console.log(`[ImageRouter] Trying ${name}...`);
        const result = await provider.generateImage({
          ...input,
          usageType: decision.usageType,
        });
        return {
          ...result,
          decision: {
            ...decision,
            provider: name,
            reason:
              name === decision.provider
                ? decision.reason
                : `${decision.reason} → basculé sur moteur alternatif`,
          },
        };
      } catch (error) {
        lastError = error;
        console.error(
          `[ImageRouter] ${name} failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    throw lastError ?? new Error('Tous les moteurs de génération ont échoué');
  }

  private buildReason(type: ImageUsageType): string {
    const reasons: Record<ImageUsageType, string> = {
      standard_generate: 'Moteur standard — polyvalent',
      premium_generate: 'Moteur premium — photoréaliste',
      text_heavy_generate: 'Moteur créatif — typographie optimisée',
      photorealistic_generate: 'Moteur premium — rendu professionnel',
      product_generate: 'Moteur premium — photo produit',
      lifestyle_generate: 'Moteur premium — mise en scène',
      multi_reference_generate: 'Moteur premium — cohérence multi-référence',
      simple_edit: 'Édition standard',
      masked_edit: 'Édition avec masque',
      reframe: 'Recadrage intelligent',
      background_replace: 'Remplacement d\'arrière-plan',
    };
    return reasons[type] ?? 'Sélection automatique';
  }
}

export const imageRouter = new ImageGenerationRouter();
