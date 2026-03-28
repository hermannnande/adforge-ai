'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Show, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/pricing', label: 'Tarifs' },
  { href: '/examples', label: 'Exemples' },
  { href: '/faq', label: 'FAQ' },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Show when="signed-out">
            <Link
              href="/login"
              className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Commencer gratuitement
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/app"
              className="inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: { avatarBox: 'size-8' },
              }}
            />
          </Show>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: 'size-8' } }} />
          </Show>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/50 md:hidden"
          >
            <div className="space-y-1 px-4 pb-4 pt-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm font-medium',
                    'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-3">
                <Show when="signed-out">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-9 w-full items-center justify-center rounded-md border border-border bg-background text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    Commencer gratuitement
                  </Link>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/app"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    Dashboard
                  </Link>
                </Show>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
