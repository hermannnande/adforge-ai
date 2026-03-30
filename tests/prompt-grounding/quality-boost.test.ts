import { describe, it, expect } from 'vitest';
import { qualityBoostService } from '@/server/services/prompt-grounding/quality-boost.service';

describe('QualityBoostService', () => {
  it('always adds core quality enhancements', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'crée une affiche pub',
      'STANDARD',
    );
    expect(boost.suffix).toContain('ultra high resolution');
    expect(boost.suffix).toContain('sharp focus');
    expect(boost.suffix).toContain('8K render quality');
    expect(boost.appliedEnhancements).toContain('core-quality');
  });

  it('adds human realism when people are mentioned', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'crée une affiche avec une femme noire élégante',
      'STANDARD',
    );
    expect(boost.appliedEnhancements).toContain('human-realism');
    expect(boost.suffix).toContain('hyper-realistic human skin');
    expect(boost.suffix).toContain('natural pores');
    expect(boost.suffix).toContain('no uncanny valley');
  });

  it('adds product realism for product prompts', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'photo du produit crème en tube',
      'STANDARD',
    );
    expect(boost.appliedEnhancements).toContain('product-realism');
    expect(boost.suffix).toContain('studio-quality product photography');
  });

  it('adds luxury enhancers for premium products', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'affiche luxe pour parfum premium',
      'PREMIUM',
    );
    expect(boost.appliedEnhancements).toContain('luxury-realism');
    expect(boost.appliedEnhancements).toContain('premium-boost');
    expect(boost.suffix).toContain('luxury editorial photography');
    expect(boost.suffix).toContain('phase one IQ4');
  });

  it('adds food realism for restaurant prompts', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'affiche pub restaurant pizza',
      'STANDARD',
    );
    expect(boost.appliedEnhancements).toContain('food-realism');
    expect(boost.suffix).toContain('appetizing food photography');
  });

  it('always adds anti-AI-artifact markers', () => {
    const boost = qualityBoostService.buildQualityBoost(
      'simple ad visual',
      'DRAFT',
    );
    expect(boost.appliedEnhancements).toContain('anti-ai-artifacts');
    expect(boost.suffix).toContain('no AI-looking distortions');
    expect(boost.suffix).toContain('no uncanny valley');
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
