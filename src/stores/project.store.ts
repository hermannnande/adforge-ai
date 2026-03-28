import { create } from 'zustand';
import { authFetch } from '@/lib/api';
import type { ChatAuthInfo } from './chat.store';

export interface GeneratedImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

interface ProjectState {
  currentProjectId: string | null;
  generatedImages: GeneratedImage[];
  isGenerating: boolean;
  generationError: string | null;
  selectedImageId: string | null;
  imagesLoaded: boolean;

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
    options?: { qualityMode?: string; platform?: string },
  ) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProjectId: null,
  generatedImages: [],
  isGenerating: false,
  generationError: null,
  selectedImageId: null,
  imagesLoaded: false,

  setCurrentProject: (id) => set({ currentProjectId: id }),
  addGeneratedImages: (images) =>
    set((state) => ({ generatedImages: [...images, ...state.generatedImages] })),
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
    }),

  loadImages: async (projectId, auth) => {
    if (get().imagesLoaded) return;
    try {
      const res = await authFetch(`/api/projects/${projectId}/images`, auth);
      if (!res.ok) return;
      const data = await res.json();
      const images: GeneratedImage[] = (data.images ?? []).map(
        (img: { id: string; url: string; width: number; height: number }) => ({
          id: img.id,
          url: img.url,
          width: img.width,
          height: img.height,
        }),
      );
      set({ generatedImages: images, imagesLoaded: true });
    } catch {
      // silent fail on load
    }
  },

  triggerGeneration: async (projectId, brief, suggestion, auth, options) => {
    const { setGenerating, setGenerationError, addGeneratedImages } = get();
    setGenerating(true);
    setGenerationError(null);

    try {
      const res = await authFetch(
        `/api/projects/${projectId}/generate`,
        auth,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brief,
            suggestion,
            qualityMode: options?.qualityMode ?? 'STANDARD',
            platform: options?.platform ?? 'facebook',
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de génération');
      }

      const images: GeneratedImage[] = (data.images ?? []).map(
        (img: { id: string; url: string; width: number; height: number }) => ({
          id: img.id,
          url: img.url,
          width: img.width,
          height: img.height,
        }),
      );

      addGeneratedImages(images);
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
