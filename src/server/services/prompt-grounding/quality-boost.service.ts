/**
 * Quality Boost Service
 *
 * Appends quality and realism enhancement instructions to the user's prompt.
 * RULE: The user's original prompt is NEVER modified — only APPENDED after.
 *
 * The goal: produce images that are indistinguishable from real professional
 * photography, especially for human skin, products, and advertising materials.
 */

const HUMAN_PATTERNS = /femme|homme|personne|modèle|mannequin|enfant|bébé|visage|portrait|woman|man|person|model|face|people|girl|boy|lady|human|skin|peau/i;

const PRODUCT_PATTERNS = /produit|product|tube|flacon|pot|crème|cream|bouteille|bottle|packaging|emballage|boîte|box/i;

const FOOD_PATTERNS = /restaurant|food|nourriture|pizza|burger|café|boisson|gâteau|plat|dish|meal|drink/i;

const LUXURY_PATTERNS = /luxe|luxury|premium|bijou|jewelry|montre|watch|parfum|perfume|or|gold|diamant/i;

interface QualityBoost {
  suffix: string;
  appliedEnhancements: string[];
}

/**
 * Core quality enhancers that ALWAYS apply — professional advertising standard.
 */
const CORE_QUALITY = [
  'ultra high resolution',
  'sharp focus throughout',
  'professional advertising photography',
  'masterful lighting',
  'clean and polished composition',
  '8K render quality',
];

/**
 * Human/skin realism — critical for making AI images indistinguishable from real photos.
 */
const HUMAN_REALISM = [
  'hyper-realistic human skin with natural pores, subtle imperfections, and micro-texture detail',
  'natural skin subsurface scattering',
  'realistic skin tone variations and natural flush',
  'natural hair strands with individual hair detail',
  'photorealistic eyes with natural catchlights and iris detail',
  'natural body proportions',
  'realistic fabric interaction with the body',
  'natural depth of field on the person',
];

/**
 * Product photography realism.
 */
const PRODUCT_REALISM = [
  'studio-quality product photography',
  'precise material rendering — accurate reflection, refraction, and surface texture',
  'perfect label and packaging detail',
  'professional product lighting with soft gradients and controlled highlights',
  'accurate color reproduction',
  'crisp edge detail on product contours',
];

/**
 * Food photography realism.
 */
const FOOD_REALISM = [
  'appetizing food photography',
  'realistic food textures and steam',
  'warm inviting lighting',
  'shallow depth of field focusing on the dish',
  'natural food colors and freshness',
];

/**
 * Luxury/premium aesthetics.
 */
const LUXURY_REALISM = [
  'luxury editorial photography',
  'dramatic lighting with deep shadows and highlights',
  'rich and opulent color palette',
  'premium surface textures — silk, gold, marble, crystal',
  'cinematic depth of field',
];

/**
 * Advertising-specific quality markers.
 */
const AD_QUALITY = [
  'professional advertising standard',
  'commercial-grade composition',
  'print-ready resolution and sharpness',
  'balanced visual hierarchy',
  'clean negative space where appropriate',
];

export const qualityBoostService = {
  /**
   * Build a quality enhancement suffix based on prompt content analysis.
   * The suffix is appended AFTER the user's raw prompt.
   */
  buildQualityBoost(userPrompt: string, qualityMode: string): QualityBoost {
    const enhancements: string[] = [];
    const applied: string[] = [];

    enhancements.push(...CORE_QUALITY);
    applied.push('core-quality');

    enhancements.push(...AD_QUALITY);
    applied.push('advertising-quality');

    if (HUMAN_PATTERNS.test(userPrompt)) {
      enhancements.push(...HUMAN_REALISM);
      applied.push('human-realism');
    }

    if (PRODUCT_PATTERNS.test(userPrompt)) {
      enhancements.push(...PRODUCT_REALISM);
      applied.push('product-realism');
    }

    if (FOOD_PATTERNS.test(userPrompt)) {
      enhancements.push(...FOOD_REALISM);
      applied.push('food-realism');
    }

    if (LUXURY_PATTERNS.test(userPrompt)) {
      enhancements.push(...LUXURY_REALISM);
      applied.push('luxury-realism');
    }

    if (qualityMode === 'PREMIUM') {
      enhancements.push(
        'cinematic color grading',
        'professional retouching quality',
        'award-winning photography composition',
        'medium format camera quality',
        'phase one IQ4 150MP level of detail',
      );
      applied.push('premium-boost');
    }

    enhancements.push(
      'no visual artifacts',
      'no AI-looking distortions',
      'no uncanny valley effect',
      'natural and believable overall result',
    );
    applied.push('anti-ai-artifacts');

    const suffix = '\n\nStyle & Quality: ' + enhancements.join(', ') + '.';

    return { suffix, appliedEnhancements: applied };
  },

  /**
   * Apply the quality boost to a user prompt.
   * Returns: userPrompt + quality suffix
   */
  enhance(userPrompt: string, qualityMode: string): string {
    const boost = this.buildQualityBoost(userPrompt, qualityMode);
    return userPrompt + boost.suffix;
  },
};
