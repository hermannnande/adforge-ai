import type { CreativeBrief, CreativeSuggestion } from '@/server/ai/agents';
import { composePrompt } from '@/server/ai/agents';
import type { ImageProviderName } from '@/server/ai/image';
import type { QualityMode } from '@prisma/client';
import { JobStatus, type Prisma } from '@prisma/client';

import { getProviderCreditCost } from '@/lib/constants/credit-costs';
import { prisma } from '@/lib/db/prisma';
import type { ProviderName } from '@/lib/ai/enums';
import { imageRoutingService, type SmartRoutingInput } from '@/server/services/ai/image-routing.service';
import { generationQualityEvaluator } from '@/server/services/ai/generation-quality-evaluator.service';
import { routingTelemetryService } from '@/server/services/ai/routing-telemetry.service';
import { consistencyProfileService } from '@/server/services/ai/consistency-profile.service';
import {
  rawPromptService,
  multiImagePipelineService,
  projectContextMemoryService,
  canonicalRequestService,
  minimalEnrichmentService,
  driftGuardService,
  auditLoggerService,
} from '@/server/services/prompt-grounding';

function qualityModeToCompose(
  mode: QualityMode,
): 'draft' | 'standard' | 'premium' {
  switch (mode) {
    case 'DRAFT':
      return 'draft';
    case 'STANDARD':
      return 'standard';
    case 'PREMIUM':
      return 'premium';
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

export const generationService = {
  async generateImageSmart(params: {
    projectId: string;
    workspaceId: string;
    prompt: string;
    rawUserPrompt?: string;
    qualityMode: QualityMode;
    platform?: string;
    aspectRatio?: string;
    providerOverride?: string;
    brandKitId?: string;
    conversationId?: string;
    referenceImageIds?: string[];
    referenceImageUrls?: string[];
    exactTexts?: string[];
  }) {
    const quality = qualityModeToCompose(params.qualityMode);

    // ─── 1. RAW PROMPT PRESERVATION ────────────────────────────────────
    const effectiveRawPrompt = params.rawUserPrompt || params.prompt;
    const preserved = rawPromptService.preserveCoreIntent(effectiveRawPrompt);

    console.log(`[Generation] Raw prompt preserved: "${preserved.rawUserPrompt.slice(0, 100)}..." (delta=${preserved.isDeltaRequest}, retouch=${preserved.isRetouchRequest})`);

    // ─── 2. MULTI-IMAGE COLLECTION ─────────────────────────────────────
    const assetCollection = await multiImagePipelineService.buildAssetCollection({
      projectId: params.projectId,
      referenceImageUrls: params.referenceImageUrls ?? [],
      userPrompt: preserved.rawUserPrompt,
    });

    console.log(`[Generation] Asset collection: ${assetCollection.totalCount} images (primary=${!!assetCollection.primaryProduct})`);

    const imageUsageLog = multiImagePipelineService.buildUsageReasoningLog(assetCollection);
    for (const entry of imageUsageLog) {
      console.log(`[Generation] ${entry}`);
    }

    // ─── 3. PROJECT CONTEXT MEMORY ─────────────────────────────────────
    const projectMemory = await projectContextMemoryService.buildProjectMemory(params.projectId).catch(() => ({
      projectTheme: null,
      projectGoal: null,
      preferredOutputType: null,
      approvedStyleDirection: null,
      lockedProductReferences: [],
      lockedBrandHints: [],
      lockedVisualIntent: null,
      conversationSummary: '',
      lastAcceptedDirection: null,
      activeMarketingGoal: null,
    }));

    // ─── 4. DRIFT DETECTION ────────────────────────────────────────────
    const drift = driftGuardService.analyzeDrift({
      latestPrompt: preserved.rawUserPrompt,
      projectMemory,
    });

    if (drift.isDrift) {
      console.log(`[Generation] Drift detected: ${drift.reason}`);
    }

    // ─── 5. CANONICAL REQUEST ──────────────────────────────────────────
    const canonical = canonicalRequestService.buildCanonicalRequest({
      preserved,
      assets: assetCollection,
      memory: projectMemory,
      qualityMode: params.qualityMode,
      platform: params.platform,
      aspectRatio: params.aspectRatio,
    });

    // ─── 6. MINIMAL ENRICHMENT ─────────────────────────────────────────
    const enriched = minimalEnrichmentService.enrichLightly(canonical);

    console.log(`[Generation] Enriched prompt length: ${enriched.finalPrompt.length} (raw: ${preserved.rawUserPrompt.length})`);

    // ─── 7. COLLECT ALL IMAGE URLs ─────────────────────────────────────
    // Priority: use the original referenceImageUrls from the request first (direct from frontend)
    // Fall back to asset collection URLs (which may include stored project assets)
    let refUrls = (params.referenceImageUrls && params.referenceImageUrls.length > 0)
      ? params.referenceImageUrls
      : multiImagePipelineService.getAllImageUrls(assetCollection);

    console.log(`[Generation] ${refUrls.length} reference image(s) will be sent to provider (source: ${params.referenceImageUrls?.length ? 'direct' : 'collection'})`);

    // ─── 8. BUILD ROUTING INPUT ────────────────────────────────────────
    // For NanoBanana: send raw prompt directly (no enrichment)
    // For other providers: use the enriched prompt
    const routingInput: SmartRoutingInput = {
      prompt: preserved.rawUserPrompt,
      originalUserPrompt: preserved.rawUserPrompt,
      projectId: params.projectId,
      workspaceId: params.workspaceId,
      conversationId: params.conversationId,
      qualityMode: quality,
      platform: params.platform,
      aspectRatio: params.aspectRatio,
      referenceImageIds: params.referenceImageIds,
      referenceImageUrls: refUrls,
      brandKitId: params.brandKitId,
      providerOverride: params.providerOverride,
      exactTexts: params.exactTexts,
    };

    const job = await prisma.aiJob.create({
      data: {
        projectId: params.projectId,
        workspaceId: params.workspaceId,
        type: 'GENERATE_IMAGE',
        status: JobStatus.RUNNING,
        qualityMode: params.qualityMode,
        prompt: preserved.rawUserPrompt,
        startedAt: new Date(),
      },
    });

    try {
      const result = await imageRoutingService.generateWithSmartRouting(routingInput);

      // ─── 9. AUDIT LOG ────────────────────────────────────────────────
      auditLoggerService.buildLog({
        canonical,
        enriched,
        finalProviderPrompt: result.promptPackage.mainPrompt,
        providerName: result.provider,
        driftDetected: drift.isDrift,
        driftAction: drift.isDrift ? drift.reason : null,
      });

      const actualCost = getProviderCreditCost(result.provider, quality);

      const images: Array<{ id: string; imageUrl: string; width: number; height: number }> = [];

      for (const img of result.images) {
        const row = await prisma.generatedImage.create({
          data: {
            projectId: params.projectId,
            aiJobId: job.id,
            imageUrl: img.url,
            width: img.width,
            height: img.height,
            qualityMode: params.qualityMode,
            prompt: result.promptPackage.mainPrompt,
            negativePrompt: result.promptPackage.negativePrompt,
            provider: result.provider,
            model: result.model,
            costCredits: actualCost,
            metadata: {
              routerDecision: result.decision.reason.join(' | '),
              taskType: result.brief.taskType,
              fallbackUsed: result.fallbackUsed,
              fallbackProvider: result.fallbackProvider ?? null,
              scores: result.decision.scores,
              rawUserPrompt: preserved.rawUserPrompt,
              assetsUsed: assetCollection.totalCount,
              driftDetected: drift.isDrift,
            } as unknown as Prisma.InputJsonValue,
          },
        });
        images.push({ id: row.id, imageUrl: row.imageUrl, width: row.width, height: row.height });
      }

      const qualityEval = generationQualityEvaluator.evaluate(
        { images: result.images, model: result.model, provider: result.provider as ProviderName, durationMs: result.durationMs },
        result.brief,
        { projectId: params.projectId, projectName: '', settings: {}, recentGenerations: [], consistencyHints: null },
      );

      await prisma.aiJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          executionMs: result.durationMs,
          provider: result.provider,
          model: result.model,
          costCredits: actualCost,
          briefJson: {
            taskType: result.brief.taskType,
            needPhotorealism: result.brief.needPhotorealism,
            needVisibleText: result.brief.needVisibleText,
            needExactText: result.brief.needExactText,
            needPosterStyle: result.brief.needPosterStyle,
          } as unknown as Prisma.InputJsonValue,
        },
      });

      routingTelemetryService.save({
        jobId: job.id,
        brief: result.brief,
        decision: result.decision,
        quality: qualityEval,
        executionResult: {
          images: result.images,
          model: result.model,
          provider: result.provider as ProviderName,
          durationMs: result.durationMs,
        },
        fallbackUsed: result.fallbackUsed,
        fallbackProvider: result.fallbackProvider,
        totalDurationMs: result.durationMs,
        projectId: params.projectId,
        conversationId: params.conversationId,
      }).catch((err) => console.error('[Telemetry] Background save failed:', err));

      consistencyProfileService.updateProfileAfterGeneration(
        params.projectId,
        { provider: result.provider, model: result.model, qualityMode: quality },
      ).catch((err) => console.error('[Consistency] Background update failed:', err));

      projectContextMemoryService.updateProjectMemory(
        params.projectId,
        preserved.rawUserPrompt,
        { provider: result.provider, accepted: true },
      ).catch((err) => console.error('[ProjectMemory] Background update failed:', err));

      return {
        images,
        prompt: result.promptPackage.mainPrompt,
        job: await prisma.aiJob.findUniqueOrThrow({ where: { id: job.id } }),
        provider: result.provider,
        model: result.model,
        routerReason: result.decision.reason.join(' | '),
        estimatedCost: actualCost,
        taskType: result.brief.taskType,
        quality: qualityEval,
        fallbackUsed: result.fallbackUsed,
        fallbackProvider: result.fallbackProvider,
      };
    } catch (err) {
      await prisma.aiJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          error: err instanceof Error ? err.message : 'Image generation failed',
          completedAt: new Date(),
        },
      });
      throw err;
    }
  },

  async generateImage(params: {
    projectId: string;
    workspaceId: string;
    brief: CreativeBrief;
    suggestion: CreativeSuggestion;
    qualityMode: QualityMode;
    platform: string;
    providerOverride?: ImageProviderName;
    brandKit?: {
      primaryColors: string[];
      secondaryColors: string[];
      fonts: string[];
      tone?: string | null;
    };
  }) {
    const quality = qualityModeToCompose(params.qualityMode);

    const composition = composePrompt({
      brief: params.brief,
      suggestion: params.suggestion,
      platform: params.platform,
      brandKit: params.brandKit,
      qualityMode: quality,
    });

    return this.generateImageSmart({
      projectId: params.projectId,
      workspaceId: params.workspaceId,
      prompt: composition.prompt,
      qualityMode: params.qualityMode,
      platform: params.platform,
      providerOverride: params.providerOverride,
    });
  },
};
