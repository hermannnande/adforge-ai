import { describe, it, expect } from 'vitest';
import { compileFluxPrompt } from '@/server/ai/providers/image/prompt-compilers/flux-prompt.compiler';
import { compileIdeogramPrompt } from '@/server/ai/providers/image/prompt-compilers/ideogram-prompt.compiler';
import { compileOpenAIPrompt } from '@/server/ai/providers/image/prompt-compilers/openai-prompt.compiler';
import { GenerationTaskType, QualityModeEnum, TextRequirementMode } from '@/lib/ai/enums';
import type { NormalizedGenerationBrief, ProjectContext } from '@/lib/ai/types';

function makeBrief(overrides: Partial<NormalizedGenerationBrief> = {}): NormalizedGenerationBrief {
  return {
    rawUserPrompt: 'test prompt',
    cleanedPrompt: 'test prompt',
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
    negativeConstraintsRaw: ['blurry', 'low quality'],
    translatedConstraintsForFlux: ['sharp and clear focus', 'high quality'],
    qualityMode: QualityModeEnum.STANDARD,
    ...overrides,
  };
}

const EMPTY_CONTEXT: ProjectContext = {
  projectId: 'p1',
  projectName: 'Test',
  settings: {},
  recentGenerations: [],
  consistencyHints: null,
};

const CONTEXT_WITH_BRAND: ProjectContext = {
  ...EMPTY_CONTEXT,
  brandKit: {
    id: 'bk1',
    name: 'TestBrand',
    brandName: 'TestBrand',
    slogan: 'The Best',
    primaryColors: ['#FF0000', '#000000'],
    secondaryColors: [],
    forbiddenColors: [],
    fonts: ['Montserrat', 'Playfair Display'],
    tone: 'premium',
    preferredCTAs: ['Découvrir'],
    forbiddenWords: [],
  },
};

describe('FluxPromptCompiler', () => {
  it('never includes negative prompts', () => {
    const pkg = compileFluxPrompt(makeBrief(), EMPTY_CONTEXT);
    expect(pkg.negativePrompt).toBeUndefined();
  });

  it('warns about negative prompts not supported', () => {
    const pkg = compileFluxPrompt(makeBrief(), EMPTY_CONTEXT);
    expect(pkg.providerWarnings.some((w) => w.includes('negative'))).toBe(true);
  });

  it('includes photorealistic enrichment', () => {
    const pkg = compileFluxPrompt(makeBrief({ needPhotorealism: true }), EMPTY_CONTEXT);
    expect(pkg.mainPrompt).toContain('photorealistic');
    expect(pkg.mainPrompt).toContain('studio lighting');
  });

  it('includes translated constraints instead of negatives', () => {
    const pkg = compileFluxPrompt(makeBrief(), EMPTY_CONTEXT);
    expect(pkg.mainPrompt).toContain('sharp and clear focus');
  });

  it('integrates brand kit', () => {
    const pkg = compileFluxPrompt(makeBrief(), CONTEXT_WITH_BRAND);
    expect(pkg.mainPrompt).toContain('#FF0000');
    expect(pkg.mainPrompt).toContain('premium');
  });
});

describe('IdeogramPromptCompiler', () => {
  it('emphasizes typography for poster tasks', () => {
    const pkg = compileIdeogramPrompt(
      makeBrief({ needPosterStyle: true, needTypographyQuality: true }),
      EMPTY_CONTEXT,
    );
    expect(pkg.mainPrompt).toContain('typography');
    expect(pkg.mainPrompt).toContain('hierarchy');
  });

  it('includes exact text prominently', () => {
    const pkg = compileIdeogramPrompt(
      makeBrief({ providedExactText: ['PROMO -50%', 'Découvrir'], needExactText: true }),
      EMPTY_CONTEXT,
    );
    expect(pkg.mainPrompt).toContain('PROMO -50%');
    expect(pkg.mainPrompt).toContain('Découvrir');
  });

  it('warns about temporary asset URLs', () => {
    const pkg = compileIdeogramPrompt(makeBrief(), EMPTY_CONTEXT);
    expect(pkg.providerWarnings.some((w) => w.includes('temporary'))).toBe(true);
  });

  it('integrates brand fonts', () => {
    const pkg = compileIdeogramPrompt(makeBrief(), CONTEXT_WITH_BRAND);
    expect(pkg.mainPrompt).toContain('Montserrat');
  });
});

describe('OpenAIPromptCompiler', () => {
  it('includes negative prompt', () => {
    const pkg = compileOpenAIPrompt(
      makeBrief({ negativeConstraintsRaw: ['blurry', 'watermark'] }),
      EMPTY_CONTEXT,
    );
    expect(pkg.negativePrompt).toContain('blurry');
    expect(pkg.negativePrompt).toContain('watermark');
  });

  it('integrates brand colors and slogan', () => {
    const pkg = compileOpenAIPrompt(makeBrief(), CONTEXT_WITH_BRAND);
    expect(pkg.mainPrompt).toContain('#FF0000');
    expect(pkg.mainPrompt).toContain('The Best');
  });

  it('includes quality modifiers', () => {
    const pkg = compileOpenAIPrompt(
      makeBrief({ qualityMode: QualityModeEnum.PREMIUM }),
      EMPTY_CONTEXT,
    );
    expect(pkg.mainPrompt).toContain('8K');
  });
});
