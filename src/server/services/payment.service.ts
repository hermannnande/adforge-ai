import { prisma } from '@/lib/db/prisma';
import {
  CreditEntryType,
  CreditSourceType,
  PaymentStatus,
  type PaymentProvider,
  type Prisma,
} from '@prisma/client';

export const paymentService = {
  async createPayment(params: {
    workspaceId: string;
    provider: PaymentProvider;
    type: string;
    amountFcfa?: number;
    amountEur?: number;
    currency?: string;
    description?: string;
    providerPayId?: string;
    metadata?: Record<string, unknown>;
    idempotencyKey?: string;
  }) {
    const metadataJson: Prisma.InputJsonValue | undefined =
      params.metadata === undefined
        ? undefined
        : (params.metadata as Prisma.InputJsonValue);

    return prisma.payment.create({
      data: {
        workspaceId: params.workspaceId,
        provider: params.provider,
        type: params.type,
        amountFcfa: params.amountFcfa,
        amountEur: params.amountEur,
        currency: params.currency ?? 'XOF',
        description: params.description,
        providerPayId: params.providerPayId,
        status: PaymentStatus.PENDING,
        metadata: metadataJson,
        idempotencyKey: params.idempotencyKey,
      },
    });
  },

  async updateStatus(paymentId: string, status: PaymentStatus, paidAt?: Date) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { status, paidAt },
    });
  },

  async findByProviderId(providerPayId: string) {
    return prisma.payment.findFirst({
      where: { providerPayId },
    });
  },

  async findByIdempotencyKey(key: string) {
    return prisma.payment.findFirst({
      where: { idempotencyKey: key },
    });
  },

  async recordEvent(
    paymentId: string,
    eventType: string,
    providerData: Record<string, unknown>,
  ) {
    return prisma.paymentEvent.create({
      data: {
        paymentId,
        eventType,
        providerData: providerData as Prisma.InputJsonValue,
      },
    });
  },

  async processTopup(params: {
    workspaceId: string;
    credits: number;
    paymentId: string;
    description?: string;
  }) {
    const wallet = await prisma.creditWallet.findUnique({
      where: { workspaceId: params.workspaceId },
    });
    if (!wallet) throw new Error('Wallet not found');

    const balanceAfter = wallet.balance + params.credits;

    await prisma.$transaction([
      prisma.creditGrant.create({
        data: {
          walletId: wallet.id,
          type: CreditSourceType.TOPUP,
          amount: params.credits,
          remaining: params.credits,
          sourcePaymentId: params.paymentId,
          description: params.description ?? `Top-up +${params.credits} crédits`,
        },
      }),
      prisma.creditWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: params.credits } },
      }),
      prisma.creditLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: CreditEntryType.GRANT,
          amount: params.credits,
          balanceAfter,
          category: 'TOPUP',
          description: `Top-up +${params.credits} crédits`,
          paymentId: params.paymentId,
        },
      }),
    ]);
  },

  async listByWorkspace(workspaceId: string, limit = 20) {
    return prisma.payment.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { events: { orderBy: { createdAt: 'desc' }, take: 3 } },
    });
  },

  async listInvoices(workspaceId: string, limit = 20) {
    return prisma.payment.findMany({
      where: { workspaceId, status: PaymentStatus.SUCCEEDED },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};
