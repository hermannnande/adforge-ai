'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  BarChart3,
  CreditCard,
  Flag,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ADMIN_NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/subscriptions', icon: Settings, label: 'Abonnements' },
  { href: '/admin/payments', icon: CreditCard, label: 'Paiements' },
  { href: '/admin/wallets', icon: Wallet, label: 'Wallets' },
  { href: '/admin/jobs', icon: Zap, label: 'Jobs IA' },
  { href: '/admin/moderation', icon: Flag, label: 'Modération' },
  { href: '/admin/templates', icon: LayoutGrid, label: 'Templates' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Admin sidebar */}
      <aside className="flex w-64 flex-col border-r border-border bg-sidebar">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo iconOnly />
            <Badge variant="secondary" className="text-[10px]">
              Admin
            </Badge>
          </div>
          <ThemeToggle />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {ADMIN_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Retour à l&apos;app
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
