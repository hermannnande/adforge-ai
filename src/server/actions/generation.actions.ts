'use server';

import { revalidatePath } from 'next/cache';
import type { QualityMode } from '@prisma/client';

import type { CreativeBrief, CreativeSuggestion } from '@/server/ai/agents';
import { creditService } from '@/server/services/credit.service';
import { generationService } from '@/server/services/generation.service';
import { userService } from '@/server/services/user.service';

export async function generateImage(params: {
  projectId: string;
  brief: CreativeBrief;
  suggestion: CreativeSuggestion;
  qualityMode: QualityMode;
  platform: string;
}) {
  const ctx = await userService.requireCurrentWorkspace();

  const result = await generationService.generateImage({
    ...params,
    workspaceId: ctx.workspace.id,
    brandKit: undefined,
  });

  revalidatePath(`/app/projects/${params.projectId}`);
  revalidatePath('/app/library');
  revalidatePath('/app');

  return {
    success: true,
    images: result.images.map((img) => ({
      id: img.id,
      url: img.imageUrl,
      width: img.width,
      height: img.height,
    })),
    prompt: result.prompt,
    jobId: result.job.id,
  };
}

export async function getCreditBalance() {
  const ctx = await userService.requireCurrentWorkspace();
  return creditService.getBalance(ctx.workspace.id);
}

export async function getCreditWallet() {
  const ctx = await userService.requireCurrentWorkspace();
  return creditService.getWalletWithGrants(ctx.workspace.id);
}
