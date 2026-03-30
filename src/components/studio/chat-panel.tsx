'use client';

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  ArrowUp,
  Copy,
  Check,
  Loader2,
  RotateCw,
  Sparkles,
  ImagePlus,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore, type ChatAuthInfo } from '@/stores/chat.store';
import { useProjectStore } from '@/stores/project.store';

const QUICK_PROMPTS = [
  'Crée une affiche pour mon produit',
  'Propose des visuels Instagram',
  'Un flyer promotionnel',
] as const;

interface ChatPanelProps {
  projectId: string;
  initialPrompt?: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
        <Sparkles className="size-3.5 text-primary-foreground" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-muted px-4 py-3">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function GeneratingOverlay() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
        <Sparkles className="size-3.5 text-primary-foreground" />
      </div>
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-primary/5 border border-primary/20 px-4 py-3">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span className="text-sm text-primary font-medium">Création du visuel en cours...</span>
      </div>
    </div>
  );
}

function SuggestionCards({
  suggestions,
  onSelect,
}: {
  suggestions: Array<{
    headline: string;
    subHeadline: string;
    cta: string;
    visualConcept: string;
    colorMood: string;
  }>;
  onSelect: (index: number) => void;
}) {
  if (!suggestions.length) return null;
  return (
    <div className="px-4 py-2 space-y-2">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        Suggestions — cliquez pour générer
      </p>
      <div className="grid gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className="group rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]"
          >
            <p className="text-sm font-semibold leading-tight group-hover:text-primary">
              {s.headline}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {s.subHeadline}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {s.cta}
              </span>
              <span className="text-[10px] text-muted-foreground/60 line-clamp-1">
                {s.colorMood}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageAttachments({
  images,
  onRemove,
}: {
  images: { file: File; preview: string }[];
  onRemove: (index: number) => void;
}) {
  if (!images.length) return null;
  return (
    <div className="flex gap-2 px-3 py-2 overflow-x-auto">
      {images.map((img, i) => (
        <div key={i} className="relative shrink-0">
          <img
            src={img.preview}
            alt="Référence"
            className="size-14 rounded-lg object-cover border border-border/40"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm"
          >
            <X className="size-2.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function MessageBubble({
  role,
  content,
  images,
  isLast,
  onRetry,
}: {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
  isLast: boolean;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (isUser) {
    return (
      <div className="flex flex-col items-end px-4 py-1.5 gap-1.5">
        {images && images.length > 0 && (
          <div className="flex gap-1.5 max-w-[85%]">
            {images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Référence"
                className="size-16 rounded-lg object-cover border border-primary/20"
              />
            ))}
          </div>
        )}
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 px-4 py-1.5">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
        <Sparkles className="size-3.5 text-primary-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
        {isLast && (
          <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleCopy}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Copier"
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Régénérer"
              >
                <RotateCw className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPanel({ projectId, initialPrompt }: ChatPanelProps) {
  const { getToken, userId, sessionId } = useAuth();
  const auth = useMemo<ChatAuthInfo>(
    () => ({ getToken, userId, sessionId }),
    [getToken, userId, sessionId],
  );
  const [input, setInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<
    { file: File; preview: string }[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialSent = useRef(false);

  const {
    messages,
    isLoading,
    strategy,
    sendMessage,
    setSelectedSuggestion,
    setShouldGenerate,
  } = useChatStore();
  const isGenerating = useProjectStore((s) => s.isGenerating);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isGenerating]);

  useEffect(() => {
    if (initialPrompt && !initialSent.current && messages.length === 0) {
      initialSent.current = true;
      sendMessage(projectId, initialPrompt, auth);
    }
  }, [initialPrompt, projectId, auth, sendMessage, messages.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const imageUrls = attachedImages.map((img) => img.preview);
    setInput('');
    setAttachedImages([]);

    if (imageUrls.length > 0) {
      const msgWithImages = `${trimmed}\n\n[${imageUrls.length} image(s) de référence jointe(s)]`;
      sendMessage(projectId, msgWithImages, auth);
    } else {
      sendMessage(projectId, trimmed, auth);
    }
    inputRef.current?.focus();
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    sendMessage(projectId, prompt, auth);
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(projectId, lastUserMsg.content, auth);
    }
  };

  const handleSelectSuggestion = useCallback(
    (index: number) => {
      setSelectedSuggestion(index);
      setShouldGenerate(true);
    },
    [setSelectedSuggestion, setShouldGenerate],
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: { file: File; preview: string }[] = [];
    for (let i = 0; i < files.length && attachedImages.length + newImages.length < 4; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newImages.push({ file, preview: URL.createObjectURL(file) });
      }
    }
    setAttachedImages((prev) => [...prev, ...newImages]);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setAttachedImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const showSuggestions =
    strategy &&
    strategy.suggestions.length > 0 &&
    !isLoading &&
    !isGenerating &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === 'assistant';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2.5 border-b px-4 py-3">
        <div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/70">
          <Sparkles className="size-3 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-tight">Agent IA</h3>
          <p className="text-[10px] text-muted-foreground">AdForge AI</p>
        </div>
        {isLoading && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            En réflexion...
          </span>
        )}
        {!isLoading && isGenerating && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-primary">
            <Loader2 className="size-3 animate-spin" />
            Génération...
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
        {messages.length === 0 && !initialPrompt && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
              <Sparkles className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Comment puis-je vous aider ?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Décrivez le visuel que vous souhaitez créer.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => handleQuickPrompt(qp)}
                  className="rounded-xl border border-border/60 px-3 py-2.5 text-left text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-foreground active:scale-[0.98]"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isLast={idx === messages.length - 1 && msg.role === 'assistant'}
            onRetry={
              idx === messages.length - 1 && msg.role === 'assistant'
                ? handleRetry
                : undefined
            }
          />
        ))}

        {showSuggestions && (
          <SuggestionCards
            suggestions={strategy!.suggestions}
            onSelect={handleSelectSuggestion}
          />
        )}

        {isLoading && <TypingIndicator />}
        {!isLoading && isGenerating && <GeneratingOverlay />}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t p-3">
        <ImageAttachments images={attachedImages} onRemove={handleRemoveImage} />
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 transition-colors focus-within:border-primary/30"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Joindre une image de référence"
          >
            <ImagePlus className="size-4" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez votre besoin..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || (!input.trim() && attachedImages.length === 0)}
            className="size-8 shrink-0 rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
