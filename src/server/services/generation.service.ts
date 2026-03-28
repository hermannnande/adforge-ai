import type { CreativeBrief, CreativeSuggestion } from '@/server/ai/agents';
import { composePrompt } from '@/server/ai/agents';
import { aiRegistry } from '@/server/ai/providers';
import type { QualityMode } from '@prisma/client';
import { JobStatus, type Prisma } from '@prisma/client';

import { CREDIT_COSTS } from '@/lib/constants/credit-costs';
import { prisma } from '@/lib/db/prisma';

import { creditService } from './credit.service';

function qualityModeToCreditCost(mode: QualityMode): number {
  switch (mode) {
    case 'DRAFT':
      return CREDIT_COSTS.GENERATION_DRAFT;
    case 'STANDARD':
      return CREDIT_COSTS.GENERATION_STANDARD;
    case 'PREMIUM':
      return CREDIT_COSTS.GENERATION_PREMIUM;
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}

function qualityModeToCompose(mode: QualityMode): 'draft' | 'standard' | 'premium' {
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
    brandKit?: {
      primaryColors: string[];
      secondaryColors: string[];
      fonts: string[];
      tone?: string | null;
    };
  }) {
    const cost = qualityModeToCreditCost(params.qualityMode);
    const affordable = await creditService.canAfford(params.workspaceId, cost);
    if (!affordable) {
      throw new Error('Crédits insuffisants');
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

    const composition = composePrompt({
      brief: params.brief,
      suggestion: params.suggestion,
      platform: params.platform,
      brandKit: params.brandKit,
      qualityMode: qualityModeToCompose(params.qualityMode),
    });

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
      },
    });

    const provider = aiRegistry.getDefaultImageProvider();

    try {
      const result = await provider.generateImage({
        prompt: composition.prompt,
        negativePrompt: composition.negativePrompt,
        size: { width: 1024, height: 1024 },
        quality: qualityModeToCompose(params.qualityMode),
        numberOfImages: 1,
      });

      await creditService.burnCredits(params.workspaceId, cost, {
        jobId: job.id,
        description: 'Génération image',
      });

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
            prompt: composition.prompt,
            negativePrompt: composition.negativePrompt,
            provider: result.provider,
            model: result.model,
            costCredits: cost,
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
          provider: result.provider,
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
};
