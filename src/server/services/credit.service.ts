import { prisma } from '@/lib/db/prisma';

const INITIAL_CREDITS = 500;

async function ensureWallet(workspaceId: string) {
  let wallet = await prisma.creditWallet.findUnique({
    where: { workspaceId },
  });

  if (!wallet) {
    wallet = await prisma.creditWallet.create({
      data: { workspaceId, balance: INITIAL_CREDITS },
    });

    await prisma.creditGrant.create({
      data: {
        walletId: wallet.id,
        type: 'TRIAL',
        amount: INITIAL_CREDITS,
        remaining: INITIAL_CREDITS,
        description: 'Crédits de bienvenue',
      },
    });

    await prisma.creditLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: 'GRANT',
        amount: INITIAL_CREDITS,
        balanceAfter: INITIAL_CREDITS,
        category: 'welcome',
        description: 'Crédits de bienvenue',
      },
    });

    console.log(`[Credits] Auto-provisioned wallet for workspace ${workspaceId} with ${INITIAL_CREDITS} credits`);
  }

  return wallet;
}

export const creditService = {
  async getBalance(workspaceId: string): Promise<number> {
    const wallet = await ensureWallet(workspaceId);
    return wallet.balance;
  },

  async getWalletWithGrants(workspaceId: string) {
    await ensureWallet(workspaceId);
    return prisma.creditWallet.findUnique({
      where: { workspaceId },
      include: { grants: true },
    });
  },

  async canAfford(workspaceId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(workspaceId);
    return balance >= amount;
  },

  async burnCredits(
    workspaceId: string,
    amount: number,
    meta?: { jobId?: string; description?: string },
  ): Promise<void> {
    if (amount <= 0) return;

    await ensureWallet(workspaceId);

    await prisma.$transaction(async (tx) => {
      const wallet = await tx.creditWallet.findUnique({
        where: { workspaceId },
      });
      if (!wallet || wallet.balance < amount) {
        throw new Error(
          `Crédits insuffisants (${amount} requis, ${wallet?.balance ?? 0} disponibles)`,
        );
      }

      const balanceAfter = wallet.balance - amount;

      await tx.creditWallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      await tx.creditLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: 'BURN',
          amount,
          balanceAfter,
          category: 'generation',
          description: meta?.description,
          jobId: meta?.jobId,
        },
      });
    });
  },
};
