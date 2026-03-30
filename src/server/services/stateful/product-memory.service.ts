import { prisma } from '@/lib/db/prisma';
import { assetAnalysisService, type AssetVisualProfile } from './asset-analysis.service';

export interface LockedProductProfile {
  primaryAssetId: string;
  canonicalVisualDescription: string;
  dominantColors: string[];
  packagingType: string | null;
  shapeDescription: string;
  materialLook: string | null;
  brandTextDetected: string[];
  mustPreserveIdentity: boolean;
  mustPreserveProductShape: boolean;
  mustPreservePackagingLook: boolean;
  mustPreserveBrandingIfVisible: boolean;
  assetProfile: AssetVisualProfile;
}

export const productMemoryService = {
  async setPrimaryProductReference(projectId: string, assetId: string): Promise<void> {
    await prisma.$transaction([
      prisma.asset.updateMany({
        where: { projectId, isPrimaryProduct: true },
        data: { isPrimaryProduct: false },
      }),
      prisma.asset.update({
        where: { id: assetId },
        data: { isPrimaryProduct: true },
      }),
      prisma.project.update({
        where: { id: projectId },
        data: { primaryAssetId: assetId },
      }),
    ]);

    await assetAnalysisService.ensureAnalyzed(assetId);
  },

  async getPrimaryProductReference(projectId: string): Promise<string | null> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { primaryAssetId: true },
    });
    if (project?.primaryAssetId) return project.primaryAssetId;

    const asset = await prisma.asset.findFirst({
      where: { projectId, isPrimaryProduct: true },
      select: { id: true },
    });
    return asset?.id ?? null;
  },

  async autoDetectPrimaryAsset(projectId: string): Promise<string | null> {
    const existing = await this.getPrimaryProductReference(projectId);
    if (existing) return existing;

    const latestAsset = await prisma.asset.findFirst({
      where: { projectId, type: 'REFERENCE' },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (latestAsset) {
      await this.setPrimaryProductReference(projectId, latestAsset.id);
      return latestAsset.id;
    }

    return null;
  },

  async buildLockedProductProfile(projectId: string): Promise<LockedProductProfile | null> {
    const primaryId = await this.autoDetectPrimaryAsset(projectId);
    if (!primaryId) return null;

    const profile = await assetAnalysisService.ensureAnalyzed(primaryId);

    return {
      primaryAssetId: primaryId,
      canonicalVisualDescription: profile.canonicalProductDescription,
      dominantColors: profile.dominantColors,
      packagingType: profile.packagingType,
      shapeDescription: profile.shapeDescription,
      materialLook: profile.materialLook,
      brandTextDetected: profile.visibleBrandWords,
      mustPreserveIdentity: true,
      mustPreserveProductShape: true,
      mustPreservePackagingLook: true,
      mustPreserveBrandingIfVisible: profile.logoPresence || profile.textPresence,
      assetProfile: profile,
    };
  },

  async getProductDataUrl(projectId: string): Promise<string | null> {
    const primaryId = await this.getPrimaryProductReference(projectId);
    if (!primaryId) return null;

    const asset = await prisma.asset.findUnique({
      where: { id: primaryId },
      select: { url: true },
    });

    return asset?.url?.startsWith('data:') ? asset.url : null;
  },
};
