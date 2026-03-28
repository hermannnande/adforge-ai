'use client';

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  type FormEvent,
} from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  ArrowUp,
  Copy,
  Check,
  Loader2,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatStore, type ChatAuthInfo } from '@/stores/chat.store';

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

function MessageBubble({
  role,
  content,
  isLast,
  onRetry,
}: {
  role: 'user' | 'assistant' | 'system';
  content: string;
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
      <div className="flex justify-end px-4 py-1.5">
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
        <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-2.5 text-sm leading-relaxed">
          {content}
        </div>
        {isLast && (
          <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleCopy}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Copier"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialSent = useRef(false);

  const { messages, isLoading, sendMessage } = useChatStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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
    setInput('');
    sendMessage(projectId, trimmed, auth);
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

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
            En reflexion...
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

        {isLoading && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t p-3">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 transition-colors focus-within:border-primary/30"
        >
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
            disabled={isLoading || !input.trim()}
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
