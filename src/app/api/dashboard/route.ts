import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerAuth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';

const GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
];

const EMPTY_DASHBOARD = {
  firstName: '',
  projectsCount: 0,
  balance: 20,
  creditsTotal: 20,
  planLabel: 'Plan Gratuit',
  generationsThisMonth: 0,
  recentProjects: [],
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = await userService.getWorkspaceByClerkId(session.userId);
    if (!ctx) {
      return json(EMPTY_DASHBOARD);
    }

    const wid = ctx.workspace.id;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [projectsCount, recentRaw, genCount, sub] = await Promise.all([
      prisma.project.count({ where: { workspaceId: wid, deletedAt: null } }),
      prisma.project.findMany({
        where: { workspaceId: wid, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: { settings: { select: { platform: true } } },
      }),
      prisma.aiJob.count({
        where: { workspaceId: wid, createdAt: { gte: monthStart } },
      }),
      prisma.subscription.findUnique({
        where: { workspaceId: wid },
        include: { plan: { select: { name: true, credits: true } } },
      }),
    ]);

    return json({
      firstName: ctx.user?.firstName ?? '',
      projectsCount,
      balance: ctx.wallet?.balance ?? 0,
      creditsTotal: sub?.plan.credits ?? 20,
      planLabel: sub?.plan.name ?? 'Plan Gratuit',
      generationsThisMonth: genCount,
      recentProjects: recentRaw.map((p, i) => ({
        id: p.id,
        name: p.name,
        platform: p.settings?.platform ?? 'CUSTOM',
        date: p.updatedAt.toISOString(),
        gradient: GRADIENTS[i % GRADIENTS.length],
      })),
    });
  } catch (error) {
    console.error('[/api/dashboard]', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 },
    );
  }
}

function json(data: unknown) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
    },
  });
}
