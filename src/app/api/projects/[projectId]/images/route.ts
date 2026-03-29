import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerAuth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await getServerAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = await userService.getWorkspaceByClerkId(session.userId);
    if (!ctx) {
      return NextResponse.json({ images: [] });
    }

    const { projectId } = await params;

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: ctx.workspace.id, deletedAt: null },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const images = await prisma.generatedImage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        imageUrl: true,
        width: true,
        height: true,
        prompt: true,
        provider: true,
        model: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        images: images.map((img) => ({
          id: img.id,
          url: img.imageUrl,
          width: img.width,
          height: img.height,
          prompt: img.prompt,
          provider: img.provider,
          model: img.model,
          createdAt: img.createdAt.toISOString(),
        })),
      },
      { headers: { 'Cache-Control': 'private, max-age=5, stale-while-revalidate=15' } },
    );
  } catch (error) {
    console.error('[/api/projects/[id]/images]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
