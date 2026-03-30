import { prisma } from '@/lib/db/prisma';
import type { ProjectContext, ConsistencyProfile } from '@/lib/ai/types';
import type { ProviderName } from '@/lib/ai/enums';

export const projectContextAssembler = {
  async build(projectId: string, brandKitId?: string): Promise<ProjectContext> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        settings: {
          select: {
            platform: true,
            aspectRatio: true,
            qualityMode: true,
            language: true,
            objective: true,
            style: true,
            tone: true,
            productName: true,
            productCategory: true,
            targetAudience: true,
          },
        },
        brandKit: brandKitId ? undefined : {
          select: {
            id: true,
            name: true,
            brandName: true,
            slogan: true,
            primaryColors: true,
            secondaryColors: true,
            forbiddenColors: true,
            fonts: true,
            tone: true,
            marketingPromise: true,
            preferredCTAs: true,
            forbiddenWords: true,
          },
        },
      },
    });

    type BrandKitSelect = {
      id: string;
      name: string;
      brandName: string | null;
      slogan: string | null;
      primaryColors: string[];
      secondaryColors: string[];
      forbiddenColors: string[];
      fonts: string[];
      tone: string | null;
      marketingPromise: string | null;
      preferredCTAs: string[];
      forbiddenWords: string[];
    };

    let brandKitData: BrandKitSelect | null = null;

    if (project?.brandKit && !brandKitId) {
      const bk = project.brandKit as unknown as BrandKitSelect;
      brandKitData = bk;
    }

    if (brandKitId && !brandKitData) {
      brandKitData = await prisma.brandKit.findUnique({
        where: { id: brandKitId },
        select: {
          id: true,
          name: true,
          brandName: true,
          slogan: true,
          primaryColors: true,
          secondaryColors: true,
          forbiddenColors: true,
          fonts: true,
          tone: true,
          marketingPromise: true,
          preferredCTAs: true,
          forbiddenWords: true,
        },
      });
    }

    const recentImages = await prisma.generatedImage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        provider: true,
        model: true,
        qualityMode: true,
        prompt: true,
      },
    });

    const consistencyHints = this.buildConsistencyHints(recentImages);

    return {
      projectId,
      projectName: project?.name ?? 'Projet',
      settings: {
        platform: project?.settings?.platform ?? undefined,
        aspectRatio: project?.settings?.aspectRatio ?? undefined,
        qualityMode: project?.settings?.qualityMode ?? undefined,
        language: project?.settings?.language ?? undefined,
        objective: project?.settings?.objective ?? undefined,
        style: project?.settings?.style ?? undefined,
        tone: project?.settings?.tone ?? undefined,
        productName: project?.settings?.productName ?? undefined,
        productCategory: project?.settings?.productCategory ?? undefined,
        targetAudience: project?.settings?.targetAudience ?? undefined,
      },
      brandKit: brandKitData
        ? {
            id: brandKitData.id,
            name: brandKitData.name,
            brandName: brandKitData.brandName ?? undefined,
            slogan: brandKitData.slogan ?? undefined,
            primaryColors: brandKitData.primaryColors,
            secondaryColors: brandKitData.secondaryColors,
            forbiddenColors: brandKitData.forbiddenColors,
            fonts: brandKitData.fonts,
            tone: brandKitData.tone ?? undefined,
            marketingPromise: brandKitData.marketingPromise ?? undefined,
            preferredCTAs: brandKitData.preferredCTAs,
            forbiddenWords: brandKitData.forbiddenWords,
          }
        : undefined,
      recentGenerations: recentImages.map((img) => ({
        provider: img.provider,
        model: img.model,
        qualityMode: img.qualityMode,
        prompt: img.prompt,
      })),
      consistencyHints,
    };
  },

  buildConsistencyHints(
    recentImages: Array<{
      provider: string | null;
      model: string | null;
      qualityMode: string;
      prompt: string | null;
    }>,
  ): ConsistencyProfile | null {
    if (recentImages.length < 2) return null;

    const providerCounts = new Map<string, number>();
    const modelCounts = new Map<string, number>();

    for (const img of recentImages) {
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

    return {
      projectId: '',
      bestProvider,
      dominantStyle: null,
      dominantPalette: [],
      dominantRatio: null,
      dominantTone: null,
      frequentModel,
      topConstraints: [],
      generationCount: recentImages.length,
    };
  },
};
