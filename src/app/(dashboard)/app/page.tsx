'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  FolderOpen,
  ImageIcon,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { authFetch } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardData {
  firstName: string;
  projectsCount: number;
  balance: number;
  creditsTotal: number;
  planLabel: string;
  generationsThisMonth: number;
  recentProjects: {
    id: string;
    name: string;
    platform: string;
    date: string;
    gradient: string;
  }[];
}

const SUGGESTIONS = [
  { label: 'Affiche Facebook Ads', prompt: 'Crée une affiche publicitaire pour Facebook Ads', icon: '📢' },
  { label: 'Story Instagram', prompt: 'Crée une story Instagram promotionnelle', icon: '📱' },
  { label: 'Flyer promotionnel', prompt: 'Crée un flyer promotionnel A5', icon: '📄' },
  { label: 'Bannière TikTok', prompt: 'Crée une bannière publicitaire TikTok', icon: '🎵' },
];

const PLATFORM_LABELS: Record<string, string> = {
  FACEBOOK_ADS: 'Facebook Ads',
  INSTAGRAM_FEED: 'Instagram',
  INSTAGRAM_STORY: 'Story',
  TIKTOK_ADS: 'TikTok',
  FLYER_PRINT: 'Flyer',
  CUSTOM: 'Generique',
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}j`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { getToken, sessionId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    authFetch('/api/dashboard', { getToken, userId: user?.id, sessionId })
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken, isLoaded, isSignedIn, sessionId, user?.id]);

  async function handleCreate(text?: string) {
    const value = (text ?? prompt).trim();
    if (!value || creating) return;
    setCreating(true);
    try {
      const res = await authFetch(
        '/api/projects/quick-create',
        { getToken, userId: user?.id, sessionId },
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: value }),
        },
      );
      const result = await res.json();
      if (result.projectId) {
        router.push(`/app/projects/${result.projectId}?prompt=${encodeURIComponent(value)}`);
      }
    } catch {
      setCreating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  }

  const firstName = data?.firstName ?? user?.firstName ?? '';

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-4">
      {/* Hero section */}
      <div className="flex flex-1 flex-col items-center justify-center pb-8 pt-8 lg:pt-16">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
        </div>

        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight lg:text-3xl">
          {loading
            ? 'Chargement...'
            : firstName
              ? `Bonjour ${firstName}, que souhaitez-vous créer ?`
              : 'Que souhaitez-vous créer ?'}
        </h1>

        <p className="mt-2 text-center text-sm text-muted-foreground lg:text-base">
          Décrivez votre visuel et l&apos;IA s&apos;occupe du reste.
        </p>

        {/* Main input */}
        <div className="relative mt-8 w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg shadow-black/5 transition-shadow focus-within:border-primary/40 focus-within:shadow-primary/10">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex : Crée une affiche publicitaire pour des sneakers avec un style urbain..."
              rows={3}
              disabled={creating}
              className="w-full resize-none bg-transparent px-5 pt-5 pb-14 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 lg:text-base"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {data && (
                <span className="hidden text-xs text-muted-foreground sm:inline-flex sm:items-center sm:gap-1">
                  <Zap className="size-3" />
                  {data.balance} crédits
                </span>
              )}
              <button
                onClick={() => handleCreate()}
                disabled={!prompt.trim() || creating}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
                  prompt.trim() && !creating
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.97]'
                    : 'bg-muted text-muted-foreground cursor-not-allowed',
                )}
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                {creating ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>

        {/* Suggestion chips */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handleCreate(s.prompt)}
              disabled={creating}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground active:scale-[0.97] disabled:opacity-50"
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-border/40 bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FolderOpen className="size-3.5" />
            {data.projectsCount} projet{data.projectsCount !== 1 ? 's' : ''}
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5" />
            {data.balance} / {data.creditsTotal} crédits
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <span className="flex items-center gap-1.5">
            <ImageIcon className="size-3.5" />
            {data.generationsThisMonth} génération{data.generationsThisMonth !== 1 ? 's' : ''} ce mois
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <Badge variant="outline" className="text-xs font-normal">
            {data.planLabel}
          </Badge>
        </div>
      )}

      {/* Recent projects */}
      {data && data.recentProjects.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">
              Projets récents
            </h2>
            <Link
              href="/app/projects"
              className="text-xs font-medium text-primary hover:underline"
            >
              Voir tout
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`/app/projects/${p.id}`}
                className="group block"
              >
                <Card className="gap-0 overflow-hidden py-0 transition-all group-hover:shadow-md group-hover:border-primary/20">
                  <div
                    className={cn(
                      'h-24 w-full bg-gradient-to-br',
                      p.gradient,
                    )}
                  />
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {PLATFORM_LABELS[p.platform] ?? p.platform} &middot; {relativeTime(p.date)}
                      </p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
