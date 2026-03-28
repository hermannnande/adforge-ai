'use server';

import { revalidatePath } from 'next/cache';
import type { QualityMode } from '@prisma/client';

import type { CreativeBrief, CreativeSuggestion } from '@/server/ai/agents';
import { getActionAuth } from '@/lib/auth';
import { creditService } from '@/server/services/credit.service';
import { generationService } from '@/server/services/generation.service';
import { userService } from '@/server/services/user.service';

async function requireWorkspace() {
  const session = await getActionAuth();
  if (!session) throw new Error('Unauthorized');
  const ctx = await userService.getWorkspaceByClerkId(session.userId);
  if (!ctx) throw new Error('No workspace found');
  return ctx;
}

export async function generateImage(params: {
  projectId: string;
  brief: CreativeBrief;
  suggestion: CreativeSuggestion;
  qualityMode: QualityMode;
  platform: string;
}) {
  const ctx = await requireWorkspace();

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
  const ctx = await requireWorkspace();
  return creditService.getBalance(ctx.workspace.id);
}

export async function getCreditWallet() {
  const ctx = await requireWorkspace();
  return creditService.getWalletWithGrants(ctx.workspace.id);
}
