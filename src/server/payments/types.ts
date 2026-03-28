export interface CheckoutSessionParams {
  workspaceId: string;
  customerEmail: string;
  priceId?: string;
  planSlug?: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  amountFcfa?: number;
  credits?: number;
  description?: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
  provider: 'stripe' | 'cinetpay';
}

export interface CustomerPortalResult {
  url: string;
}

export interface WebhookEvent {
  type: string;
  data: Record<string, unknown>;
  provider: 'stripe' | 'cinetpay';
  raw: unknown;
}

export interface PaymentAdapter {
  readonly name: 'stripe' | 'cinetpay';
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>;
  createCustomerPortal?(customerId: string, returnUrl: string): Promise<CustomerPortalResult>;
  constructWebhookEvent(body: string | Buffer, signature: string): Promise<WebhookEvent>;
  isAvailable(): boolean;
}
