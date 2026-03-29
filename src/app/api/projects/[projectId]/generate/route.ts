import { type NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { generationService } from '@/server/services/generation.service';
import type { QualityMode } from '@prisma/client';
import type { ImageProviderName } from '@/server/ai/image';

const VALID_PROVIDERS = new Set(['openai', 'flux', 'ideogram']);

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
    const body = await req.json();

    const brief = body.brief;
    const suggestion = body.suggestion;
    if (!brief || !suggestion) {
      return NextResponse.json(
        { error: 'brief and suggestion are required' },
        { status: 400 },
      );
    }

    const qualityMode: QualityMode = body.qualityMode ?? 'STANDARD';
    const platform: string = body.platform ?? 'facebook';
    const providerOverride: ImageProviderName | undefined =
      body.provider && VALID_PROVIDERS.has(body.provider)
        ? (body.provider as ImageProviderName)
        : undefined;

    const result = await generationService.generateImage({
      projectId,
      workspaceId: ctx.workspace.id,
      brief,
      suggestion,
      qualityMode,
      platform,
      providerOverride,
      brandKit: undefined,
    });

    return NextResponse.json({
      images: result.images.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        width: img.width,
        height: img.height,
      })),
      prompt: result.prompt,
      jobId: result.job.id,
      provider: result.provider,
      model: result.model,
      routerReason: result.routerReason,
      creditsCost: result.estimatedCost,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Generation failed';
    console.error('[/api/projects/[id]/generate]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
