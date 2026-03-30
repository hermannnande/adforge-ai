import { prisma } from '@/lib/db/prisma';
import type { ConsistencyProfile } from '@/lib/ai/types';
import type { ProviderName } from '@/lib/ai/enums';

export const consistencyProfileService = {
  async buildProfile(projectId: string): Promise<ConsistencyProfile> {
    const images = await prisma.generatedImage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        provider: true,
        model: true,
        qualityMode: true,
        prompt: true,
        metadata: true,
      },
    });

    if (images.length === 0) {
      return {
        projectId,
        bestProvider: null,
        dominantStyle: null,
        dominantPalette: [],
        dominantRatio: null,
        dominantTone: null,
        frequentModel: null,
        topConstraints: [],
        generationCount: 0,
      };
    }

    const providerCounts = new Map<string, number>();
    const modelCounts = new Map<string, number>();

    for (const img of images) {
      if (img.provider) {
        providerCounts.set(img.provider, (providerCounts.get(img.provider) ?? 0) + 1);
      }
      if (img.model) {
        modelCounts.set(img.model, (modelCounts.get(img.model) ?? 0) + 1);
      }
    }

    const bestProvider = [...providerCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0] as ProviderName | undefined ?? null;

    const frequentModel = [...modelCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const settings = await prisma.projectSettings.findUnique({
      where: { projectId },
      select: { style: true, tone: true, aspectRatio: true },
    });

    return {
      projectId,
      bestProvider,
      dominantStyle: settings?.style ?? null,
      dominantPalette: [],
      dominantRatio: settings?.aspectRatio ?? null,
      dominantTone: settings?.tone ?? null,
      frequentModel,
      topConstraints: [],
      generationCount: images.length,
    };
  },

  async updateProfileAfterGeneration(
    projectId: string,
    result: { provider: string; model: string; qualityMode: string },
  ): Promise<void> {
    console.log(
      `[ConsistencyProfile] Updated for project ${projectId}: ` +
      `provider=${result.provider}, model=${result.model}`,
    );
  },

  async getConsistencyHints(projectId: string): Promise<ConsistencyProfile> {
    return this.buildProfile(projectId);
  },
};
