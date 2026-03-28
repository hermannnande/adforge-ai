import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerAuth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = await userService.getWorkspaceByClerkId(session.userId);
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
    console.error('[/api/projects] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load projects' },
      { status: 500 },
    );
  }
}
