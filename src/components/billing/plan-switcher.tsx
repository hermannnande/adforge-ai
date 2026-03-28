'use client';

import { useMemo, useState } from 'react';
import { Check, CreditCard, Loader2, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PLANS } from '@/lib/constants/plans';
import { cn } from '@/lib/utils';

type PaymentProvider = 'stripe' | 'cinetpay';

const PLAN_ORDER = [PLANS.STARTER, PLANS.PRO, PLANS.STUDIO] as const;

const FEATURE_COUNTS: Record<string, number> = {
  starter: 6,
  pro: 8,
  studio: 10,
};

const fcfaFormatter = new Intl.NumberFormat('fr-FR');

export type PlanSwitcherProps = {
  currentPlanSlug?: string;
};

export function PlanSwitcher({ currentPlanSlug }: PlanSwitcherProps) {
  const normalizedCurrent = currentPlanSlug?.toLowerCase();

  const defaultSlug = useMemo(() => {
    const next = PLAN_ORDER.find((p) => p.id !== normalizedCurrent);
    return next?.id ?? PLANS.PRO.id;
  }, [normalizedCurrent]);

  const [open, setOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (selectedSlug === normalizedCurrent) {
      setError('Sélectionnez un plan différent de votre plan actuel.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { createCheckoutSession } = await import('@/server/actions/billing.actions');
      const result = await createCheckoutSession({
        planSlug: selectedSlug,
        provider: selectedProvider,
      });
      window.location.href = result.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Changer de plan
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setError(null);
            setSelectedSlug(defaultSlug);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Changer de plan</DialogTitle>
            <DialogDescription>
              Choisissez un nouvel abonnement et un moyen de paiement.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {PLAN_ORDER.map((plan) => {
              const isCurrent = plan.id === normalizedCurrent;
              const selected = selectedSlug === plan.id && !isCurrent;
              const featureCount = FEATURE_COUNTS[plan.id] ?? plan.features.length;

              return (
                <button
                  key={plan.id}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => {
                    if (!isCurrent) setSelectedSlug(plan.id);
                  }}
                  className={cn(
                    'relative flex flex-col gap-2 rounded-xl border bg-card p-4 text-left ring-foreground/10 transition-all',
                    !isCurrent && 'hover:bg-muted/40',
                    isCurrent && 'opacity-60',
                    selected && 'ring-2 ring-primary',
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading text-base font-semibold">{plan.name}</span>
                    {'popular' in plan && plan.popular ? (
                      <Badge variant="secondary">Populaire</Badge>
                    ) : null}
                    {isCurrent ? <Badge variant="outline">Plan actuel</Badge> : null}
                  </div>
                  <p className="text-sm font-medium tabular-nums">
                    {fcfaFormatter.format(plan.priceFCFA)} FCFA / mois
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {plan.credits} crédits / mois
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {featureCount} fonctionnalités incluses
                  </p>
                  {selected ? (
                    <span className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium">Moyen de paiement</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={selectedProvider === 'stripe' ? 'default' : 'outline'}
                className={cn(
                  'w-full',
                  selectedProvider === 'stripe' && 'bg-primary text-primary-foreground',
                )}
                onClick={() => setSelectedProvider('stripe')}
              >
                <CreditCard className="size-4" />
                Carte bancaire
              </Button>
              <Button
                type="button"
                variant={selectedProvider === 'cinetpay' ? 'default' : 'outline'}
                className={cn(
                  'w-full',
                  selectedProvider === 'cinetpay' && 'bg-primary text-primary-foreground',
                )}
                onClick={() => setSelectedProvider('cinetpay')}
              >
                <Smartphone className="size-4" />
                Mobile Money
              </Button>
            </div>
          </div>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            className="w-full"
            disabled={loading || selectedSlug === normalizedCurrent}
            onClick={() => void handleConfirm()}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Redirection…
              </>
            ) : (
              'Confirmer le changement'
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
