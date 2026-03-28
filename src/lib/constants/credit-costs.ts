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
