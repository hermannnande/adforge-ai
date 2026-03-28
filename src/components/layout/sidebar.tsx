'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CreditCard,
  FolderOpen,
  HelpCircle,
  Home,
  LayoutGrid,
  Library,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/ui.store';

const MAIN_NAV = [
  { href: '/app', icon: Home, label: 'Tableau de bord' },
  { href: '/app/projects', icon: FolderOpen, label: 'Projets' },
  { href: '/app/library', icon: Library, label: 'Bibliothèque' },
  { href: '/app/brand-kits', icon: Palette, label: 'Brand Kits' },
  { href: '/app/templates', icon: LayoutGrid, label: 'Templates' },
] as const;

const BOTTOM_NAV = [
  { href: '/app/billing', icon: CreditCard, label: 'Facturation' },
  { href: '/app/settings', icon: HelpCircle, label: 'Paramètres' },
  { href: '/app/support', icon: HelpCircle, label: 'Support' },
] as const;

function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
  active,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  collapsed: boolean;
  active: boolean;
}) {
  const linkContent = (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        collapsed && 'justify-center px-2',
      )}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span />}>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex h-dvh flex-col border-r border-sidebar-border bg-sidebar"
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Logo iconOnly={collapsed} />
        <Button
          variant="ghost"
          size="icon"
          className={cn('size-8 shrink-0', collapsed && 'mx-auto')}
          onClick={toggle}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      <div className="px-3 pb-2">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={<Button size="icon" className="w-full" nativeButton={false} render={<Link href="/app/projects?new=true" />} />}
            >
              <Plus className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="right">Nouveau projet</TooltipContent>
          </Tooltip>
        ) : (
          <Button className="w-full justify-start gap-2" nativeButton={false} render={<Link href="/app/projects?new=true" />}>
            <Sparkles className="size-4" />
            Nouveau projet
          </Button>
        )}
      </div>

      <Separator className="mx-3 w-auto" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {MAIN_NAV.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={
              pathname === item.href ||
              (item.href !== '/app' && pathname.startsWith(item.href))
            }
          />
        ))}
      </nav>

      <Separator className="mx-3 w-auto" />

      <nav className="space-y-1 px-3 py-3">
        {BOTTOM_NAV.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-primary/5 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Crédits restants</span>
              <span className="text-sm font-bold text-primary">--</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-primary/10">
              <div className="h-full w-0 rounded-full bg-primary transition-all" />
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
