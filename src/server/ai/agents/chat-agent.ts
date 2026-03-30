import { analyzeBrief, emptyBrief, type CreativeBrief } from './brief-analyzer';
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
  referenceImageUrls?: string[];
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

const GENERATION_KEYWORDS =
  /g[ée]n[eè]r|cr[ée]|fais|montre|lance|visuel|affiche|image|poster|photo|design|logo/i;

function humanizeAIError(raw: string): string {
  if (/429|quota|exceeded|billing/i.test(raw)) {
    return (
      'Notre service de génération a atteint sa limite temporaire d\'utilisation. ' +
      'Pas d\'inquiétude, vos projets et données sont sauvegardés. ' +
      'Le service sera rétabli très prochainement — réessayez dans quelques minutes.'
    );
  }
  if (/401|invalid.*key|authentication/i.test(raw)) {
    return (
      'Le service de génération rencontre un problème de configuration. ' +
      'Notre équipe technique en a été informée. Veuillez réessayer ultérieurement.'
    );
  }
  if (/timeout|timed?\s*out|ECONNRESET/i.test(raw)) {
    return 'La génération prend plus de temps que prévu. Veuillez réessayer dans quelques instants.';
  }
  if (/500|502|503|overloaded|capacity/i.test(raw)) {
    return 'Nos serveurs de génération sont temporairement surchargés. Réessayez dans 1 à 2 minutes.';
  }
  return 'Une erreur inattendue s\'est produite. Réessayez ou contactez le support si le problème persiste.';
}

/**
 * Builds a basic brief from the raw user message when AI text analysis
 * is unavailable (e.g. OpenAI quota exhausted). Uses simple heuristics.
 */
function buildFallbackBrief(userMessage: string): CreativeBrief {
  const msg = userMessage.toLowerCase();

  const categories: Record<string, string> = {
    'basket|sneaker|chaussure|shoe|nike|adidas|jordan': 'mode',
    'restaurant|food|nourriture|pizza|burger|café|coffee': 'restauration',
    'beaut[ée]|cosm[ée]ti|maquillage|skin|cream|parfum|soin': 'beauté',
    'immobilier|maison|appartement|house|villa': 'immobilier',
    'tech|app|logiciel|saas|mobile': 'technologie',
    'sport|fitness|gym|muscul': 'sport',
    'voiture|auto|car|v[ée]hicule': 'automobile',
    'v[eê]tement|robe|costume|mode|fashion|tshirt|t-shirt': 'mode',
    'cr[eè]me|verrue|peau|derma|pharma|médicament|santé': 'santé',
  };

  let productCategory: string | null = null;
  for (const [pattern, cat] of Object.entries(categories)) {
    if (new RegExp(pattern, 'i').test(msg)) {
      productCategory = cat;
      break;
    }
  }

  const stopWords =
    /\b(une?|des?|du|le|la|les|de|pour|avec|sur|dans|mon|ma|mes|un|ce|cette|qui|que|au|aux|en|et|ou|je|tu|il|nous|vous|ils|cre[eé]|genere|fais|fait|lance|montre|image|visuel|affiche|poster|photo|format|portrait|paysage)\b/gi;

  const cleaned = userMessage.replace(stopWords, ' ').replace(/\s+/g, ' ').trim();
  const productName = cleaned.length > 2 ? cleaned : userMessage;

  const formatMatch = msg.match(/format\s*(portrait|paysage|carré|square|story|stories|16.9|9.16|4.3)/i);
  const style = formatMatch ? formatMatch[1] : null;

  const tonePatterns: Record<string, string> = {
    'luxe|premium|haut de gamme|élégant': 'premium',
    'fun|drôle|cool|jeune|dynamique': 'fun et dynamique',
    'sérieux|corporate|professionnel|business': 'professionnel',
    'naturel|bio|eco|vert': 'naturel et authentique',
  };
  let tone = 'moderne';
  for (const [pattern, t] of Object.entries(tonePatterns)) {
    if (new RegExp(pattern, 'i').test(msg)) {
      tone = t;
      break;
    }
  }

  return {
    productName,
    productCategory,
    targetAudience: null,
    objective: 'promotion',
    offer: null,
    tone,
    style,
    platform: null,
    constraints: [],
    rawInput: userMessage,
  };
}

function buildFallbackStrategy(brief: CreativeBrief): CreativeStrategy {
  const name = brief.productName ?? 'produit';
  const cat = brief.productCategory ?? 'produit';
  const tone = brief.tone ?? 'moderne';

  return {
    suggestions: [
      {
        headline: name.charAt(0).toUpperCase() + name.slice(1),
        subHeadline: `Le meilleur choix en ${cat}`,
        cta: 'Découvrir',
        visualConcept:
          `${name}, photographie publicitaire professionnelle, ` +
          `composition soignée sur fond ${tone === 'premium' ? 'noir élégant avec reflets dorés' : 'épuré et lumineux'}, ` +
          `éclairage studio, rendu haute qualité, style ${tone}`,
        colorMood:
          tone === 'premium'
            ? 'Noir, or et blanc — ambiance luxe'
            : tone === 'fun et dynamique'
              ? 'Couleurs vives et contrastées — ambiance énergique'
              : 'Tons neutres et modernes — ambiance professionnelle',
        reasoning: `Visuel ${cat} avec un rendu ${tone}`,
      },
    ],
    recommendedApproach: `Visuel centré sur ${name} avec une approche ${tone}.`,
    toneAdvice: `Ton ${tone} adapté au secteur ${cat}.`,
  };
}

export async function processChat(userMessage: string, context: ChatContext): Promise<ChatResponse> {
  const provider = aiRegistry.getDefaultTextProviderOrNull();
  const isAskingToGenerate = GENERATION_KEYWORDS.test(userMessage);

  if (!provider) {
    if (isAskingToGenerate) {
      const brief = buildFallbackBrief(userMessage);
      const strategy = buildFallbackStrategy(brief);
      return {
        message:
          `Parfait, je prépare votre visuel "${brief.productName ?? userMessage}" ! ` +
          'Voici ma proposition — la génération est en cours.',
        brief,
        strategy,
        shouldGenerate: true,
        metadata: { directMode: true },
      };
    }
    return {
      message:
        'Je suis prêt à créer vos visuels ! Décrivez ce que vous souhaitez, ' +
        'par exemple : "Crée une affiche pour mon produit".',
      brief: context.brief ?? emptyBrief(userMessage),
      strategy: context.strategy,
      shouldGenerate: false,
      metadata: { unavailable: true },
    };
  }

  let brief: CreativeBrief | undefined = context.brief;
  let strategy: CreativeStrategy | undefined = context.strategy;

  try {
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
      model: 'gpt-4o-mini',
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
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);

    if (isAskingToGenerate) {
      const fallbackBrief = brief ?? buildFallbackBrief(userMessage);
      const fallbackStrategy = strategy ?? buildFallbackStrategy(fallbackBrief);
      return {
        message:
          `C'est noté ! Je lance la création de votre visuel "${fallbackBrief.productName ?? userMessage}". ` +
          'Voici ma suggestion — génération en cours.',
        brief: fallbackBrief,
        strategy: fallbackStrategy,
        shouldGenerate: true,
        metadata: { directMode: true, originalError: raw },
      };
    }

    const friendly = humanizeAIError(raw);
    return {
      message: friendly,
      brief: brief ?? context.brief ?? emptyBrief(userMessage),
      strategy: strategy ?? context.strategy,
      shouldGenerate: false,
      metadata: { error: true, message: raw },
    };
  }
}
