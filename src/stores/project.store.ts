import { create } from 'zustand';

interface GeneratedImage {
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

  setCurrentProject: (id: string | null) => void;
  addGeneratedImages: (images: GeneratedImage[]) => void;
  setGenerating: (generating: boolean) => void;
  setGenerationError: (error: string | null) => void;
  selectImage: (id: string | null) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProjectId: null,
  generatedImages: [],
  isGenerating: false,
  generationError: null,
  selectedImageId: null,

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
    }),
}));
