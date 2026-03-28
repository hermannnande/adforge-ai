'use server';

import { PLANS, TOPUP_PACKS } from '@/lib/constants/plans';
import { getPaymentAdapter } from '@/server/payments';
import { userService } from '@/server/services/user.service';

export type BillingPaymentProvider = 'stripe' | 'cinetpay';

function appBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

function stripePriceIdForPlan(slug: string): string {
  const map: Record<string, string | undefined> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
    studio: process.env.STRIPE_STUDIO_PRICE_ID,
  };
  const id = map[slug]?.trim();
  if (!id) {
    throw new Error(`Configuration Stripe incomplète : STRIPE_*_PRICE_ID pour « ${slug} »`);
  }
  return id;
}

export async function createTopupCheckout(params: {
  packIndex: number;
  provider: BillingPaymentProvider;
}): Promise<{ url: string }> {
  const ctx = await userService.requireCurrentWorkspace();
  const user = await userService.requireCurrentUser();
  const pack = TOPUP_PACKS[params.packIndex];
  if (!pack) {
    throw new Error('Pack invalide');
  }

  const adapter = getPaymentAdapter(params.provider);
  if (!adapter.isAvailable()) {
    throw new Error('Ce moyen de paiement est indisponible pour le moment');
  }

  const base = appBaseUrl();
  const result = await adapter.createCheckoutSession({
    workspaceId: ctx.workspace.id,
    customerEmail: user.email,
    mode: 'payment',
    successUrl: `${base}/app/billing?topup=success`,
    cancelUrl: `${base}/app/billing?topup=cancel`,
    amountFcfa: pack.priceFCFA,
    credits: pack.credits,
    description: `Recharge +${pack.credits} crédits`,
    metadata: { packIndex: String(params.packIndex) },
  });

  return { url: result.url };
}

export async function createCheckoutSession(params: {
  planSlug: string;
  provider: BillingPaymentProvider;
}): Promise<{ url: string }> {
  const ctx = await userService.requireCurrentWorkspace();
  const user = await userService.requireCurrentUser();

  const slug = params.planSlug.toLowerCase();
  const planEntry =
    slug === PLANS.STARTER.id
      ? PLANS.STARTER
      : slug === PLANS.PRO.id
        ? PLANS.PRO
        : slug === PLANS.STUDIO.id
          ? PLANS.STUDIO
          : null;
  if (!planEntry) {
    throw new Error('Plan inconnu');
  }

  const adapter = getPaymentAdapter(params.provider);
  if (!adapter.isAvailable()) {
    throw new Error('Ce moyen de paiement est indisponible pour le moment');
  }

  const base = appBaseUrl();

  if (params.provider === 'stripe') {
    const priceId = stripePriceIdForPlan(slug);
    const result = await adapter.createCheckoutSession({
      workspaceId: ctx.workspace.id,
      customerEmail: user.email,
      mode: 'subscription',
      priceId,
      planSlug: slug,
      successUrl: `${base}/app/billing?plan=success`,
      cancelUrl: `${base}/app/billing?plan=cancel`,
    });
    return { url: result.url };
  }

  const result = await adapter.createCheckoutSession({
    workspaceId: ctx.workspace.id,
    customerEmail: user.email,
    mode: 'payment',
    amountFcfa: planEntry.priceFCFA,
    planSlug: slug,
    description: `Abonnement ${planEntry.name} — 1er mois`,
    successUrl: `${base}/app/billing?plan=success`,
    cancelUrl: `${base}/app/billing?plan=cancel`,
    metadata: { billingType: 'subscription_first_period' },
  });

  return { url: result.url };
}
