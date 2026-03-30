import { describe, it, expect } from 'vitest';
import { computeCapabilityFit, computeHealthScore, computeContextFit, computeLatencyScore } from '@/lib/ai/scoring';
import { GenerationTaskType, ProviderName, ProviderHealthStatus, QualityModeEnum, TextRequirementMode } from '@/lib/ai/enums';
import type { ProviderCapabilityProfile, NormalizedGenerationBrief, ProviderHealthSnapshot, ConsistencyProfile } from '@/lib/ai/types';

function makeBrief(overrides: Partial<NormalizedGenerationBrief> = {}): NormalizedGenerationBrief {
  return {
    rawUserPrompt: 'test',
    cleanedPrompt: 'test',
    taskType: GenerationTaskType.GENERAL_AD_VISUAL,
    textNeedLevel: 'low',
    textRequirementMode: TextRequirementMode.NONE,
    providedExactText: [],
    realismLevel: 'medium',
    styleIntent: ['modern'],
    needVisibleText: false,
    needExactText: false,
    needPhotorealism: false,
    needProductFocus: false,
    needPosterStyle: false,
    needTypographyQuality: false,
    referenceAssetCount: 0,
    referenceAssetIds: [],
    historicalProjectContext: [],
    positiveConstraints: [],
    negativeConstraintsRaw: [],
    translatedConstraintsForFlux: [],
    qualityMode: QualityModeEnum.STANDARD,
    ...overrides,
  };
}

const OPENAI_CAP: ProviderCapabilityProfile = {
  name: ProviderName.OPENAI,
  generalistScore: 9, photorealismScore: 7, typographyScore: 7,
  posterScore: 7, editScore: 9, multiReferenceScore: 6,
  async: false, supportsNegativePrompt: true,
  supportsExactTextReliability: 'medium', temporaryAssetUrl: false, maxConcurrent: 10,
};

const FLUX_CAP: ProviderCapabilityProfile = {
  name: ProviderName.FLUX,
  generalistScore: 7, photorealismScore: 10, typographyScore: 5,
  posterScore: 6, editScore: 8, multiReferenceScore: 9,
  async: true, supportsNegativePrompt: false,
  supportsExactTextReliability: 'low', temporaryAssetUrl: false, maxConcurrent: 5,
};

const IDEOGRAM_CAP: ProviderCapabilityProfile = {
  name: ProviderName.IDEOGRAM,
  generalistScore: 7, photorealismScore: 7, typographyScore: 10,
  posterScore: 10, editScore: 7, multiReferenceScore: 5,
  async: false, supportsNegativePrompt: true,
  supportsExactTextReliability: 'high', temporaryAssetUrl: true, maxConcurrent: 8,
};

describe('computeCapabilityFit', () => {
  it('gives OpenAI highest score for general ad', () => {
    const brief = makeBrief({ taskType: GenerationTaskType.GENERAL_AD_VISUAL });
    expect(computeCapabilityFit(OPENAI_CAP, brief)).toBeGreaterThan(computeCapabilityFit(FLUX_CAP, brief));
  });

  it('gives FLUX highest score for photorealistic ad', () => {
    const brief = makeBrief({ taskType: GenerationTaskType.PHOTOREALISTIC_AD, needPhotorealism: true });
    expect(computeCapabilityFit(FLUX_CAP, brief)).toBeGreaterThan(computeCapabilityFit(OPENAI_CAP, brief));
  });

  it('gives Ideogram highest score for poster text-heavy', () => {
    const brief = makeBrief({ taskType: GenerationTaskType.POSTER_TEXT_HEAVY, needVisibleText: true, needPosterStyle: true });
    expect(computeCapabilityFit(IDEOGRAM_CAP, brief)).toBeGreaterThan(computeCapabilityFit(OPENAI_CAP, brief));
  });

  it('gives FLUX bonus for multi-reference', () => {
    const brief = makeBrief({ taskType: GenerationTaskType.MULTI_REFERENCE_EDIT, referenceAssetCount: 3 });
    expect(computeCapabilityFit(FLUX_CAP, brief)).toBeGreaterThan(computeCapabilityFit(IDEOGRAM_CAP, brief));
  });

  it('gives Ideogram bonus for exact text', () => {
    const brief = makeBrief({ needExactText: true, taskType: GenerationTaskType.POSTER_TEXT_HEAVY });
    expect(computeCapabilityFit(IDEOGRAM_CAP, brief)).toBeGreaterThan(computeCapabilityFit(FLUX_CAP, brief));
  });
});

describe('computeHealthScore', () => {
  it('returns 10 for healthy', () => {
    const h: ProviderHealthSnapshot = {
      provider: ProviderName.OPENAI, status: ProviderHealthStatus.HEALTHY,
      consecutiveFailures: 0, lastFailureAt: null, lastSuccessAt: Date.now(),
      avgLatencyMs: 3000, circuitOpenUntil: null,
    };
    expect(computeHealthScore(h)).toBe(10);
  });

  it('returns 0 for circuit open', () => {
    const h: ProviderHealthSnapshot = {
      provider: ProviderName.OPENAI, status: ProviderHealthStatus.CIRCUIT_OPEN,
      consecutiveFailures: 5, lastFailureAt: Date.now(), lastSuccessAt: null,
      avgLatencyMs: 0, circuitOpenUntil: Date.now() + 60000,
    };
    expect(computeHealthScore(h)).toBe(0);
  });

  it('returns 3 for degraded', () => {
    const h: ProviderHealthSnapshot = {
      provider: ProviderName.FLUX, status: ProviderHealthStatus.DEGRADED,
      consecutiveFailures: 3, lastFailureAt: Date.now(), lastSuccessAt: null,
      avgLatencyMs: 10000, circuitOpenUntil: null,
    };
    expect(computeHealthScore(h)).toBe(3);
  });
});

describe('computeContextFit', () => {
  it('returns 8 when provider matches best historical', () => {
    const profile: ConsistencyProfile = {
      projectId: 'p1', bestProvider: ProviderName.FLUX, dominantStyle: null,
      dominantPalette: [], dominantRatio: null, dominantTone: null,
      frequentModel: null, topConstraints: [], generationCount: 5,
    };
    expect(computeContextFit(ProviderName.FLUX, profile)).toBe(8);
  });

  it('returns 5 for no match', () => {
    const profile: ConsistencyProfile = {
      projectId: 'p1', bestProvider: ProviderName.FLUX, dominantStyle: null,
      dominantPalette: [], dominantRatio: null, dominantTone: null,
      frequentModel: null, topConstraints: [], generationCount: 5,
    };
    expect(computeContextFit(ProviderName.OPENAI, profile)).toBe(5);
  });

  it('returns 5 for null profile', () => {
    expect(computeContextFit(ProviderName.OPENAI, null)).toBe(5);
  });
});

describe('computeLatencyScore', () => {
  it('gives high score for fast provider', () => {
    const h: ProviderHealthSnapshot = {
      provider: ProviderName.OPENAI, status: ProviderHealthStatus.HEALTHY,
      consecutiveFailures: 0, lastFailureAt: null, lastSuccessAt: Date.now(),
      avgLatencyMs: 2000, circuitOpenUntil: null,
    };
    expect(computeLatencyScore(h)).toBe(9);
  });

  it('gives lower score for slow provider', () => {
    const h: ProviderHealthSnapshot = {
      provider: ProviderName.FLUX, status: ProviderHealthStatus.HEALTHY,
      consecutiveFailures: 0, lastFailureAt: null, lastSuccessAt: Date.now(),
      avgLatencyMs: 25000, circuitOpenUntil: null,
    };
    expect(computeLatencyScore(h)).toBe(5);
  });
});
