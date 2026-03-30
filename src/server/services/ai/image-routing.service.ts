import { ProviderName } from '@/lib/ai/enums';
import type {
  NormalizedGenerationBrief,
  ProjectContext,
  RoutingDecision,
  PromptPackage,
  ProviderExecutionResult,
  QualityEvaluationResult,
} from '@/lib/ai/types';
import { requestUnderstandingService } from './request-understanding.service';
import { projectContextAssembler } from './project-context-assembler.service';
import { providerDecisionEngine } from './provider-decision.engine';
import { providerHealthService } from '@/server/ai/providers/image/provider-health.service';
import { compileOpenAIPrompt } from '@/server/ai/providers/image/prompt-compilers/openai-prompt.compiler';
import { compileFluxPrompt } from '@/server/ai/providers/image/prompt-compilers/flux-prompt.compiler';
import { compileIdeogramPrompt } from '@/server/ai/providers/image/prompt-compilers/ideogram-prompt.compiler';
import { imageRouter } from '@/server/ai/image';
import type { ImageProviderName, ImageGenerateInput } from '@/server/ai/image';

export interface SmartRoutingInput {
  prompt: string;
  projectId: string;
  workspaceId: string;
  conversationId?: string;
  qualityMode?: string;
  platform?: string;
  aspectRatio?: string;
  referenceImageIds?: string[];
  brandKitId?: string;
  providerOverride?: string;
  exactTexts?: string[];
}

export interface SmartRoutingResult {
  images: Array<{ url: string; width: number; height: number }>;
  model: string;
  provider: ProviderName;
  durationMs: number;
  brief: NormalizedGenerationBrief;
  decision: RoutingDecision;
  promptPackage: PromptPackage;
  quality: QualityEvaluationResult | null;
  fallbackUsed: boolean;
  fallbackProvider?: ProviderName;
  costCredits: number;
}

function compileForProvider(
  provider: ProviderName,
  brief: NormalizedGenerationBrief,
  context: ProjectContext,
): PromptPackage {
  switch (provider) {
    case ProviderName.FLUX:
      return compileFluxPrompt(brief, context);
    case ProviderName.IDEOGRAM:
      return compileIdeogramPrompt(brief, context);
    case ProviderName.OPENAI:
    default:
      return compileOpenAIPrompt(brief, context);
  }
}

function toImageProviderName(p: ProviderName): ImageProviderName {
  return p as ImageProviderName;
}

function buildGenerateInput(
  provider: ProviderName,
  promptPackage: PromptPackage,
  brief: NormalizedGenerationBrief,
): ImageGenerateInput {
  const sizeMap: Record<string, { width: number; height: number }> = {
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1152, height: 896 },
    '3:4': { width: 896, height: 1152 },
    '1:1': { width: 1024, height: 1024 },
  };

  const size = sizeMap[brief.aspectRatio ?? '1:1'] ?? { width: 1024, height: 1024 };
  const quality = brief.qualityMode === 'PREMIUM' ? 'premium'
    : brief.qualityMode === 'DRAFT' ? 'draft'
    : 'standard';

  return {
    prompt: promptPackage.mainPrompt,
    negativePrompt: provider === ProviderName.FLUX ? undefined : promptPackage.negativePrompt,
    size,
    quality,
    numberOfImages: 1,
    providerOverride: toImageProviderName(provider),
    referenceImages: brief.referenceAssetIds.length > 0 ? brief.referenceAssetIds : undefined,
  };
}

async function executeProvider(
  provider: ProviderName,
  input: ImageGenerateInput,
): Promise<ProviderExecutionResult> {
  const started = performance.now();

  const result = await imageRouter.generate({
    ...input,
    providerOverride: toImageProviderName(provider),
  });

  const durationMs = Math.round(performance.now() - started);

  providerHealthService.recordSuccess(provider, durationMs);

  return {
    images: result.images.map((img) => ({
      url: img.url,
      width: img.width,
      height: img.height,
      base64: img.base64,
    })),
    model: result.model,
    provider,
    durationMs,
  };
}

export const imageRoutingService = {
  async generateWithSmartRouting(input: SmartRoutingInput): Promise<SmartRoutingResult> {
    const totalStart = performance.now();

    const brief = requestUnderstandingService.analyzeRequest({
      prompt: input.prompt,
      projectId: input.projectId,
      conversationId: input.conversationId,
      qualityMode: input.qualityMode,
      platform: input.platform,
      aspectRatio: input.aspectRatio,
      referenceImageIds: input.referenceImageIds,
      brandKitId: input.brandKitId,
      exactTexts: input.exactTexts,
    });

    const context = await projectContextAssembler.build(
      input.projectId,
      input.brandKitId,
    );

    const userOverride = input.providerOverride
      ? (input.providerOverride as ProviderName)
      : undefined;

    const decision = providerDecisionEngine.decideProvider(brief, context, userOverride);

    console.log(
      `[SmartRouting] Decision: ${decision.provider} | Task: ${brief.taskType} | Reasons: ${decision.reason.join(', ')}`,
    );

    const promptPackage = compileForProvider(decision.provider, brief, context);
    const generateInput = buildGenerateInput(decision.provider, promptPackage, brief);

    let result: ProviderExecutionResult;
    let fallbackUsed = false;
    let fallbackProvider: ProviderName | undefined;

    try {
      result = await executeProvider(decision.provider, generateInput);
    } catch (primaryError) {
      const errorMsg = primaryError instanceof Error ? primaryError.message : String(primaryError);
      console.error(`[SmartRouting] Primary provider ${decision.provider} failed: ${errorMsg}`);
      providerHealthService.recordFailure(decision.provider, errorMsg);

      let fallbackResult: ProviderExecutionResult | null = null;

      for (const fb of decision.fallbackChain) {
        if (!providerHealthService.isAvailableForRouting(fb)) continue;

        try {
          console.log(`[SmartRouting] Trying fallback: ${fb}`);
          const fbPrompt = compileForProvider(fb, brief, context);
          const fbInput = buildGenerateInput(fb, fbPrompt, brief);
          fallbackResult = await executeProvider(fb, fbInput);
          fallbackUsed = true;
          fallbackProvider = fb;
          break;
        } catch (fbError) {
          const fbMsg = fbError instanceof Error ? fbError.message : String(fbError);
          console.error(`[SmartRouting] Fallback ${fb} also failed: ${fbMsg}`);
          providerHealthService.recordFailure(fb, fbMsg);
        }
      }

      if (!fallbackResult) {
        throw primaryError;
      }

      result = fallbackResult;
    }

    const totalDurationMs = Math.round(performance.now() - totalStart);
    const actualProvider = fallbackUsed && fallbackProvider ? fallbackProvider : decision.provider;

    return {
      images: result.images,
      model: result.model,
      provider: actualProvider,
      durationMs: totalDurationMs,
      brief,
      decision,
      promptPackage,
      quality: null,
      fallbackUsed,
      fallbackProvider,
      costCredits: decision.estimatedCost,
    };
  },
};
