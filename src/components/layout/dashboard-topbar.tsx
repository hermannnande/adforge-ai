'use client';

import { Bell, Search } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './theme-toggle';
import { MobileNav } from './mobile-nav';

export function DashboardTopbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un projet..." className="h-9 w-64 pl-9 lg:w-80" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="size-9">
          <Bell className="size-4" />
        </Button>
        <UserButton
          appearance={{
            elements: { avatarBox: 'size-8' },
          }}
        />
      </div>
    </header>
  );
}
