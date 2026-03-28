'use client';

import { useState } from 'react';
import { CreditCard, Loader2, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TOPUP_PACKS } from '@/lib/constants/plans';
import { cn } from '@/lib/utils';

type PaymentProvider = 'stripe' | 'cinetpay';

const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

const fcfaFormatter = new Intl.NumberFormat('fr-FR');

export function TopupDialog() {
  const [open, setOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    try {
      const { createTopupCheckout } = await import('@/server/actions/billing.actions');
      const result = await createTopupCheckout({
        packIndex: selectedPack,
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
        <Sparkles className="size-4" />
        Acheter des crédits
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acheter des crédits supplémentaires</DialogTitle>
            <DialogDescription>
              Choisissez un pack et votre moyen de paiement.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {TOPUP_PACKS.map((pack, index) => {
              const selected = selectedPack === index;
              return (
                <button
                  key={pack.credits}
                  type="button"
                  onClick={() => setSelectedPack(index)}
                  className={cn(
                    'flex flex-col items-start gap-1 rounded-xl border bg-card p-4 text-left ring-foreground/10 transition-all',
                    'hover:bg-muted/40',
                    selected && 'ring-2 ring-primary',
                  )}
                >
                  <span className="font-heading text-3xl font-semibold tabular-nums">
                    {pack.credits}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    crédits
                  </span>
                  <span className="text-sm font-medium">
                    {fcfaFormatter.format(pack.priceFCFA)} FCFA
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ≈ {eurFormatter.format(pack.priceEUR)}
                  </span>
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
            disabled={loading}
            onClick={() => void handlePurchase()}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Redirection…
              </>
            ) : (
              'Payer'
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
