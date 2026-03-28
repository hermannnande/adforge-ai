import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="size-10 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">Page introuvable</p>
        <p className="mt-1 text-sm text-muted-foreground">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button nativeButton={false} render={<Link href="/" />}>
            Retour à l&apos;accueil
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/app" />}
          >
            Tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}
