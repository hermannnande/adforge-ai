'use server';

import { revalidatePath } from 'next/cache';
import type { PlatformTarget, QualityMode } from '@prisma/client';

import { getActionAuth } from '@/lib/auth';
import { projectService } from '@/server/services/project.service';
import { userService } from '@/server/services/user.service';

async function requireWorkspace() {
  const session = await getActionAuth();
  if (!session) throw new Error('Unauthorized');
  const ctx = await userService.getWorkspaceByClerkId(session.userId);
  if (!ctx) throw new Error('No workspace found');
  return ctx;
}

export async function createProject(data: {
  name: string;
  platform?: PlatformTarget;
  qualityMode?: QualityMode;
  brandKitId?: string;
  objective?: string;
}) {
  const ctx = await requireWorkspace();

  const project = await projectService.create({
    workspaceId: ctx.workspace.id,
    ...data,
  });

  revalidatePath('/app/projects');
  revalidatePath('/app');

  return { success: true, project };
}

export async function deleteProject(projectId: string) {
  const ctx = await requireWorkspace();
  await projectService.softDelete(projectId, ctx.workspace.id);

  revalidatePath('/app/projects');
  revalidatePath('/app');

  return { success: true };
}

export async function getProjects() {
  const ctx = await requireWorkspace();
  return projectService.listByWorkspace(ctx.workspace.id);
}

export async function getProject(projectId: string) {
  const ctx = await requireWorkspace();
  return projectService.getById(projectId, ctx.workspace.id);
}
