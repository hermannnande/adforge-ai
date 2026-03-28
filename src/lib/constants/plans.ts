export const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    priceFCFA: 5_900,
    priceEUR: 9,
    credits: 120,
    features: [
      '120 crédits / mois',
      'Agent IA conversationnel',
      'Bibliothèque de projets',
      '1 Brand Kit',
      'Export standard',
      'Support email',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    priceFCFA: 12_900,
    priceEUR: 19,
    credits: 350,
    popular: true,
    features: [
      '350 crédits / mois',
      'Agent IA conversationnel',
      'Bibliothèque illimitée',
      '5 Brand Kits',
      'Pack multi-format',
      'Export HD',
      'Prompt Memory',
      'Support prioritaire',
    ],
  },
  STUDIO: {
    id: 'studio',
    name: 'Studio',
    priceFCFA: 29_900,
    priceEUR: 45,
    credits: 1_000,
    features: [
      '1 000 crédits / mois',
      'Agent IA conversationnel',
      'Bibliothèque illimitée',
      'Brand Kits illimités',
      'Pack multi-format',
      'Export HD + Print',
      'Prompt Memory',
      'Templates premium',
      'Accès anticipé nouveautés',
      'Support dédié',
    ],
  },
} as const;

export const TOPUP_PACKS = [
  { credits: 50, priceFCFA: 2_900, priceEUR: 4.5 },
  { credits: 150, priceFCFA: 7_500, priceEUR: 11.5 },
  { credits: 500, priceFCFA: 19_900, priceEUR: 30 },
] as const;

export const FREE_TRIAL_CREDITS = 20;
export const FREE_TRIAL_DAYS = 14;
