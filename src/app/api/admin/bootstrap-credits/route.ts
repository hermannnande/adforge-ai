import { type NextRequest, NextResponse } from 'next/server';
import { getServerAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

const BOOTSTRAP_AMOUNT = 500;

/**
 * One-time bootstrap: gives the authenticated user's workspace 500 credits
 * if their wallet is at 0 or doesn't exist. Safe to call multiple times —
 * only grants once (when balance is 0).
 */
export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 });
    }

    let wallet = await prisma.creditWallet.findUnique({
      where: { workspaceId: member.workspaceId },
    });

    if (!wallet) {
      wallet = await prisma.creditWallet.create({
        data: { workspaceId: member.workspaceId, balance: 0 },
      });
    }

    if (wallet.balance > 0) {
      return NextResponse.json({
        message: 'Wallet already has credits',
        balance: wallet.balance,
      });
    }

    const newBalance = BOOTSTRAP_AMOUNT;

    await prisma.$transaction(async (tx) => {
      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      await tx.creditGrant.create({
        data: {
          walletId: wallet.id,
          type: 'TRIAL',
          amount: BOOTSTRAP_AMOUNT,
          remaining: BOOTSTRAP_AMOUNT,
          description: 'Bootstrap credits for testing',
        },
      });

      await tx.creditLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: 'GRANT',
          amount: BOOTSTRAP_AMOUNT,
          balanceAfter: newBalance,
          category: 'bootstrap',
          description: 'Bootstrap credits for testing',
        },
      });
    });

    return NextResponse.json({
      success: true,
      workspaceId: member.workspaceId,
      balance: newBalance,
      granted: BOOTSTRAP_AMOUNT,
    });
  } catch (error) {
    console.error('[Bootstrap credits]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 },
    );
  }
}
