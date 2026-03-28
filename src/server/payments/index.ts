export * from './types';
export { StripeAdapter } from './stripe.adapter';
export { CinetPayAdapter } from './cinetpay.adapter';

import { StripeAdapter } from './stripe.adapter';
import { CinetPayAdapter } from './cinetpay.adapter';
import type { PaymentAdapter } from './types';

const adapters: PaymentAdapter[] = [new StripeAdapter(), new CinetPayAdapter()];

export function getPaymentAdapter(name: 'stripe' | 'cinetpay'): PaymentAdapter {
  const adapter = adapters.find((a) => a.name === name);
  if (!adapter) throw new Error(`Payment adapter "${name}" not found`);
  return adapter;
}

export function getAvailablePaymentAdapters(): PaymentAdapter[] {
  return adapters.filter((a) => a.isAvailable());
}

export function getDefaultPaymentAdapter(): PaymentAdapter {
  const stripe = adapters.find((a) => a.name === 'stripe');
  if (stripe?.isAvailable()) return stripe;
  const cinetpay = adapters.find((a) => a.name === 'cinetpay');
  if (cinetpay?.isAvailable()) return cinetpay;
  throw new Error('No payment adapter available');
}
