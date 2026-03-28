import { type NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { projectService } from '@/server/services/project.service';
import type { PlatformTarget } from '@prisma/client';

function deriveProjectName(prompt: string): string {
  const cleaned = prompt.replace(/[^\w\sÀ-ÿ]/g, '').trim();
  const words = cleaned.split(/\s+/).slice(0, 5);
  const name = words.join(' ');
  return name.length > 2 ? name.charAt(0).toUpperCase() + name.slice(1) : 'Nouveau projet';
}

const VALID_PLATFORMS = new Set([
  'FACEBOOK_ADS',
  'INSTAGRAM_FEED',
  'INSTAGRAM_STORY',
  'TIKTOK_ADS',
  'FLYER_PRINT',
  'CUSTOM',
]);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = await userService.getWorkspaceByClerkId(session.userId);
    if (!ctx) {
      return NextResponse.json({ error: 'No workspace' }, { status: 404 });
    }

    const body = await req.json();
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const platform = (
      VALID_PLATFORMS.has(body.platform) ? body.platform : 'FACEBOOK_ADS'
    ) as PlatformTarget;

    const project = await projectService.create({
      workspaceId: ctx.workspace.id,
      name: deriveProjectName(prompt),
      platform,
      objective: prompt,
    });

    return NextResponse.json({
      projectId: project.id,
      projectName: project.name,
    });
  } catch (error) {
    console.error('[/api/projects/quick-create]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
