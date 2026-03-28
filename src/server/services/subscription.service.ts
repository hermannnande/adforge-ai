import { prisma } from '@/lib/db/prisma';
import {
  CreditEntryType,
  CreditSourceType,
  PaymentProvider,
  SubscriptionStatus,
} from '@prisma/client';

export const subscriptionService = {
  async getByWorkspace(workspaceId: string) {
    return prisma.subscription.findUnique({
      where: { workspaceId },
      include: { plan: true },
    });
  },

  async activateSubscription(params: {
    workspaceId: string;
    planSlug: string;
    provider: PaymentProvider;
    providerSubId?: string;
    providerCustomerId?: string;
    periodStart?: Date;
    periodEnd?: Date;
  }) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: params.planSlug },
    });
    if (!plan) throw new Error(`Plan "${params.planSlug}" not found`);

    const subscription = await prisma.subscription.upsert({
      where: { workspaceId: params.workspaceId },
      create: {
        workspaceId: params.workspaceId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        provider: params.provider,
        providerSubId: params.providerSubId,
        providerCustomerId: params.providerCustomerId,
        currentPeriodStart: params.periodStart ?? new Date(),
        currentPeriodEnd: params.periodEnd ?? getNextMonthDate(),
      },
      update: {
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        provider: params.provider,
        providerSubId: params.providerSubId ?? undefined,
        providerCustomerId: params.providerCustomerId ?? undefined,
        currentPeriodStart: params.periodStart ?? new Date(),
        currentPeriodEnd: params.periodEnd ?? getNextMonthDate(),
        cancelledAt: null,
      },
      include: { plan: true },
    });

    await grantMonthlyCredits(params.workspaceId, plan.credits, plan.id);

    return subscription;
  },

  async cancelSubscription(workspaceId: string) {
    return prisma.subscription.update({
      where: { workspaceId },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  },

  async renewSubscription(workspaceId: string) {
    const existing = await prisma.subscription.findUnique({
      where: { workspaceId },
      include: { plan: true },
    });
    if (!existing) throw new Error('Subscription not found');

    const newStart = new Date();
    const newEnd = getNextMonthDate();

    const updated = await prisma.subscription.update({
      where: { workspaceId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: newStart,
        currentPeriodEnd: newEnd,
      },
      include: { plan: true },
    });

    await grantMonthlyCredits(workspaceId, updated.plan.credits, updated.plan.id);

    return updated;
  },

  async markPastDue(workspaceId: string) {
    return prisma.subscription.update({
      where: { workspaceId },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
  },

  async changePlan(workspaceId: string, newPlanSlug: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: newPlanSlug },
    });
    if (!plan) throw new Error(`Plan "${newPlanSlug}" not found`);

    return prisma.subscription.update({
      where: { workspaceId },
      data: { planId: plan.id },
      include: { plan: true },
    });
  },
};

async function grantMonthlyCredits(
  workspaceId: string,
  credits: number,
  planId: string,
): Promise<void> {
  const wallet = await prisma.creditWallet.findUnique({
    where: { workspaceId },
  });
  if (!wallet) return;

  const expiresAt = getNextMonthDate();
  const balanceAfter = wallet.balance + credits;

  await prisma.$transaction([
    prisma.creditGrant.create({
      data: {
        walletId: wallet.id,
        type: CreditSourceType.MONTHLY_ALLOCATION,
        amount: credits,
        remaining: credits,
        expiresAt,
        description: `Allocation mensuelle — plan ${planId}`,
      },
    }),
    prisma.creditWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: credits } },
    }),
    prisma.creditLedgerEntry.create({
      data: {
        walletId: wallet.id,
        type: CreditEntryType.GRANT,
        amount: credits,
        balanceAfter,
        category: 'MONTHLY_ALLOCATION',
        description: `Allocation mensuelle +${credits} crédits`,
      },
    }),
  ]);
}

function getNextMonthDate(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}
