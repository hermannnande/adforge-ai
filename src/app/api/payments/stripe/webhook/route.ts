import { NextRequest, NextResponse } from 'next/server';
import { StripeAdapter } from '@/server/payments/stripe.adapter';
import { subscriptionService } from '@/server/services/subscription.service';
import { paymentService } from '@/server/services/payment.service';

const stripe = new StripeAdapter();

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function asStringMetadata(
  meta: unknown,
): Record<string, string> | undefined {
  const r = asRecord(meta);
  if (!r) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === 'string') out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = await stripe.constructWebhookEvent(body, signature);
    const data = event.data;

    switch (event.type) {
      case 'checkout.session.completed': {
        const metadata = asStringMetadata(data.metadata);
        const workspaceId = metadata?.workspaceId;
        const planSlug = metadata?.planSlug;
        const credits = parseInt(metadata?.credits ?? '0', 10);
        const mode = typeof data.mode === 'string' ? data.mode : '';
        const customerId =
          typeof data.customer === 'string' ? data.customer : undefined;
        const subscriptionId =
          typeof data.subscription === 'string' ? data.subscription : undefined;
        const sessionId = typeof data.id === 'string' ? data.id : undefined;

        if (!workspaceId) break;

        if (mode === 'subscription' && planSlug) {
          await subscriptionService.activateSubscription({
            workspaceId,
            planSlug,
            provider: 'STRIPE',
            providerSubId: subscriptionId,
            providerCustomerId: customerId,
          });
        } else if (mode === 'payment' && credits > 0 && sessionId) {
          const amountTotal =
            typeof data.amount_total === 'number' ? data.amount_total : undefined;
          const payment = await paymentService.createPayment({
            workspaceId,
            provider: 'STRIPE',
            type: 'topup',
            providerPayId: sessionId,
            amountFcfa: amountTotal,
            description: `Top-up ${credits} crédits`,
            idempotencyKey: `stripe-topup-${sessionId}`,
          });
          await paymentService.updateStatus(payment.id, 'SUCCEEDED', new Date());
          await paymentService.processTopup({
            workspaceId,
            credits,
            paymentId: payment.id,
          });
        }
        break;
      }

      case 'invoice.paid': {
        const subscriptionRaw = data.subscription;
        const subscriptionId =
          typeof subscriptionRaw === 'string' ? subscriptionRaw : undefined;
        if (!subscriptionId) break;

        const subDetails = asRecord(data.subscription_details);
        const metadata = asStringMetadata(subDetails?.metadata);
        const workspaceId = metadata?.workspaceId;
        const invoiceId = typeof data.id === 'string' ? data.id : undefined;
        if (!workspaceId || !invoiceId) break;

        await subscriptionService.renewSubscription(workspaceId);
        const amountPaid =
          typeof data.amount_paid === 'number' ? data.amount_paid : 0;
        const payment = await paymentService.createPayment({
          workspaceId,
          provider: 'STRIPE',
          type: 'subscription',
          providerPayId: invoiceId,
          amountFcfa: amountPaid,
          description: 'Renouvellement abonnement',
          idempotencyKey: `stripe-inv-${invoiceId}`,
        });
        await paymentService.updateStatus(payment.id, 'SUCCEEDED', new Date());
        break;
      }

      case 'invoice.payment_failed': {
        const subDetails = asRecord(data.subscription_details);
        const metadata = asStringMetadata(subDetails?.metadata);
        const workspaceId = metadata?.workspaceId;
        if (workspaceId) {
          await subscriptionService.markPastDue(workspaceId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const metadata = asStringMetadata(data.metadata);
        const workspaceId = metadata?.workspaceId;
        if (workspaceId) {
          await subscriptionService.cancelSubscription(workspaceId);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook Error]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook error' },
      { status: 400 },
    );
  }
}
