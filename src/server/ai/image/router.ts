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
  fallbackProvider?: ImageProviderName;
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
      return 'flux';
    case 'text_heavy_generate':
      return 'ideogram';
    case 'standard_generate':
    case 'simple_edit':
    case 'masked_edit':
    case 'reframe':
    case 'background_replace':
    default:
      return 'openai';
  }
}

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

  /**
   * Selects the best provider for the given input.
   * Priority: user override > router detection > default (openai).
   * Falls back to openai if the selected provider is unavailable.
   */
  route(input: ImageGenerateInput): RouterDecision {
    const usageType = detectUsageType(input.prompt, input);

    let providerName: ImageProviderName;
    let reason: string;

    if (input.providerOverride) {
      providerName = input.providerOverride;
      reason = `Sélection manuelle: ${providerName}`;
    } else {
      providerName = usageTypeToProvider(usageType);
      reason = this.buildReason(usageType, providerName);
    }

    const provider = this.providers.get(providerName);
    const fallbackName: ImageProviderName = 'openai';

    if (!provider?.isAvailable()) {
      const fallback = this.providers.get(fallbackName);
      if (fallback?.isAvailable()) {
        return {
          provider: fallbackName,
          usageType,
          reason: `${reason} (fallback: ${providerName} indisponible)`,
          fallbackProvider: providerName,
          estimatedCost: fallback.estimateCost(input),
        };
      }
      throw new Error('Aucun provider image disponible');
    }

    return {
      provider: providerName,
      usageType,
      reason,
      fallbackProvider: providerName !== fallbackName ? fallbackName : undefined,
      estimatedCost: provider.estimateCost(input),
    };
  }

  async generate(input: ImageGenerateInput): Promise<ImageProviderResult & { decision: RouterDecision }> {
    const decision = this.route(input);

    const primary = this.providers.get(decision.provider)!;

    try {
      const result = await primary.generateImage({
        ...input,
        usageType: decision.usageType,
      });
      return { ...result, decision };
    } catch (error) {
      console.error(
        `[ImageRouter] ${decision.provider} failed:`,
        error instanceof Error ? error.message : error,
      );

      if (decision.fallbackProvider) {
        const fallback = this.providers.get(decision.fallbackProvider);
        if (fallback?.isAvailable()) {
          console.log(`[ImageRouter] Falling back to ${decision.fallbackProvider}`);
          const fallbackResult = await fallback.generateImage(input);
          return {
            ...fallbackResult,
            decision: {
              ...decision,
              provider: decision.fallbackProvider,
              reason: `${decision.reason} → fallback ${decision.fallbackProvider}`,
            },
          };
        }
      }

      if (decision.provider !== 'openai') {
        const openai = this.providers.get('openai');
        if (openai?.isAvailable()) {
          console.log('[ImageRouter] Final fallback to openai');
          const openaiResult = await openai.generateImage(input);
          return {
            ...openaiResult,
            decision: {
              ...decision,
              provider: 'openai',
              reason: `${decision.reason} → fallback final openai`,
            },
          };
        }
      }

      throw error;
    }
  }

  private buildReason(type: ImageUsageType, provider: ImageProviderName): string {
    const reasons: Record<ImageUsageType, string> = {
      standard_generate: 'Génération standard → OpenAI (polyvalent)',
      premium_generate: 'Qualité premium → FLUX (photoréaliste)',
      text_heavy_generate: 'Texte intégré → Ideogram (typographie)',
      photorealistic_generate: 'Photoréaliste → FLUX (rendu pro)',
      product_generate: 'Photo produit → FLUX (packshot)',
      lifestyle_generate: 'Lifestyle → FLUX (mise en scène)',
      multi_reference_generate: 'Multi-référence → FLUX (cohérence)',
      simple_edit: 'Édition simple → OpenAI',
      masked_edit: 'Édition masque → OpenAI',
      reframe: 'Reframe → Ideogram',
      background_replace: 'Remplacement fond → Ideogram',
    };
    return reasons[type] ?? `Auto → ${provider}`;
  }
}

export const imageRouter = new ImageGenerationRouter();
