'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardContent className="space-y-4 pt-8">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.message ||
                "Quelque chose s'est mal passé. Veuillez réessayer."}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button onClick={reset}>Réessayer</Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/admin';
              }}
            >
              Retour à l&apos;admin
            </Button>
          </div>
          {error.digest ? (
            <p className="text-xs text-muted-foreground">
              Code: {error.digest}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
