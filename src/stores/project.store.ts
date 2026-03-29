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
      const bodyPayload: Record<string, unknown> = {
        brief,
        suggestion,
        qualityMode: options?.qualityMode ?? 'STANDARD',
        platform: options?.platform ?? 'facebook',
      };
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
        },
      });

      if (images[0]) {
        set({ selectedImageId: images[0].id });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setGenerationError(msg);
    } finally {
      setGenerating(false);
    }
  },
}));
