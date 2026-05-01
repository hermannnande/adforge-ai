import { ProviderName, GenerationTaskType } from '@/lib/ai/enums';
import type { ProviderCapabilityProfile } from '@/lib/ai/types';

const CAPABILITIES: Record<ProviderName, ProviderCapabilityProfile> = {
  [ProviderName.OPENAI]: {
    name: ProviderName.OPENAI,
    generalistScore: 9,
    photorealismScore: 7,
    typographyScore: 7,
    posterScore: 7,
    editScore: 9,
    multiReferenceScore: 6,
    async: false,
    supportsNegativePrompt: true,
    supportsExactTextReliability: 'medium',
    temporaryAssetUrl: false,
    maxConcurrent: 10,
  },
  [ProviderName.FLUX]: {
    name: ProviderName.FLUX,
    generalistScore: 7,
    photorealismScore: 10,
    typographyScore: 5,
    posterScore: 6,
    editScore: 8,
    multiReferenceScore: 9,
    async: true,
    supportsNegativePrompt: false,
    supportsExactTextReliability: 'low',
    temporaryAssetUrl: false,
    maxConcurrent: 5,
  },
  [ProviderName.IDEOGRAM]: {
    name: ProviderName.IDEOGRAM,
    generalistScore: 7,
    photorealismScore: 7,
    typographyScore: 10,
    posterScore: 10,
    editScore: 7,
    multiReferenceScore: 5,
    async: false,
    supportsNegativePrompt: true,
    supportsExactTextReliability: 'high',
    temporaryAssetUrl: true,
    maxConcurrent: 8,
  },
  [ProviderName.NANOBANANA]: {
    name: ProviderName.NANOBANANA,
    generalistScore: 9,
    photorealismScore: 9,
    typographyScore: 9,
    posterScore: 8,
    editScore: 9,
    multiReferenceScore: 10,
    async: false,
    supportsNegativePrompt: false,
    supportsExactTextReliability: 'high',
    temporaryAssetUrl: false,
    maxConcurrent: 10,
  },
};

const TASK_SUPPORT: Record<ProviderName, Set<GenerationTaskType>> = {
  [ProviderName.OPENAI]: new Set(Object.values(GenerationTaskType)),
  [ProviderName.FLUX]: new Set([
    GenerationTaskType.GENERAL_AD_VISUAL,
    GenerationTaskType.PHOTOREALISTIC_AD,
    GenerationTaskType.PRODUCT_SHOT,
    GenerationTaskType.LIFESTYLE_SCENE,
    GenerationTaskType.MULTI_REFERENCE_EDIT,
    GenerationTaskType.PREMIUM_RENDER,
    GenerationTaskType.IMAGE_EDIT,
    GenerationTaskType.SOCIAL_AD_SQUARE,
    GenerationTaskType.STORY_VERTICAL,
    GenerationTaskType.QUICK_DRAFT,
  ]),
  [ProviderName.IDEOGRAM]: new Set([
    GenerationTaskType.GENERAL_AD_VISUAL,
    GenerationTaskType.POSTER_TEXT_HEAVY,
    GenerationTaskType.LOGO_LIKE_TEXT_VISUAL,
    GenerationTaskType.SOCIAL_AD_SQUARE,
    GenerationTaskType.STORY_VERTICAL,
    GenerationTaskType.IMAGE_EDIT,
    GenerationTaskType.BACKGROUND_REPLACE,
    GenerationTaskType.QUICK_DRAFT,
    GenerationTaskType.PHOTOREALISTIC_AD,
    GenerationTaskType.PREMIUM_RENDER,
  ]),
  [ProviderName.NANOBANANA]: new Set(Object.values(GenerationTaskType)),
};

export const providerCapabilityRegistry = {
  getCapabilities(provider: ProviderName): ProviderCapabilityProfile {
    return CAPABILITIES[provider];
  },

  listAvailableProviders(): ProviderName[] {
    // NANOBANANA reste le moteur principal (meilleur score sur la plupart des
    // tâches). OPENAI est ré-activé comme fallback si Gemini échoue (429,
    // quota, safety filter). FLUX et IDEOGRAM restent désactivés tant que
    // leurs clés API ne sont pas configurées en prod.
    return Object.values(ProviderName).filter(
      (p) => p !== ProviderName.IDEOGRAM && p !== ProviderName.FLUX,
    );
  },

  supportsTask(provider: ProviderName, taskType: GenerationTaskType): boolean {
    return TASK_SUPPORT[provider]?.has(taskType) ?? false;
  },

  getAllCapabilities(): Map<ProviderName, ProviderCapabilityProfile> {
    return new Map(Object.entries(CAPABILITIES) as [ProviderName, ProviderCapabilityProfile][]);
  },
};
