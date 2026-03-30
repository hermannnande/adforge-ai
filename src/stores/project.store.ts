import { create } from 'zustand';
import { authFetch } from '@/lib/api';
import type { ChatAuthInfo } from './chat.store';

export interface GeneratedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  provider?: string;
  model?: string;
}

export interface GenerationMeta {
  provider?: string;
  model?: string;
  routerReason?: string;
  creditsCost?: number;
  taskType?: string;
  fallbackUsed?: boolean;
  fallbackProvider?: string;
  qualityScore?: number;
}

interface ProjectState {
  currentProjectId: string | null;
  generatedImages: GeneratedImage[];
  isGenerating: boolean;
  generationError: string | null;
  selectedImageId: string | null;
  imagesLoaded: boolean;
  lastGenerationMeta: GenerationMeta | null;

  setCurrentProject: (id: string | null) => void;
  addGeneratedImages: (images: GeneratedImage[]) => void;
  setGenerating: (generating: boolean) => void;
  setGenerationError: (error: string | null) => void;
  selectImage: (id: string | null) => void;
  reset: () => void;

  loadImages: (projectId: string, auth: ChatAuthInfo) => Promise<void>;
  triggerGeneration: (
    projectId: string,
    brief: unknown,
    suggestion: unknown,
    auth: ChatAuthInfo,
    options?: {
      qualityMode?: string;
      platform?: string;
      provider?: string;
      referenceImageUrls?: string[];
      rawUserPrompt?: string;
    },
  ) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProjectId: null,
  generatedImages: [],
  isGenerating: false,
  generationError: null,
  selectedImageId: null,
  imagesLoaded: false,
  lastGenerationMeta: null,

  setCurrentProject: (id) => set({ currentProjectId: id }),
  addGeneratedImages: (images) =>
    set((state) => ({
      generatedImages: [...images, ...state.generatedImages],
    })),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setGenerationError: (error) => set({ generationError: error }),
  selectImage: (id) => set({ selectedImageId: id }),
  reset: () =>
    set({
      currentProjectId: null,
      generatedImages: [],
      isGenerating: false,
      generationError: null,
      selectedImageId: null,
      imagesLoaded: false,
      lastGenerationMeta: null,
    }),

  loadImages: async (projectId, auth) => {
    if (get().imagesLoaded) return;
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/images`,
        auth,
      );
      if (!res.ok) return;
      const data = await res.json();
      const images: GeneratedImage[] = (data.images ?? []).map(
        (img: Record<string, unknown>) => ({
          id: img.id as string,
          url: img.url as string,
          width: img.width as number,
          height: img.height as number,
          provider: img.provider as string | undefined,
          model: img.model as string | undefined,
        }),
      );
      set({ generatedImages: images, imagesLoaded: true });
    } catch {
      // silent fail on load
    }
  },

  triggerGeneration: async (projectId, brief, suggestion, auth, options) => {
    const { setGenerating, setGenerationError, addGeneratedImages } =
      get();
    setGenerating(true);
    setGenerationError(null);

    try {
      const hasRefImages = options?.referenceImageUrls && options.referenceImageUrls.length > 0;

      const bodyPayload: Record<string, unknown> = {
        brief,
        suggestion,
        qualityMode: options?.qualityMode ?? 'STANDARD',
        platform: options?.platform ?? 'facebook',
      };

      if (hasRefImages) {
        bodyPayload.referenceImageUrls = options!.referenceImageUrls;
      }

      if (options?.rawUserPrompt) {
        bodyPayload.rawUserPrompt = options.rawUserPrompt;
      }

      if (options?.provider) {
        bodyPayload.provider = options.provider;
      }

      const res = await authFetch(
        `/api/projects/${projectId}/generate`,
        auth,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de génération');
      }

      const images: GeneratedImage[] = (data.images ?? []).map(
        (img: Record<string, unknown>) => ({
          id: img.id as string,
          url: img.url as string,
          width: img.width as number,
          height: img.height as number,
          provider: data.provider as string | undefined,
          model: data.model as string | undefined,
        }),
      );

      addGeneratedImages(images);

      set({
        lastGenerationMeta: {
          provider: data.provider,
          model: data.model,
          routerReason: data.routerReason,
          creditsCost: data.creditsCost,
          taskType: data.taskType,
          fallbackUsed: data.fallback?.used ?? false,
          fallbackProvider: data.fallback?.provider,
          qualityScore: data.quality?.score,
        },
      });

      if (images[0]) {
        set({ selectedImageId: images[0].id });
      }
    } catch (err) {
      let msg = err instanceof Error ? err.message : 'Erreur inconnue';
      if (err instanceof DOMException && err.name === 'AbortError') {
        msg = 'La génération a dépassé le temps maximal. Le moteur est peut-être surchargé — réessayez dans un moment.';
      } else if (/fetch failed|network/i.test(msg)) {
        msg = 'Problème de connexion au serveur. Vérifiez votre réseau et réessayez.';
      } else if (/filtré|sécurité|safety|reformuler/i.test(msg)) {
        msg = 'Votre demande a été filtrée par le système de sécurité. Essayez de reformuler votre requête.';
      } else if (/billing|quota|rate.?limit|exceeded|429|403/i.test(msg)) {
        msg = 'Le service de génération est temporairement indisponible. Veuillez réessayer dans quelques instants.';
      } else if (/openai|flux|ideogram|google|nanobanana/i.test(msg)) {
        msg = 'La génération a rencontré une erreur. Veuillez réessayer.';
      }
      setGenerationError(msg);
    } finally {
      setGenerating(false);
    }
  },
}));
