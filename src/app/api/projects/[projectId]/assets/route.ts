import { type NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { prisma } from '@/lib/db/prisma';

export const maxDuration = 30;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(
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

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 4) {
      return NextResponse.json({ error: 'Maximum 4 images' }, { status: 400 });
    }

    const assets: Array<{ id: string; url: string; name: string; width: number | null; height: number | null }> = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      const asset = await prisma.asset.create({
        data: {
          workspaceId: ctx.workspace.id,
          projectId,
          type: 'REFERENCE',
          name: file.name || 'reference.png',
          url: dataUrl,
          mimeType: file.type,
          sizeBytes: file.size,
        },
      });

      assets.push({
        id: asset.id,
        url: dataUrl,
        name: asset.name,
        width: asset.width,
        height: asset.height,
      });
    }

    return NextResponse.json({ assets });
  } catch (error) {
    console.error('[/api/projects/[id]/assets]', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 },
    );
  }
}
