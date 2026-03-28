import { create } from 'zustand';

export interface OnboardingData {
  brandName: string;
  logoFile: File | null;
  primaryColor: string;
  secondaryColor: string;
  objective: string;
  platform: string;
}

interface OnboardingState {
  step: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

const INITIAL_DATA: OnboardingData = {
  brandName: '',
  logoFile: null,
  primaryColor: '#6366f1',
  secondaryColor: '#f59e0b',
  objective: '',
  platform: '',
};

export const ONBOARDING_STEPS = [
  { id: 1, title: 'Votre marque', description: 'Donnez un nom à votre espace' },
  { id: 2, title: 'Votre logo', description: 'Uploadez votre logo (optionnel)' },
  { id: 3, title: 'Vos couleurs', description: 'Choisissez votre palette' },
  { id: 4, title: 'Votre objectif', description: 'Que souhaitez-vous créer ?' },
] as const;

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  step: 1,
  data: INITIAL_DATA,
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, TOTAL_STEPS + 1) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  updateData: (partial) => set((s) => ({ data: { ...s.data, ...partial } })),
  reset: () => set({ step: 1, data: INITIAL_DATA }),
}));
