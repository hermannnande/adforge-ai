import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const GRANT_AMOUNT = 1000;

/**
 * Temporary endpoint to grant credits by email.
 * Secured by CLERK_SECRET_KEY check (only server-side knows it).
 * 
 * GET /api/admin/grant-credits?email=xxx&secret=CLERK_SECRET_KEY_VALUE
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const secret = url.searchParams.get('secret');

    const clerkSecret = process.env.CLERK_SECRET_KEY ?? '';
    if (!secret || secret !== clerkSecret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    if (!email) {
      return NextResponse.json({ error: 'email param required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true },
    });

    if (!user) {
      return NextResponse.json({ error: `User ${email} not found` }, { status: 404 });
    }

    const member = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      select: { workspaceId: true },
    });

    if (!member) {
      return NextResponse.json({ error: `No workspace for ${email}` }, { status: 404 });
    }

    let wallet = await prisma.creditWallet.findUnique({
      where: { workspaceId: member.workspaceId },
    });

    if (!wallet) {
      wallet = await prisma.creditWallet.create({
        data: { workspaceId: member.workspaceId, balance: 0 },
      });
    }

    const newBalance = wallet.balance + GRANT_AMOUNT;

    await prisma.$transaction(async (tx) => {
      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      await tx.creditGrant.create({
        data: {
          walletId: wallet.id,
          type: 'MANUAL',
          amount: GRANT_AMOUNT,
          remaining: GRANT_AMOUNT,
          description: `Admin grant for ${email}`,
        },
      });

      await tx.creditLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: 'GRANT',
          amount: GRANT_AMOUNT,
          balanceAfter: newBalance,
          category: 'admin',
          description: `Admin grant for ${email}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      email,
      user: user.firstName,
      workspaceId: member.workspaceId,
      previousBalance: wallet.balance,
      granted: GRANT_AMOUNT,
      newBalance,
    });
  } catch (error) {
    console.error('[Grant credits]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 },
    );
  }
}
