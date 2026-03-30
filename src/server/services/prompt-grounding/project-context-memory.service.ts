import { prisma } from '@/lib/db/prisma';
import type { ProjectMemorySnapshot } from './types';

const OUTPUT_TYPE_PATTERNS: Record<string, RegExp> = {
  poster: /poster|affiche/i,
  banner: /banni[èe]re|banner/i,
  flyer: /flyer|tract|dépliant/i,
  social_ad: /instagram|facebook|story|tiktok|social/i,
  product_shot: /packshot|product\s*shot|photo\s*produit/i,
};

const THEME_PATTERNS: Record<string, RegExp> = {
  beauté: /beaut[ée]|cosm[ée]ti|maquillage|skin|cream|soin|crème/i,
  santé: /pharma|m[ée]dicament|sant[ée]|médical|médecin|traitement/i,
  mode: /mode|fashion|v[eê]tement|chaussure|sneaker|bijou/i,
  food: /restaurant|food|nourriture|pizza|burger|café|boisson/i,
  tech: /tech|app|logiciel|saas|mobile|digital/i,
  immobilier: /immobilier|maison|appartement|villa/i,
  automobile: /voiture|auto|car|véhicule/i,
  luxe: /luxe|luxury|premium|haut\s*de\s*gamme/i,
  sport: /sport|fitness|gym|muscul/i,
};

function detectTheme(text: string): string | null {
  for (const [theme, pattern] of Object.entries(THEME_PATTERNS)) {
    if (pattern.test(text)) return theme;
  }
  return null;
}

function detectOutputType(text: string): string | null {
  for (const [type, pattern] of Object.entries(OUTPUT_TYPE_PATTERNS)) {
    if (pattern.test(text)) return type;
  }
  return null;
}

export const projectContextMemoryService = {
  async buildProjectMemory(projectId: string): Promise<ProjectMemorySnapshot> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        name: true,
        conversationSummary: true,
        lastCanonicalBrief: true,
        conversations: {
          take: 1,
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 30,
              where: { role: 'USER' },
              select: { content: true },
            },
          },
        },
      },
    });

    if (!project) {
      return emptyMemory();
    }

    const userMessages = project.conversations?.[0]?.messages ?? [];
    const allText = userMessages.map((m) => m.content).join(' ');
    const lastBrief = project.lastCanonicalBrief as Record<string, unknown> | null;

    const theme = detectTheme(allText) ?? (lastBrief?.product as Record<string, unknown>)?.category as string ?? null;
    const outputType = detectOutputType(allText);

    let projectGoal: string | null = null;
    let approvedStyleDirection: string | null = null;
    let activeMarketingGoal: string | null = null;

    for (const msg of userMessages) {
      const c = msg.content.toLowerCase();
      if (!projectGoal && /affiche|poster|visuel|pub|bannière|flyer|créatif/i.test(c)) {
        projectGoal = msg.content;
      }
      if (/réaliste|photoréaliste|luxe|premium|minimaliste|moderne|dynamique/i.test(c)) {
        approvedStyleDirection = c.match(/(réaliste|photoréaliste|luxe|premium|minimaliste|moderne|dynamique)/i)?.[1] ?? null;
      }
      if (/vendre|promouvoir|attirer|lancer|campagne/i.test(c)) {
        activeMarketingGoal = msg.content;
      }
    }

    const lockedProductRefs: string[] = [];
    if (lastBrief) {
      const product = lastBrief.product as Record<string, unknown> | undefined;
      if (product?.visualDescription) {
        lockedProductRefs.push(product.visualDescription as string);
      }
    }

    const conversationBrief = lastBrief?.conversation as Record<string, unknown> | undefined;

    return {
      projectTheme: theme,
      projectGoal: projectGoal ?? (conversationBrief?.projectGoal as string) ?? null,
      preferredOutputType: outputType,
      approvedStyleDirection: approvedStyleDirection ?? (conversationBrief?.approvedVisualDirection as string) ?? null,
      lockedProductReferences: lockedProductRefs,
      lockedBrandHints: [],
      lockedVisualIntent: null,
      conversationSummary: project.conversationSummary ?? '',
      lastAcceptedDirection: approvedStyleDirection,
      activeMarketingGoal,
    };
  },

  async updateProjectMemory(
    projectId: string,
    latestPrompt: string,
    _result: { provider: string; accepted: boolean },
  ): Promise<void> {
    const theme = detectTheme(latestPrompt);

    const updateData: Record<string, unknown> = {};
    if (theme) {
      updateData.conversationSummary = `${theme} — ${latestPrompt.slice(0, 200)}`;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.project.update({
        where: { id: projectId },
        data: updateData,
      }).catch(() => {});
    }
  },
};

function emptyMemory(): ProjectMemorySnapshot {
  return {
    projectTheme: null,
    projectGoal: null,
    preferredOutputType: null,
    approvedStyleDirection: null,
    lockedProductReferences: [],
    lockedBrandHints: [],
    lockedVisualIntent: null,
    conversationSummary: '',
    lastAcceptedDirection: null,
    activeMarketingGoal: null,
  };
}
