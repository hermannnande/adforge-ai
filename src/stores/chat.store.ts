import { create } from 'zustand';
import { authFetch } from '@/lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChatAuthInfo {
  getToken: () => Promise<string | null>;
  userId?: string | null;
  sessionId?: string | null;
}

interface Brief {
  productName: string | null;
  productCategory: string | null;
  targetAudience: string | null;
  objective: string | null;
  offer: string | null;
  tone: string | null;
  style: string | null;
  platform: string | null;
  constraints: string[];
  rawInput: string;
}

interface Strategy {
  suggestions: Array<{
    headline: string;
    subHeadline: string;
    cta: string;
    visualConcept: string;
    colorMood: string;
    reasoning: string;
  }>;
  recommendedApproach: string;
  toneAdvice: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  brief: Brief | null;
  strategy: Strategy | null;
  shouldGenerate: boolean;
  selectedSuggestionIndex: number;

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBrief: (brief: Brief | null) => void;
  setStrategy: (strategy: Strategy | null) => void;
  setShouldGenerate: (should: boolean) => void;
  setSelectedSuggestion: (index: number) => void;
  reset: () => void;

  sendMessage: (projectId: string, content: string, auth?: ChatAuthInfo) => Promise<void>;
}

let messageCounter = 0;

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text.trim()) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      res.ok
        ? 'Réponse du serveur invalide (JSON attendu).'
        : `Erreur ${res.status} : ${text.slice(0, 200)}`,
    );
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  brief: null,
  strategy: null,
  shouldGenerate: false,
  selectedSuggestionIndex: 0,

  addMessage: (msg) => {
    const message: ChatMessage = {
      ...msg,
      id: `msg-${++messageCounter}`,
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setBrief: (brief) => set({ brief }),
  setStrategy: (strategy) => set({ strategy }),
  setShouldGenerate: (should) => set({ shouldGenerate: should }),
  setSelectedSuggestion: (index) => set({ selectedSuggestionIndex: index }),

  reset: () =>
    set({
      messages: [],
      isLoading: false,
      error: null,
      brief: null,
      strategy: null,
      shouldGenerate: false,
      selectedSuggestionIndex: 0,
    }),

  sendMessage: async (projectId, content, auth) => {
    const { addMessage, setLoading, setError, setBrief, setStrategy, setShouldGenerate } = get();

    if (!projectId?.trim()) {
      const errMessage = 'Projet introuvable : identifiant manquant.';
      setError(errMessage);
      addMessage({
        role: 'assistant',
        content: `Désolé, une erreur est survenue : ${errMessage}`,
      });
      return;
    }

    addMessage({ role: 'user', content });
    setLoading(true);
    setError(null);

    try {
      const fetchOpts: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, message: content }),
      };

      const res = auth
        ? await authFetch('/api/ai/chat', auth, fetchOpts)
        : await fetch('/api/ai/chat', fetchOpts);

      const data = (await parseJsonResponse(res)) as {
        error?: string;
        message?: string;
        brief?: Brief | null;
        strategy?: Strategy | null;
        shouldGenerate?: boolean;
      };

      if (!res.ok) {
        const apiError =
          typeof data.error === 'string' && data.error.trim()
            ? data.error
            : `Erreur ${res.status} : impossible de joindre l'IA.`;
        throw new Error(apiError);
      }

      if (typeof data.message !== 'string' || !data.message.trim()) {
        throw new Error("Réponse de l'IA vide ou invalide.");
      }

      addMessage({ role: 'assistant', content: data.message });

      if (data.brief) setBrief(data.brief);
      if (data.strategy) setStrategy(data.strategy);
      setShouldGenerate(data.shouldGenerate ?? false);
    } catch (err) {
      let errMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      if (/fetch failed|network|abort|timeout/i.test(errMessage)) {
        errMessage = 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.';
      }
      setError(errMessage);
      addMessage({
        role: 'assistant',
        content: errMessage,
      });
    } finally {
      setLoading(false);
    }
  },
}));
