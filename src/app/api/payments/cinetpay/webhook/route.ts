import { NextRequest, NextResponse } from 'next/server';
import { CinetPayAdapter } from '@/server/payments/cinetpay.adapter';
import { subscriptionService } from '@/server/services/subscription.service';
import { paymentService } from '@/server/services/payment.service';

const cinetpay = new CinetPayAdapter();

function parseAmount(data: Record<string, unknown>): number {
  const raw = data.cpm_amount ?? data.amount;
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  return parseInt(String(raw ?? '0'), 10) || 0;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-cinetpay-signature') ?? '';

    const event = await cinetpay.constructWebhookEvent(body, signature);
    const data = event.data;

    const transactionId =
      typeof data.cpm_trans_id === 'string' ? data.cpm_trans_id : undefined;
    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
    }

    let metadata: Record<string, string> = {};
    try {
      const raw = data.metadata;
      if (typeof raw === 'string' && raw.trim()) {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
          for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
            if (typeof v === 'string') metadata[k] = v;
          }
        }
      }
    } catch {
      /* ignore parse errors */
    }

    const workspaceId = metadata.workspaceId;
    const planSlug = metadata.planSlug?.trim() || undefined;
    const credits = parseInt(metadata.credits ?? '0', 10);

    if (!workspaceId) {
      return NextResponse.json({ received: true });
    }

    const amount = parseAmount(data);

    if (event.type === 'payment.succeeded') {
      if (planSlug) {
        await subscriptionService.activateSubscription({
          workspaceId,
          planSlug,
          provider: 'CINETPAY',
        });
        const payment = await paymentService.createPayment({
          workspaceId,
          provider: 'CINETPAY',
          type: 'subscription',
          providerPayId: transactionId,
          amountFcfa: amount,
          description: `Abonnement ${planSlug} via Mobile Money`,
          idempotencyKey: `cinet-sub-${transactionId}`,
        });
        await paymentService.updateStatus(payment.id, 'SUCCEEDED', new Date());
      } else if (credits > 0) {
        const payment = await paymentService.createPayment({
          workspaceId,
          provider: 'CINETPAY',
          type: 'topup',
          providerPayId: transactionId,
          amountFcfa: amount,
          description: `Top-up ${credits} crédits via Mobile Money`,
          idempotencyKey: `cinet-topup-${transactionId}`,
        });
        await paymentService.updateStatus(payment.id, 'SUCCEEDED', new Date());
        await paymentService.processTopup({
          workspaceId,
          credits,
          paymentId: payment.id,
        });
      }

      const existingPayment =
        await paymentService.findByProviderId(transactionId);
      if (existingPayment) {
        await paymentService.recordEvent(
          existingPayment.id,
          event.type,
          event.data,
        );
      }
    } else if (event.type === 'payment.failed') {
      const existingPayment =
        await paymentService.findByProviderId(transactionId);
      if (existingPayment) {
        await paymentService.updateStatus(existingPayment.id, 'FAILED');
        await paymentService.recordEvent(
          existingPayment.id,
          event.type,
          event.data,
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[CinetPay Webhook Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook error' },
      { status: 400 },
    );
  }
}
