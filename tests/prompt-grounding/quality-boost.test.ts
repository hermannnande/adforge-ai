import { describe, it, expect } from 'vitest';
import { qualityBoostService } from '@/server/services/prompt-grounding/quality-boost.service';

describe('QualityBoostService', () => {
  it('always adds core quality enhancements', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'crée une affiche pub',
      'STANDARD',
    );
    expect(boost.suffix).toContain('high-end commercial photography');
    expect(boost.suffix).toContain('crisp sharp focus');
    expect(boost.appliedEnhancements).toContain('core-quality');
  });

  it('adds human realism when people are mentioned', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'crée une affiche avec une femme noire élégante',
      'STANDARD',
    );
    expect(boost.appliedEnhancements).toContain('human-realism');
    expect(boost.suffix).toContain('authentic skin texture');
    expect(boost.suffix).toContain('without plastic smoothing');
  });

  it('adds product realism for product prompts', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'photo du produit crème en tube',
      'STANDARD',
    );
    expect(boost.appliedEnhancements).toContain('product-realism');
    expect(boost.suffix).toContain('sharp product details');
  });

  it('adds luxury enhancers for premium products', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'affiche luxe pour parfum premium',
      'PREMIUM',
    );
    expect(boost.appliedEnhancements).toContain('luxury-realism');
    expect(boost.appliedEnhancements).toContain('premium-boost');
    expect(boost.suffix).toContain('luxury editorial style');
    expect(boost.suffix).toContain('Hasselblad');
  });

  it('adds food realism for restaurant prompts', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'affiche pub restaurant pizza',
      'STANDARD',
    );
    expect(boost.appliedEnhancements).toContain('food-realism');
    expect(boost.suffix).toContain('appetizing food photography');
  });

  it('enhance() returns user prompt + suffix', () => {
    const result = qualityBoostService.enhance(
      'crée une affiche pub pro',
      'STANDARD',
    );
    expect(result).toMatch(/^crée une affiche pub pro\n\nStyle & Quality:/);
  });

  it('user prompt is always the first part', () => {
    const userPrompt = 'mon prompt exact ici';
    const result = qualityBoostService.enhance(userPrompt, 'STANDARD');
    expect(result.startsWith(userPrompt)).toBe(true);
  });

  it('combines multiple realism categories', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'affiche pub luxe avec une femme tenant un produit crème',
      'PREMIUM',
    );
    expect(boost.appliedEnhancements).toContain('human-realism');
    expect(boost.appliedEnhancements).toContain('product-realism');
    expect(boost.appliedEnhancements).toContain('luxury-realism');
    expect(boost.appliedEnhancements).toContain('premium-boost');
  });
});
