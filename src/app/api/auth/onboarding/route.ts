import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { brandName, primaryColor, secondaryColor, objective, platform } = body;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        workspaceMembers: {
          include: { workspace: true },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const workspace = user.workspaceMembers[0]?.workspace;
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.workspace.update({
        where: { id: workspace.id },
        data: { name: brandName || workspace.name },
      }),

      ...(brandName
        ? [
            prisma.brandKit.create({
              data: {
                workspaceId: workspace.id,
                name: `${brandName} — Brand Kit`,
                brandName,
                primaryColors: primaryColor ? [primaryColor] : [],
                secondaryColors: secondaryColor ? [secondaryColor] : [],
                forbiddenColors: [],
                fonts: [],
                preferredCTAs: [],
                forbiddenWords: [],
                referenceUrls: [],
              },
            }),
          ]
        : []),

      prisma.user.update({
        where: { id: user.id },
        data: { onboardingDone: true },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        action: 'onboarding_completed',
        metadata: { brandName, primaryColor, secondaryColor, objective, platform },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
