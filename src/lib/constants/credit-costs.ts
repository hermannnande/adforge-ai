export const CREDIT_COSTS = {
  BRIEF_ANALYSIS: 0,
  CREATIVE_SUGGESTIONS: 0,
  GENERATION_DRAFT: 1,
  GENERATION_VARIATION: 1,
  EDIT_SIMPLE: 1,
  GENERATION_STANDARD: 2,
  PACK_MULTI_FORMAT: 2,
  GENERATION_PREMIUM: 5,
  BACKGROUND_REMOVAL: 1,
  UPSCALE: 1,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export const CREDIT_ACTION_LABELS: Record<CreditAction, string> = {
  BRIEF_ANALYSIS: 'Analyse de brief',
  CREATIVE_SUGGESTIONS: 'Suggestions créatives',
  GENERATION_DRAFT: 'Génération draft',
  GENERATION_VARIATION: 'Variation légère',
  EDIT_SIMPLE: 'Édition simple',
  GENERATION_STANDARD: 'Génération standard',
  PACK_MULTI_FORMAT: 'Pack multi-format',
  GENERATION_PREMIUM: 'Rendu premium',
  BACKGROUND_REMOVAL: 'Suppression arrière-plan',
  UPSCALE: 'Upscale',
};

export const PROVIDER_CREDIT_COSTS: Record<
  string,
  Record<string, number>
> = {
  openai: {
    draft: 1,
    standard: 2,
    premium: 4,
    edit: 1,
  },
  flux: {
    draft: 3,
    standard: 4,
    premium: 5,
    multi_reference: 6,
    edit: 3,
  },
  ideogram: {
    draft: 2,
    standard: 3,
    premium: 3,
    edit: 2,
    reframe: 1,
    background_replace: 2,
  },
  nanobanana: {
    draft: 1,
    standard: 1,
    premium: 2,
    edit: 1,
  },
};

export function getProviderCreditCost(
  provider: string,
  quality: string,
): number {
  const providerCosts = PROVIDER_CREDIT_COSTS[provider];
  if (!providerCosts) return CREDIT_COSTS.GENERATION_STANDARD;
  return providerCosts[quality] ?? providerCosts['standard'] ?? 2;
}
