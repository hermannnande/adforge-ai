import Stripe from 'stripe';
import type {
  PaymentAdapter,
  CheckoutSessionParams,
  CheckoutSessionResult,
  CustomerPortalResult,
  WebhookEvent,
} from './types';

export class StripeAdapter implements PaymentAdapter {
  readonly name = 'stripe' as const;
  private _client: Stripe | null = null;

  private get client(): Stripe {
    if (!this._client) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
      this._client = new Stripe(key);
    }
    return this._client;
  }

  isAvailable(): boolean {
    return !!process.env.STRIPE_SECRET_KEY?.trim();
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (params.mode === 'subscription' && params.priceId) {
      lineItems.push({ price: params.priceId, quantity: 1 });
    } else if (params.mode === 'payment' && params.amountFcfa) {
      lineItems.push({
        price_data: {
          currency: 'xof',
          product_data: {
            name: params.description ?? `Top-up ${params.credits ?? 0} crédits`,
          },
          unit_amount: params.amountFcfa,
        },
        quantity: 1,
      });
    }

    const session = await this.client.checkout.sessions.create({
      mode: params.mode,
      customer_email: params.customerEmail,
      line_items: lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        workspaceId: params.workspaceId,
        planSlug: params.planSlug ?? '',
        credits: String(params.credits ?? 0),
        ...params.metadata,
      },
    });

    if (!session.url) throw new Error('Stripe session URL is null');

    return {
      sessionId: session.id,
      url: session.url,
      provider: 'stripe',
    };
  }

  async createCustomerPortal(customerId: string, returnUrl: string): Promise<CustomerPortalResult> {
    const session = await this.client.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  async constructWebhookEvent(body: string | Buffer, signature: string): Promise<WebhookEvent> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');

    const event = this.client.webhooks.constructEvent(
      typeof body === 'string' ? body : body.toString('utf8'),
      signature,
      secret,
    );

    return {
      type: event.type,
      data: event.data.object as unknown as Record<string, unknown>,
      provider: 'stripe',
      raw: event,
    };
  }
}
