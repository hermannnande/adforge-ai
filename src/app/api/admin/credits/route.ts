import { type NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: session.userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { workspaceId, amount, description } = body as {
      workspaceId?: string;
      amount?: number;
      description?: string;
    };

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'amount must be > 0' }, { status: 400 });
    }

    let targetWorkspaceId = workspaceId;

    if (!targetWorkspaceId) {
      const member = await prisma.workspaceMember.findFirst({
        where: { user: { clerkId: session.userId } },
        select: { workspaceId: true },
      });
      targetWorkspaceId = member?.workspaceId;
    }

    if (!targetWorkspaceId) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    let wallet = await prisma.creditWallet.findUnique({
      where: { workspaceId: targetWorkspaceId },
    });

    if (!wallet) {
      wallet = await prisma.creditWallet.create({
        data: { workspaceId: targetWorkspaceId, balance: 0 },
      });
    }

    const newBalance = wallet.balance + amount;

    await prisma.$transaction(async (tx) => {
      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      await tx.creditGrant.create({
        data: {
          walletId: wallet.id,
          type: 'MANUAL',
          amount,
          remaining: amount,
          description: description ?? `Admin grant: ${amount} credits`,
        },
      });

      await tx.creditLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: 'GRANT',
          amount,
          balanceAfter: newBalance,
          category: 'admin',
          description: description ?? `Admin grant: ${amount} credits`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      workspaceId: targetWorkspaceId,
      previousBalance: wallet.balance,
      added: amount,
      newBalance,
    });
  } catch (error) {
    console.error('[Admin credits]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuth(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await prisma.workspaceMember.findFirst({
      where: { user: { clerkId: session.userId } },
      select: { workspaceId: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'No workspace' }, { status: 404 });
    }

    const wallet = await prisma.creditWallet.findUnique({
      where: { workspaceId: member.workspaceId },
      select: { balance: true },
    });

    return NextResponse.json({
      workspaceId: member.workspaceId,
      balance: wallet?.balance ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 },
    );
  }
}
