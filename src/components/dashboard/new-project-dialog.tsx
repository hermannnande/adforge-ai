'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { PlatformTarget } from '@prisma/client';
import { FolderPlus, Loader2, Plus } from 'lucide-react';

import { createProject } from '@/server/actions/project.actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const PLATFORM_OPTIONS: { value: PlatformTarget; label: string }[] = [
  { value: 'FACEBOOK_ADS', label: 'Facebook Ads' },
  { value: 'INSTAGRAM_FEED', label: 'Fil Instagram' },
  { value: 'INSTAGRAM_STORY', label: 'Story Instagram' },
  { value: 'TIKTOK_ADS', label: 'TikTok Ads' },
  { value: 'FLYER_PRINT', label: 'Flyer / print' },
  { value: 'CUSTOM', label: 'Générique' },
];

const PLATFORM_SELECT_ITEMS: Record<string, string> = Object.fromEntries(
  PLATFORM_OPTIONS.map((o) => [o.value, o.label])
);

function NewProjectForm({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [platform, setPlatform] = React.useState<PlatformTarget>('FACEBOOK_ADS');
  const [objective, setObjective] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Le nom du projet est requis.');
      return;
    }

    startTransition(async () => {
      try {
        await createProject({
          name: trimmed,
          platform,
          objective: objective.trim() || undefined,
        });
        setName('');
        setPlatform('FACEBOOK_ADS');
        setObjective('');
        onCreated();
        router.refresh();
      } catch {
        setError('Impossible de créer le projet. Réessayez.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="new-project-name">Nom du projet</Label>
        <Input
          id="new-project-name"
          name="name"
          required
          autoComplete="off"
          placeholder="Ex. Campagne été 2026"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          disabled={pending}
          aria-invalid={Boolean(error)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="new-project-platform">Plateforme</Label>
        <Select
          items={PLATFORM_SELECT_ITEMS}
          value={platform}
          onValueChange={(v) => {
            if (v) setPlatform(v as PlatformTarget);
          }}
        >
          <SelectTrigger id="new-project-platform" className="w-full min-w-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATFORM_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="new-project-objective">Objectif (optionnel)</Label>
        <Textarea
          id="new-project-objective"
          name="objective"
          placeholder="Décrivez le brief ou l’objectif de la campagne…"
          value={objective}
          onChange={(ev) => setObjective(ev.target.value)}
          disabled={pending}
          rows={3}
          className="min-h-[4.5rem] resize-y"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Création…
            </>
          ) : (
            'Créer le projet'
          )}
        </Button>
      </div>
    </form>
  );
}

export function NewProjectDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Nouveau projet</DialogTitle>
          <DialogDescription>
            Donnez un nom à votre projet et choisissez une plateforme cible. Vous
            pourrez affiner le brief ensuite.
          </DialogDescription>
        </DialogHeader>
        <NewProjectForm onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function NewProjectToolbarTrigger() {
  return (
    <DialogTrigger
      render={
        <Button className="shrink-0">
          <Plus className="mr-2 size-4" />
          Nouveau projet
        </Button>
      }
    />
  );
}

export function NewProjectEmptyTrigger() {
  return (
    <DialogTrigger
      render={
        <Button size="lg" className="mt-2">
          <FolderPlus className="mr-2 size-4" />
          Créer un projet
        </Button>
      }
    />
  );
}
