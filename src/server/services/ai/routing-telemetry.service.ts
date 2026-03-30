import { prisma } from '@/lib/db/prisma';
import type {
  NormalizedGenerationBrief,
  RoutingDecision,
  QualityEvaluationResult,
  ProviderExecutionResult,
} from '@/lib/ai/types';
import type { ProviderName } from '@/lib/ai/enums';

interface TelemetrySaveInput {
  jobId: string;
  brief: NormalizedGenerationBrief;
  decision: RoutingDecision;
  quality: QualityEvaluationResult | null;
  executionResult: ProviderExecutionResult | null;
  fallbackUsed: boolean;
  fallbackProvider?: ProviderName;
  totalDurationMs: number;
  projectId: string;
  conversationId?: string;
}

export const routingTelemetryService = {
  async save(input: TelemetrySaveInput): Promise<void> {
    try {
      if (input.executionResult) {
        await prisma.aiProviderLog.create({
          data: {
            jobId: input.jobId,
            provider: input.executionResult.provider,
            model: input.executionResult.model,
            endpoint: 'image-generation',
            durationMs: input.executionResult.durationMs,
            statusCode: 200,
          },
        });
      }

      await prisma.aiJobStep.create({
        data: {
          jobId: input.jobId,
          stepName: 'smart-routing',
          status: 'COMPLETED',
          input: JSON.parse(JSON.stringify({
            taskType: input.brief.taskType,
            provider: input.decision.provider,
            scores: input.decision.scores,
            reasons: input.decision.reason,
            fallbackChain: input.decision.fallbackChain,
          })),
          output: JSON.parse(JSON.stringify({
            fallbackUsed: input.fallbackUsed,
            fallbackProvider: input.fallbackProvider ?? null,
            quality: input.quality,
            durationMs: input.totalDurationMs,
          })),
          provider: input.executionResult?.provider ?? input.decision.provider,
          model: input.executionResult?.model ?? null,
          durationMs: input.totalDurationMs,
        },
      });

      if (input.quality) {
        const imageId = input.executionResult?.images[0]
          ? await this.findImageId(input.jobId)
          : null;

        if (imageId) {
          await prisma.visualScore.create({
            data: {
              imageId,
              readability: input.quality.typographyScore,
              contrast: input.quality.compositionScore,
              balance: input.quality.compositionScore,
              textDensity: input.quality.typographyScore,
              ctaPresence: input.quality.briefAlignmentScore,
              brandCoherence: input.quality.brandConsistencyScore,
              overallScore: input.quality.finalQualityScore,
              suggestions: input.quality.issues,
            },
          });
        }
      }

      console.log(
        `[Telemetry] Saved for job ${input.jobId}: ` +
        `provider=${input.decision.provider}, ` +
        `fallback=${input.fallbackUsed ? input.fallbackProvider : 'none'}, ` +
        `quality=${input.quality?.finalQualityScore ?? 'N/A'}, ` +
        `duration=${input.totalDurationMs}ms`,
      );
    } catch (error) {
      console.error('[Telemetry] Failed to save telemetry:', error);
    }
  },

  async findImageId(jobId: string): Promise<string | null> {
    const image = await prisma.generatedImage.findFirst({
      where: { aiJobId: jobId },
      select: { id: true },
    });
    return image?.id ?? null;
  },
};
