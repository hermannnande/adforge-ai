import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.warn('🌱 Seeding database...');

  // Subscription Plans
  const plans = [
    {
      slug: 'starter',
      name: 'Starter',
      description: 'Idéal pour commencer avec la génération de visuels IA.',
      priceFcfa: 5_900,
      priceEur: 9.0,
      credits: 120,
      sortOrder: 1,
      features: JSON.stringify([
        '120 crédits / mois',
        'Agent IA conversationnel',
        'Bibliothèque de projets',
        '1 Brand Kit',
        'Export standard',
        'Support email',
      ]),
    },
    {
      slug: 'pro',
      name: 'Pro',
      description: 'Pour les créateurs et les PME qui veulent aller plus loin.',
      priceFcfa: 12_900,
      priceEur: 19.0,
      credits: 350,
      sortOrder: 2,
      features: JSON.stringify([
        '350 crédits / mois',
        'Agent IA conversationnel',
        'Bibliothèque illimitée',
        '5 Brand Kits',
        'Pack multi-format',
        'Export HD',
        'Prompt Memory',
        'Support prioritaire',
      ]),
    },
    {
      slug: 'studio',
      name: 'Studio',
      description: 'Pour les agences et les équipes qui créent à volume.',
      priceFcfa: 29_900,
      priceEur: 45.0,
      credits: 1_000,
      sortOrder: 3,
      features: JSON.stringify([
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
      ]),
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }
  console.warn(`  ✓ ${plans.length} subscription plans seeded`);

  // Credit Pricing Rules
  const pricingRules = [
    { action: 'BRIEF_ANALYSIS', label: 'Analyse de brief', costCredits: 0 },
    { action: 'CREATIVE_SUGGESTIONS', label: 'Suggestions créatives', costCredits: 0 },
    { action: 'GENERATION_DRAFT', label: 'Génération draft rapide', costCredits: 1 },
    { action: 'GENERATION_VARIATION', label: 'Variation légère', costCredits: 1 },
    { action: 'EDIT_SIMPLE', label: 'Édition simple', costCredits: 1 },
    { action: 'GENERATION_STANDARD', label: 'Génération standard', costCredits: 2 },
    { action: 'PACK_MULTI_FORMAT', label: 'Pack multi-format', costCredits: 2 },
    { action: 'GENERATION_PREMIUM', label: 'Rendu premium final', costCredits: 5 },
    { action: 'BACKGROUND_REMOVAL', label: 'Suppression arrière-plan', costCredits: 1 },
    { action: 'UPSCALE', label: 'Upscale', costCredits: 1 },
  ];

  for (const rule of pricingRules) {
    await prisma.creditPricingRule.upsert({
      where: { action: rule.action },
      update: rule,
      create: rule,
    });
  }
  console.warn(`  ✓ ${pricingRules.length} credit pricing rules seeded`);

  // Global Templates
  const templates = [
    {
      scope: 'GLOBAL' as const,
      name: 'Facebook Ads — Promotion produit',
      category: 'e-commerce',
      platform: 'FACEBOOK_ADS' as const,
      aspectRatio: '1:1',
      description: 'Affiche publicitaire 1:1 pour promouvoir un produit sur Facebook.',
      promptBase:
        'Create a professional Facebook ad for {productName}. Style: {style}. Include price, CTA, and product photo.',
    },
    {
      scope: 'GLOBAL' as const,
      name: 'Instagram Feed — Lancement produit',
      category: 'e-commerce',
      platform: 'INSTAGRAM_FEED' as const,
      aspectRatio: '4:5',
      description: 'Visuel 4:5 pour annoncer un nouveau produit sur Instagram.',
      promptBase:
        'Create a premium Instagram feed post announcing {productName}. Style: {style}. Minimalist, elegant.',
    },
    {
      scope: 'GLOBAL' as const,
      name: 'Story — Promo flash',
      category: 'promotion',
      platform: 'INSTAGRAM_STORY' as const,
      aspectRatio: '9:16',
      description: 'Story verticale pour une promotion limitée dans le temps.',
      promptBase:
        'Create an urgent promotional story for {productName}. Flash sale style. Bold text. {offer}.',
    },
    {
      scope: 'GLOBAL' as const,
      name: 'TikTok — Avant / Après',
      category: 'beauté',
      platform: 'TIKTOK_ADS' as const,
      aspectRatio: '9:16',
      description: 'Visuel avant/après pour TikTok Ads.',
      promptBase:
        'Create a before/after comparison ad for {productName}. Dramatic transformation. Split layout.',
    },
    {
      scope: 'GLOBAL' as const,
      name: 'Flyer — Restauration',
      category: 'restauration',
      platform: 'FLYER_PRINT' as const,
      aspectRatio: '3:4',
      description: 'Flyer imprimable pour un restaurant ou service traiteur.',
      promptBase:
        'Create a restaurant flyer for {productName}. Appetizing food photography. Menu highlights. {offer}.',
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.name.toLowerCase().replace(/\s+/g, '-').slice(0, 25) },
      update: {},
      create: t,
    });
  }
  console.warn(`  ✓ ${templates.length} global templates seeded`);

  console.warn('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
