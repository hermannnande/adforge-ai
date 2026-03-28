import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { userService } from '@/server/services/user.service';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ctx = await userService.getCurrentWorkspace();
    if (!ctx) {
      return NextResponse.json({
        firstName: '',
        projectsCount: 0,
        projectsThisWeek: 0,
        balance: 20,
        creditsTotal: 20,
        planLabel: 'Plan Gratuit',
        generationsThisMonth: 0,
        genSubtitle: 'Commencez à créer !',
        exportsCount: 0,
        exportsThisWeek: 0,
        monthlyBurn: 0,
        creditsProgress: 0,
        recentProjects: [],
      });
    }

    const workspaceId = ctx.workspace.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const y = now.getFullYear();
    const m = now.getMonth();
    const startOfPrevMonth = new Date(y, m - 1, 1);
    const startOfCurrMonth = new Date(y, m, 1);

    const [
      projectsCount,
      recentProjectsRaw,
      generationsThisMonth,
      exportsCount,
      subscription,
      projectsThisWeek,
      generationsLastMonth,
      exportsThisWeek,
      monthlyBurnAgg,
    ] = await Promise.all([
      prisma.project.count({ where: { workspaceId, deletedAt: null } }),
      prisma.project.findMany({
        where: { workspaceId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: { settings: true },
      }),
      prisma.aiJob.count({
        where: { workspaceId, createdAt: { gte: startOfMonth } },
      }),
      prisma.generatedImage.count({
        where: { project: { workspaceId, deletedAt: null } },
      }),
      prisma.subscription.findUnique({
        where: { workspaceId },
        include: { plan: true },
      }),
      prisma.project.count({
        where: { workspaceId, deletedAt: null, createdAt: { gte: weekStart } },
      }),
      prisma.aiJob.count({
        where: {
          workspaceId,
          createdAt: { gte: startOfPrevMonth, lt: startOfCurrMonth },
        },
      }),
      prisma.generatedImage.count({
        where: {
          project: { workspaceId, deletedAt: null },
          createdAt: { gte: weekStart },
        },
      }),
      prisma.creditLedgerEntry.aggregate({
        where: {
          wallet: { workspaceId },
          type: 'BURN',
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    const balance = ctx.wallet?.balance ?? 0;
    const creditsTotal = subscription?.plan.credits ?? 20;
    const planLabel = subscription?.plan.name ?? 'Plan Gratuit';
    const monthlyBurn = monthlyBurnAgg._sum.amount ?? 0;
    const creditsProgress = Math.min(
      100,
      Math.round((monthlyBurn / Math.max(creditsTotal, 1)) * 100),
    );
    const genDelta = generationsThisMonth - generationsLastMonth;
    const genSubtitle =
      genDelta > 0
        ? `+${genDelta} vs mois dernier`
        : genDelta < 0
          ? `${genDelta} vs mois dernier`
          : 'Stable vs mois dernier';

    const GRADIENTS = [
      'from-indigo-500 to-purple-600',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
    ];

    const recentProjects = recentProjectsRaw.map((p, i) => ({
      id: p.id,
      name: p.name,
      platform: p.settings?.platform ?? 'Projet',
      date: p.updatedAt.toISOString(),
      gradient: GRADIENTS[i % GRADIENTS.length],
    }));

    return NextResponse.json({
      firstName: ctx.user?.firstName ?? '',
      projectsCount,
      projectsThisWeek,
      balance,
      creditsTotal,
      planLabel,
      generationsThisMonth,
      genSubtitle,
      exportsCount,
      exportsThisWeek,
      monthlyBurn,
      creditsProgress,
      recentProjects,
    });
  } catch (error) {
    console.error('[/api/dashboard] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 },
    );
  }
}
