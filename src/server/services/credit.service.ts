import { prisma } from '@/lib/db/prisma';

export const creditService = {
  async getBalance(workspaceId: string): Promise<number> {
    const wallet = await prisma.creditWallet.findUnique({
      where: { workspaceId },
      select: { balance: true },
    });
    return wallet?.balance ?? 0;
  },

  async getWalletWithGrants(workspaceId: string) {
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

    await prisma.$transaction(async (tx) => {
      const wallet = await tx.creditWallet.findUnique({
        where: { workspaceId },
      });
      if (!wallet || wallet.balance < amount) {
        throw new Error('Crédits insuffisants');
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
