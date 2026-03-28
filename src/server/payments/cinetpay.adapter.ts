import crypto from 'crypto';
import type {
  PaymentAdapter,
  CheckoutSessionParams,
  CheckoutSessionResult,
  WebhookEvent,
} from './types';

const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2';

interface CinetPayInitResponse {
  code: string;
  message: string;
  data: {
    payment_url: string;
    payment_token: string;
  };
  description?: string;
}

export class CinetPayAdapter implements PaymentAdapter {
  readonly name = 'cinetpay' as const;

  private get apiKey(): string {
    const key = process.env.CINETPAY_API_KEY;
    if (!key) throw new Error('CINETPAY_API_KEY is not set');
    return key;
  }

  private get siteId(): string {
    const id = process.env.CINETPAY_SITE_ID;
    if (!id) throw new Error('CINETPAY_SITE_ID is not set');
    return id;
  }

  isAvailable(): boolean {
    return !!(process.env.CINETPAY_API_KEY?.trim() && process.env.CINETPAY_SITE_ID?.trim());
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const transactionId = `adforge-${params.workspaceId}-${Date.now()}`;
    const amount = params.amountFcfa ?? 0;

    if (amount <= 0) throw new Error('CinetPay requires a positive amount');

    const payload = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: transactionId,
      amount,
      currency: 'XOF',
      description: params.description ?? `Top-up ${params.credits ?? 0} crédits AdForge AI`,
      return_url: params.successUrl,
      cancel_url: params.cancelUrl,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/payments/cinetpay/webhook`,
      channels: 'ALL',
      metadata: JSON.stringify({
        workspaceId: params.workspaceId,
        planSlug: params.planSlug ?? '',
        credits: String(params.credits ?? 0),
        ...params.metadata,
      }),
      customer_email: params.customerEmail,
      lang: 'fr',
    };

    const res = await fetch(`${CINETPAY_BASE_URL}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`CinetPay API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as CinetPayInitResponse;

    if (json.code !== '201') {
      throw new Error(`CinetPay payment init failed: ${json.message} — ${json.description ?? ''}`);
    }

    return {
      sessionId: transactionId,
      url: json.data.payment_url,
      provider: 'cinetpay',
    };
  }

  async constructWebhookEvent(body: string | Buffer, _signature: string): Promise<WebhookEvent> {
    const payload = JSON.parse(typeof body === 'string' ? body : body.toString('utf8')) as {
      cpm_trans_id?: string;
      cpm_site_id?: string;
      cpm_trans_status?: string;
      cpm_amount?: string;
      cpm_currency?: string;
      cpm_payment_method?: string;
      cel_phone_num?: string;
      [key: string]: unknown;
    };

    const checkRes = await fetch(`${CINETPAY_BASE_URL}/payment/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: payload.cpm_trans_id,
      }),
    });

    const checkData = (await checkRes.json()) as {
      code: string;
      data: Record<string, unknown>;
    };

    const status = String(checkData.data?.status ?? payload.cpm_trans_status ?? '');

    let eventType: string;
    switch (status) {
      case 'ACCEPTED':
        eventType = 'payment.succeeded';
        break;
      case 'REFUSED':
      case 'ERROR':
        eventType = 'payment.failed';
        break;
      case 'CANCELLED':
        eventType = 'payment.cancelled';
        break;
      default:
        eventType = 'payment.pending';
    }

    return {
      type: eventType,
      data: { ...payload, ...checkData.data } as Record<string, unknown>,
      provider: 'cinetpay',
      raw: { payload, checkData },
    };
  }

  verifySignature(body: string, signature: string): boolean {
    const secret = process.env.CINETPAY_SECRET_KEY;
    if (!secret) return false;
    const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return hmac === signature;
  }
}
