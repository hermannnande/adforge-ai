import { analyzeBrief, type CreativeBrief } from './brief-analyzer';
import { generateCreativeStrategy, type CreativeStrategy } from './creative-strategist';
import { aiRegistry } from '@/server/ai/providers';

export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChatContext {
  projectId: string;
  messages: ChatMessage[];
  brief?: CreativeBrief;
  strategy?: CreativeStrategy;
  brandKit?: {
    name: string;
    tone?: string | null;
    primaryColors: string[];
    secondaryColors: string[];
    fonts: string[];
    preferredCTAs: string[];
    forbiddenWords: string[];
  };
}

export interface ChatResponse {
  message: string;
  brief?: CreativeBrief;
  strategy?: CreativeStrategy;
  shouldGenerate: boolean;
  metadata: Record<string, unknown>;
}

export async function processChat(userMessage: string, context: ChatContext): Promise<ChatResponse> {
  const provider = aiRegistry.getDefaultTextProvider();

  let brief = context.brief;
  if (!brief || context.messages.length <= 2) {
    brief = await analyzeBrief(userMessage, {
      brandKit: context.brandKit
        ? {
            name: context.brandKit.name,
            tone: context.brandKit.tone,
            forbiddenWords: context.brandKit.forbiddenWords,
          }
        : undefined,
      previousMessages: context.messages.map((m) => ({ role: m.role, content: m.content })),
    });
  }

  const hasEnoughInfo = Boolean(brief.productName || brief.objective || brief.productCategory);
  const isAskingToGenerate = /g[ée]n[eè]r|cr[ée]|fais|montre|lance|visuel|affiche|image/i.test(
    userMessage,
  );

  let strategy = context.strategy;
  if (hasEnoughInfo && isAskingToGenerate && !strategy) {
    strategy = await generateCreativeStrategy(brief, {
      count: 3,
      brandKit: context.brandKit
        ? {
            primaryColors: context.brandKit.primaryColors,
            tone: context.brandKit.tone,
            preferredCTAs: context.brandKit.preferredCTAs,
          }
        : undefined,
    });
  }

  const systemPrompt = `Tu es l'assistant créatif AdForge AI. Tu aides les utilisateurs à créer des visuels publicitaires professionnels.

Règles :
- Sois concis, professionnel mais amical, et en français
- Si le brief est incomplet, pose UNE question pour obtenir l'info manquante la plus importante
- Si tu as assez d'infos et une stratégie, présente les suggestions de façon engageante
- Ne répète jamais le contenu JSON — reformule naturellement
- Si l'utilisateur valide, confirme que la génération va commencer
- Utilise des emojis avec parcimonie (max 1-2 par message)

${context.brandKit ? `Brand Kit actif : "${context.brandKit.name}"` : ''}

Brief actuel : ${JSON.stringify(brief)}
${strategy ? `Stratégie proposée : ${JSON.stringify(strategy)}` : ''}`;

  const conversationHistory = context.messages
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'Client' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const result = await provider.generateText({
    systemPrompt,
    userPrompt: `${conversationHistory ? `Historique récent:\n${conversationHistory}\n\n` : ''}Client: ${userMessage}`,
    temperature: 0.6,
    maxTokens: 600,
  });

  const shouldGenerate = Boolean(strategy && isAskingToGenerate && hasEnoughInfo);

  return {
    message: result.text,
    brief,
    strategy: strategy ?? undefined,
    shouldGenerate,
    metadata: {
      provider: result.provider,
      model: result.model,
      durationMs: result.durationMs,
      usage: result.usage,
    },
  };
}
