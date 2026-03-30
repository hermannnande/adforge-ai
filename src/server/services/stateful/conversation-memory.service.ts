import { prisma } from '@/lib/db/prisma';
import { aiRegistry } from '@/server/ai/providers';

export interface ConversationMemory {
  projectGoal: string | null;
  approvedProductReference: string | null;
  approvedVisualDirection: string | null;
  approvedTone: string | null;
  approvedAudience: string | null;
  approvedPlatform: string | null;
  approvedFormat: string | null;
  lockedInstructions: string[];
  pendingInstructions: string[];
  fullSummary: string;
  messageCount: number;
  lastUserMessage: string;
}

function extractInstructionsHeuristic(
  messages: Array<{ role: string; content: string }>,
): ConversationMemory {
  let projectGoal: string | null = null;
  let approvedTone: string | null = null;
  let approvedAudience: string | null = null;
  let approvedPlatform: string | null = null;
  let approvedFormat: string | null = null;
  let approvedProductReference: string | null = null;
  let approvedVisualDirection: string | null = null;
  const locked: string[] = [];
  const pending: string[] = [];

  const userMessages = messages.filter((m) => m.role === 'USER' || m.role === 'user');
  const lastUser = userMessages[userMessages.length - 1]?.content ?? '';

  for (const msg of userMessages) {
    const c = msg.content.toLowerCase();

    if (/affiche|poster|visuel|pub|ad|flyer/i.test(c) && !projectGoal) {
      projectGoal = msg.content;
    }

    if (/premium|luxe|élégant|minimaliste|professionnel|fun|dynamique/i.test(c)) {
      approvedTone = c.match(/(premium|luxe|élégant|minimaliste|professionnel|fun|dynamique)/i)?.[1] ?? approvedTone;
    }

    if (/facebook|instagram|story|linkedin|tiktok|youtube/i.test(c)) {
      approvedPlatform = c.match(/(facebook|instagram|story|linkedin|tiktok|youtube)/i)?.[1] ?? approvedPlatform;
    }

    if (/portrait|paysage|carré|16.9|9.16/i.test(c)) {
      approvedFormat = c.match(/(portrait|paysage|carré|16.9|9.16)/i)?.[1] ?? approvedFormat;
    }

    if (/mon produit|le produit|ce produit|utilise.*image|voici.*produit/i.test(c)) {
      approvedProductReference = msg.content;
    }

    if (/garde|conserve|préserve|ne change pas|même/i.test(c)) {
      locked.push(msg.content);
    }

    if (/ajoute|modifie|change|remplace|plus|moins/i.test(c)) {
      pending.push(msg.content);
    }

    if (/réaliste|photoréaliste|fond.*noir|fond.*blanc|femme|homme|scène/i.test(c)) {
      approvedVisualDirection = msg.content;
    }

    if (/jeune|adulte|femme|homme|professionnel|parent/i.test(c)) {
      approvedAudience = c.match(/(jeune|adulte|femme|homme|professionnel|parent)/i)?.[1] ?? approvedAudience;
    }
  }

  const summary = userMessages
    .slice(-8)
    .map((m) => m.content)
    .join(' | ');

  return {
    projectGoal,
    approvedProductReference,
    approvedVisualDirection,
    approvedTone,
    approvedAudience,
    approvedPlatform,
    approvedFormat,
    lockedInstructions: locked.slice(-5),
    pendingInstructions: pending.slice(-3),
    fullSummary: summary,
    messageCount: messages.length,
    lastUserMessage: lastUser,
  };
}

export const conversationMemoryService = {
  async summarize(projectId: string): Promise<ConversationMemory> {
    const conversation = await prisma.conversation.findFirst({
      where: { projectId },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 50 },
      },
    });

    if (!conversation || conversation.messages.length === 0) {
      return {
        projectGoal: null,
        approvedProductReference: null,
        approvedVisualDirection: null,
        approvedTone: null,
        approvedAudience: null,
        approvedPlatform: null,
        approvedFormat: null,
        lockedInstructions: [],
        pendingInstructions: [],
        fullSummary: '',
        messageCount: 0,
        lastUserMessage: '',
      };
    }

    const messages = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const heuristic = extractInstructionsHeuristic(messages);

    const provider = aiRegistry.getDefaultTextProviderOrNull();
    if (!provider || messages.length < 4) {
      await prisma.project.update({
        where: { id: projectId },
        data: { conversationSummary: heuristic.fullSummary },
      });
      return heuristic;
    }

    try {
      const convoText = messages
        .slice(-15)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      const result = await provider.generateText({
        systemPrompt: `Tu es un analyseur de conversation pour un outil de génération publicitaire.
Analyse cette conversation et extrais un résumé structuré en JSON:
{
  "projectGoal": "objectif du projet",
  "approvedTone": "ton validé",
  "approvedAudience": "audience cible",
  "approvedPlatform": "plateforme cible",
  "lockedInstructions": ["instructions qui ne doivent pas changer"],
  "approvedVisualDirection": "direction visuelle validée",
  "fullSummary": "résumé complet en 2-3 phrases"
}
Réponds UNIQUEMENT en JSON.`,
        userPrompt: convoText,
        temperature: 0.2,
        maxTokens: 500,
        model: 'gpt-4o-mini',
      });

      try {
        const cleaned = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        const enhanced: ConversationMemory = {
          ...heuristic,
          projectGoal: parsed.projectGoal ?? heuristic.projectGoal,
          approvedTone: parsed.approvedTone ?? heuristic.approvedTone,
          approvedAudience: parsed.approvedAudience ?? heuristic.approvedAudience,
          approvedPlatform: parsed.approvedPlatform ?? heuristic.approvedPlatform,
          approvedVisualDirection: parsed.approvedVisualDirection ?? heuristic.approvedVisualDirection,
          lockedInstructions: [
            ...heuristic.lockedInstructions,
            ...(Array.isArray(parsed.lockedInstructions) ? parsed.lockedInstructions : []),
          ].slice(-8),
          fullSummary: parsed.fullSummary ?? heuristic.fullSummary,
        };

        await prisma.project.update({
          where: { id: projectId },
          data: { conversationSummary: enhanced.fullSummary },
        });

        return enhanced;
      } catch {
        return heuristic;
      }
    } catch {
      return heuristic;
    }
  },
};
