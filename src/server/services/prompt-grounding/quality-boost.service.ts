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
  'high-end commercial photography',
  'shot on 85mm lens',
  'photorealistic',
  'crisp sharp focus',
  'natural and balanced lighting',
];

/**
 * Human/skin realism — critical for making AI images indistinguishable from real photos.
 */
const HUMAN_REALISM = [
  'authentic skin texture with visible pores',
  'natural skin look without plastic smoothing',
  'lifelike eyes and fine hair details',
  'realistic body proportions',
];

/**
 * Product photography realism.
 */
const PRODUCT_REALISM = [
  'sharp product details',
  'highly legible and clear text on packaging',
  'accurate material reflections',
  'perfectly lit product',
];

/**
 * Food photography realism.
 */
const FOOD_REALISM = [
  'appetizing food photography',
  'natural food colors',
  'visible steam and fresh textures',
  'shallow depth of field',
];

/**
 * Luxury/premium aesthetics.
 */
const LUXURY_REALISM = [
  'luxury editorial style',
  'dramatic but elegant lighting',
  'rich color palette',
  'premium material rendering',
];

/**
 * Advertising-specific quality markers.
 */
const AD_QUALITY = [
  'professional advertising layout',
  'clean composition',
  'magazine quality',
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
        'shot on medium format camera (Hasselblad)',
        'cinematic color grading',
        'award-winning photography',
      );
      applied.push('premium-boost');
    }

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
