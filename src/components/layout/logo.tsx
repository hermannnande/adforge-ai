import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2', className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <Sparkles className="size-4 text-primary-foreground" />
      </div>
      {!iconOnly && (
        <span className="font-heading text-lg font-bold tracking-tight">
          AdForge<span className="text-primary">&nbsp;AI</span>
        </span>
      )}
    </Link>
  );
}
