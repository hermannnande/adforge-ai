'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImageIcon,
  Palette,
  Rocket,
  Store,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  useOnboardingStore,
  ONBOARDING_STEPS,
  TOTAL_STEPS,
} from '@/stores/onboarding.store';

const OBJECTIVES = [
  { id: 'ecommerce', label: 'Vendre des produits', icon: Store },
  { id: 'social', label: 'Créer du contenu social', icon: ImageIcon },
  { id: 'branding', label: 'Construire ma marque', icon: Palette },
  { id: 'ads', label: 'Lancer des publicités', icon: Rocket },
] as const;

const PLATFORMS = [
  'Facebook Ads',
  'Instagram',
  'TikTok',
  'WhatsApp',
  'Web / Email',
  'Print / Flyer',
] as const;

const COLOR_PRESETS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#1e293b',
] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const { step, data, nextStep, prevStep } = useOnboardingStore();

  const handleComplete = async () => {
    try {
      await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: data.brandName,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          objective: data.objective,
          platform: data.platform,
        }),
      });
    } catch {
      // Non-blocking — onboarding data is nice-to-have
    }
    router.push('/app');
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.brandName.trim().length >= 2;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return data.objective.length > 0;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-lg">
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2">
          {ONBOARDING_STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  step > s.id
                    ? 'bg-primary text-primary-foreground'
                    : step === s.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {step > s.id ? <Check className="size-4" /> : s.id}
              </div>
              {i < ONBOARDING_STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 rounded-full transition-colors',
                    step > s.id ? 'bg-primary' : 'bg-muted',
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3">
          <h2 className="text-lg font-semibold">{ONBOARDING_STEPS[step - 1]?.title}</h2>
          <p className="text-sm text-muted-foreground">
            {ONBOARDING_STEPS[step - 1]?.description}
          </p>
        </div>
      </div>

      <CardContent className="min-h-[280px] pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <StepBrandName />}
            {step === 2 && <StepLogo />}
            {step === 3 && <StepColors />}
            {step === 4 && <StepObjective />}
          </motion.div>
        </AnimatePresence>
      </CardContent>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={prevStep}
          disabled={step === 1}
        >
          <ArrowLeft className="mr-1 size-4" />
          Retour
        </Button>

        {step < TOTAL_STEPS ? (
          <Button size="sm" onClick={nextStep} disabled={!canProceed()}>
            Suivant
            <ArrowRight className="ml-1 size-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleComplete} disabled={!canProceed()}>
            <Rocket className="mr-1 size-4" />
            Commencer à créer
          </Button>
        )}
      </div>
    </Card>
  );
}

function StepBrandName() {
  const { data, updateData } = useOnboardingStore();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brandName">Nom de votre marque ou entreprise</Label>
        <Input
          id="brandName"
          placeholder="Ex: Ma Boutique, Studio Créa, NomDeMaMarque..."
          value={data.brandName}
          onChange={(e) => updateData({ brandName: e.target.value })}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Ce nom sera utilisé dans vos projets et votre Brand Kit.
        </p>
      </div>
    </div>
  );
}

function StepLogo() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center">
        <Upload className="size-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium">Glissez votre logo ici</p>
        <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, SVG — max 5 MB</p>
        <Button variant="outline" size="sm" className="mt-4">
          Parcourir les fichiers
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Vous pourrez ajouter ou modifier votre logo plus tard dans votre Brand Kit.
      </p>
    </div>
  );
}

function StepColors() {
  const { data, updateData } = useOnboardingStore();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Couleur principale</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => updateData({ primaryColor: color })}
              className={cn(
                'size-9 rounded-lg border-2 transition-all',
                data.primaryColor === color
                  ? 'border-foreground scale-110'
                  : 'border-transparent hover:scale-105',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
          <Input
            type="color"
            value={data.primaryColor}
            onChange={(e) => updateData({ primaryColor: e.target.value })}
            className="size-9 cursor-pointer p-0.5"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Couleur secondaire</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => updateData({ secondaryColor: color })}
              className={cn(
                'size-9 rounded-lg border-2 transition-all',
                data.secondaryColor === color
                  ? 'border-foreground scale-110'
                  : 'border-transparent hover:scale-105',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        <div className="size-8 rounded-md" style={{ backgroundColor: data.primaryColor }} />
        <div className="size-8 rounded-md" style={{ backgroundColor: data.secondaryColor }} />
        <span className="text-xs text-muted-foreground">Aperçu de votre palette</span>
      </div>
    </div>
  );
}

function StepObjective() {
  const { data, updateData } = useOnboardingStore();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Quel est votre objectif principal ?</Label>
        <div className="grid grid-cols-2 gap-2">
          {OBJECTIVES.map((obj) => (
            <button
              key={obj.id}
              onClick={() => updateData({ objective: obj.id })}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                data.objective === obj.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30',
              )}
            >
              <obj.icon
                className={cn(
                  'size-6',
                  data.objective === obj.id ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              <span className="text-xs font-medium">{obj.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Plateforme principale</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => updateData({ platform: p })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                data.platform === p
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
