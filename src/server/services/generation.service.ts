import type { CreativeBrief, CreativeSuggestion } from '@/server/ai/agents';
import { composePrompt } from '@/server/ai/agents';
import { imageRouter, type ImageProviderName } from '@/server/ai/image';
import type { QualityMode } from '@prisma/client';
import { JobStatus, type Prisma } from '@prisma/client';

import { getProviderCreditCost } from '@/lib/constants/credit-costs';
import { prisma } from '@/lib/db/prisma';

import { creditService } from './credit.service';

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

    const routeInput = {
      prompt: composition.prompt,
      negativePrompt: composition.negativePrompt,
      size: { width: 1024, height: 1024 } as const,
      quality,
      numberOfImages: 1,
      providerOverride: params.providerOverride,
    };

    const decision = imageRouter.route(routeInput);
    const cost = getProviderCreditCost(decision.provider, quality);

    const affordable = await creditService.canAfford(
      params.workspaceId,
      cost,
    );
    if (!affordable) {
      throw new Error(
        `Crédits insuffisants (${cost} requis pour ${decision.provider})`,
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        workspaceId: params.workspaceId,
        deletedAt: null,
      },
    });
    if (!project) {
      throw new Error('Project not found');
    }

    const job = await prisma.aiJob.create({
      data: {
        projectId: params.projectId,
        workspaceId: params.workspaceId,
        type: 'GENERATE_IMAGE',
        status: JobStatus.RUNNING,
        qualityMode: params.qualityMode,
        prompt: composition.prompt,
        briefJson: params.brief as unknown as Prisma.InputJsonValue,
        costCredits: cost,
        provider: decision.provider,
      },
    });

    try {
      const result = await imageRouter.generate(routeInput);

      await creditService.burnCredits(params.workspaceId, cost, {
        jobId: job.id,
        description: `Génération image (${result.decision.provider})`,
      });

      const images: Array<{
        id: string;
        imageUrl: string;
        width: number;
        height: number;
      }> = [];

      for (const img of result.images) {
        const row = await prisma.generatedImage.create({
          data: {
            projectId: params.projectId,
            aiJobId: job.id,
            imageUrl: img.url,
            width: img.width,
            height: img.height,
            qualityMode: params.qualityMode,
            prompt: composition.prompt,
            negativePrompt: composition.negativePrompt,
            provider: result.decision.provider,
            model: result.model,
            costCredits: cost,
            metadata: {
              routerDecision: result.decision.reason,
              usageType: result.decision.usageType,
            } as unknown as Prisma.InputJsonValue,
          },
        });
        images.push({
          id: row.id,
          imageUrl: row.imageUrl,
          width: row.width,
          height: row.height,
        });
      }

      await prisma.aiJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          executionMs: result.durationMs,
          provider: result.decision.provider,
          model: result.model,
        },
      });

      const updatedJob = await prisma.aiJob.findUniqueOrThrow({
        where: { id: job.id },
      });

      return {
        images,
        prompt: composition.prompt,
        job: updatedJob,
        provider: result.decision.provider,
        model: result.model,
        routerReason: result.decision.reason,
        estimatedCost: cost,
      };
    } catch (err) {
      await prisma.aiJob.update({
        where: { id: job.id },
        data: {
          status: JobStatus.FAILED,
          error:
            err instanceof Error ? err.message : 'Image generation failed',
          completedAt: new Date(),
        },
      });
      throw err;
    }
  },
};
