'use client';

import { useRef, useEffect, useState, useMemo, type FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ArrowUp, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStore, type ChatAuthInfo } from '@/stores/chat.store';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  'Crée une affiche pour mon produit',
  'Propose-moi des visuels Instagram',
  'Je veux un flyer promotionnel',
] as const;

interface ChatPanelProps {
  projectId: string;
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const { getToken, userId, sessionId } = useAuth();
  const auth = useMemo<ChatAuthInfo>(
    () => ({ getToken, userId, sessionId }),
    [getToken, userId, sessionId],
  );
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, strategy } = useChatStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    await sendMessage(projectId, trimmed, auth);
    inputRef.current?.focus();
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage(projectId, prompt, auth);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Agent IA</h3>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Décrivez votre besoin</p>
              <p className="mt-1 text-xs text-muted-foreground">
                L&apos;agent IA vous guidera pour créer votre visuel.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="rounded-lg border border-border/70 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'rounded-lg p-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'ml-auto max-w-[85%] bg-primary text-primary-foreground'
                : 'bg-muted text-foreground',
            )}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">L&apos;agent réfléchit…</span>
          </div>
        )}

        {strategy && !isLoading && (
          <StrategySuggestions />
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 border-t p-3">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décrivez votre besoin…"
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
        </Button>
      </form>
    </div>
  );
}

function StrategySuggestions() {
  const { strategy, selectedSuggestionIndex, setSelectedSuggestion } = useChatStore();
  if (!strategy) return null;

  return (
    <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <p className="text-xs font-medium text-primary">Suggestions créatives :</p>
      {strategy.suggestions.map((s, i) => (
        <button
          key={`${s.headline}-${i}`}
          type="button"
          onClick={() => setSelectedSuggestion(i)}
          className={cn(
            'w-full rounded-md border p-2 text-left text-xs transition-colors',
            i === selectedSuggestionIndex
              ? 'border-primary bg-primary/10'
              : 'border-border/50 hover:border-primary/30',
          )}
        >
          <p className="font-semibold">&ldquo;{s.headline}&rdquo;</p>
          <p className="mt-0.5 text-muted-foreground">{s.visualConcept}</p>
        </button>
      ))}
    </div>
  );
}
