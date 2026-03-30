import { describe, it, expect } from 'vitest';
import {
  detectTaskType,
  detectTextRequirement,
  detectRealismLevel,
  extractStyleIntent,
  negativeToPositiveForFlux,
} from '@/lib/ai/heuristics';
import { GenerationTaskType, TextRequirementMode } from '@/lib/ai/enums';

describe('detectTaskType', () => {
  it('detects photorealistic ad', () => {
    expect(detectTaskType('photo réaliste d\'un parfum en studio', 0))
      .toBe(GenerationTaskType.PHOTOREALISTIC_AD);
  });

  it('detects product shot', () => {
    expect(detectTaskType('photo produit d\'une bouteille packshot', 0))
      .toBe(GenerationTaskType.PRODUCT_SHOT);
  });

  it('detects text-heavy poster', () => {
    expect(detectTaskType('affiche avec gros texte et slogan', 0))
      .toBe(GenerationTaskType.POSTER_TEXT_HEAVY);
  });

  it('detects logo-like visual', () => {
    expect(detectTaskType('poster logo brand identité visuelle', 0))
      .toBe(GenerationTaskType.LOGO_LIKE_TEXT_VISUAL);
  });

  it('detects lifestyle scene', () => {
    expect(detectTaskType('mise en scène lifestyle réaliste', 0))
      .toBe(GenerationTaskType.LIFESTYLE_SCENE);
  });

  it('detects multi-reference edit', () => {
    expect(detectTaskType('garde la cohérence entre plusieurs images', 2))
      .toBe(GenerationTaskType.MULTI_REFERENCE_EDIT);
  });

  it('detects background replace', () => {
    expect(detectTaskType('remplace le fond de cette image', 1))
      .toBe(GenerationTaskType.BACKGROUND_REPLACE);
  });

  it('detects image edit', () => {
    expect(detectTaskType('modifie cette image', 1))
      .toBe(GenerationTaskType.IMAGE_EDIT);
  });

  it('falls back to general ad', () => {
    expect(detectTaskType('crée une pub pour mon commerce', 0))
      .toBe(GenerationTaskType.GENERAL_AD_VISUAL);
  });

  it('detects story vertical', () => {
    expect(detectTaskType('format story vertical', 0))
      .toBe(GenerationTaskType.STORY_VERTICAL);
  });
});

describe('detectTextRequirement', () => {
  it('detects exact text with quotes', () => {
    const result = detectTextRequirement('mets ce texte "Promo -50%"');
    expect(result.mode).toBe(TextRequirementMode.EXACT);
    expect(result.exactTexts).toContain('Promo -50%');
  });

  it('detects exact text with price', () => {
    const result = detectTextRequirement('prix 9900 FCFA');
    expect(result.mode).toBe(TextRequirementMode.EXACT);
    expect(result.level).toBe('high');
  });

  it('detects exact text with phone', () => {
    const result = detectTextRequirement('Whatsapp +225 07 00 00 00');
    expect(result.mode).toBe(TextRequirementMode.EXACT);
  });

  it('detects approximate text', () => {
    const result = detectTextRequirement('affiche avec texte visible');
    expect(result.mode).toBe(TextRequirementMode.APPROXIMATE);
  });

  it('returns none for no text', () => {
    const result = detectTextRequirement('photo de sneakers');
    expect(result.mode).toBe(TextRequirementMode.NONE);
  });
});

describe('detectRealismLevel', () => {
  it('detects high realism', () => {
    expect(detectRealismLevel('ultra réaliste photo studio')).toBe('high');
  });

  it('detects low realism for illustration', () => {
    expect(detectRealismLevel('illustration cartoon flat design')).toBe('low');
  });

  it('defaults to medium', () => {
    expect(detectRealismLevel('crée une pub')).toBe('medium');
  });
});

describe('extractStyleIntent', () => {
  it('extracts luxury style', () => {
    expect(extractStyleIntent('style luxe premium')).toContain('luxury');
  });

  it('extracts multiple styles', () => {
    const styles = extractStyleIntent('design moderne et minimaliste');
    expect(styles).toContain('modern');
    expect(styles).toContain('minimal');
  });

  it('defaults to modern', () => {
    expect(extractStyleIntent('crée une image')).toEqual(['modern']);
  });
});

describe('negativeToPositiveForFlux', () => {
  it('converts known negatives', () => {
    const result = negativeToPositiveForFlux(['blurry', 'low quality']);
    expect(result).toContain('sharp and clear focus');
    expect(result).toContain('high quality detailed render');
  });

  it('wraps unknown negatives', () => {
    const result = negativeToPositiveForFlux(['distorted shapes']);
    expect(result[0]).toBe('without distorted shapes');
  });
});
