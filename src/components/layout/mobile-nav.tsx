'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  FolderOpen,
  HelpCircle,
  Home,
  LayoutGrid,
  Library,
  Menu,
  Palette,
  Settings,
  Sparkles,
} from 'lucide-react';

const ALL_NAV = [
  { href: '/app', icon: Home, label: 'Tableau de bord' },
  { href: '/app/projects', icon: FolderOpen, label: 'Projets' },
  { href: '/app/library', icon: Library, label: 'Bibliothèque' },
  { href: '/app/brand-kits', icon: Palette, label: 'Brand Kits' },
  { href: '/app/templates', icon: LayoutGrid, label: 'Templates' },
  { href: '/app/billing', icon: CreditCard, label: 'Facturation' },
  { href: '/app/settings', icon: Settings, label: 'Paramètres' },
  { href: '/app/support', icon: HelpCircle, label: 'Support' },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="size-9 lg:hidden" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-4 py-4">
          <Logo />
        </SheetHeader>
        <div className="px-3 py-3">
          <Button
            className="w-full justify-start gap-2"
            nativeButton={false}
            render={<Link href="/app/projects?new=true" />}
            onClick={() => setOpen(false)}
          >
            <Sparkles className="size-4" />
            Nouveau projet
          </Button>
        </div>
        <nav className="space-y-1 px-3">
          {ALL_NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/app' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}
