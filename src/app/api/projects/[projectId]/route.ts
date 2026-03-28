import { type NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { projectService } from '@/server/services/project.service';

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
      return NextResponse.json({ error: 'No workspace' }, { status: 404 });
    }

    const { projectId } = await params;
    const project = await projectService.getById(projectId, ctx.workspace.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      platform: project.settings?.platform ?? 'CUSTOM',
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[/api/projects/[id] GET]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
