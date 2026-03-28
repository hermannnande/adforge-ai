import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerAuth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { projectService } from '@/server/services/project.service';

async function resolveWorkspace(req: NextRequest) {
  const session = await getServerAuth(req);
  if (!session) return null;
  const ctx = await userService.getWorkspaceByClerkId(session.userId);
  return ctx;
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await resolveWorkspace(req);
    if (!ctx) {
      return NextResponse.json({ projects: [], total: 0 });
    }

    const projects = await prisma.project.findMany({
      where: {
        workspaceId: ctx.workspace.id,
        deletedAt: null,
        status: { not: 'DELETED' },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        settings: { select: { platform: true } },
        _count: { select: { generatedImages: true } },
      },
    });

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        platform: p.settings?.platform ?? null,
        updatedAt: p.updatedAt.toISOString(),
        imageCount: p._count.generatedImages,
      })),
      total: projects.length,
      workspaceId: ctx.workspace.id,
    });
  } catch (error) {
    console.error('[/api/projects GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load projects' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await resolveWorkspace(req);
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du projet est requis' },
        { status: 400 },
      );
    }

    const project = await projectService.create({
      workspaceId: ctx.workspace.id,
      name,
      platform: body.platform || undefined,
      objective: body.objective || undefined,
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('[/api/projects POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 },
    );
  }
}
